/**
 * Loopify Referral Reward System
 * 
 * Manages user referrals, generates unique codes, and distributes EcoPoints rewards
 * Frontend-only implementation with abuse prevention
 * 
 * Features:
 * - Unique referral code generation (LOOP-XXXX format)
 * - Referral tracking and validation
 * - First-action reward detection
 * - Duplicate prevention (device-level)
 * - Self-referral blocking
 * - Complete audit trail
 */

class ReferralSystem {
  constructor() {
    // Storage keys
    this.USERS_KEY = 'loopify_referral_users';
    this.REFERRAL_TRACKING_KEY = 'loopify_referral_tracking';
    this.DEVICE_FINGERPRINT_KEY = 'loopify_device_fingerprint';
    this.REFERRAL_AUDIT_KEY = 'loopify_referral_audit';
    
    // Configuration
    this.REFERRAL_CODE_PREFIX = 'LOOP';
    this.REFERRAL_CODE_LENGTH = 8; // LOOP-XXXX format
    this.REFERRED_USER_REWARD = 30; // Points for new user
    this.REFERRER_REWARD = 10; // Points for referrer
    this.MAX_REFERRALS_PER_USER = 50; // Abuse prevention
    
    // Initialize system
    this.initializeSystem();
  }

  /**
   * Initialize the referral system on first load
   */
  initializeSystem() {
    console.log('[Referral] System initializing...');
    
    // Create device fingerprint if not exists
    if (!localStorage.getItem(this.DEVICE_FINGERPRINT_KEY)) {
      this.createDeviceFingerprint();
    }

    // Initialize storage structures
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(this.REFERRAL_TRACKING_KEY)) {
      localStorage.setItem(this.REFERRAL_TRACKING_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(this.REFERRAL_AUDIT_KEY)) {
      localStorage.setItem(this.REFERRAL_AUDIT_KEY, JSON.stringify([]));
    }

    console.log('[Referral] System initialized successfully');
  }

  /**
   * Create device fingerprint for duplicate prevention
   * Combines multiple signals to identify device
   */
  createDeviceFingerprint() {
    const fingerprint = {
      id: this.generateRandomId(),
      created: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    localStorage.setItem(this.DEVICE_FINGERPRINT_KEY, JSON.stringify(fingerprint));
    console.log('[Referral] Device fingerprint created:', fingerprint.id);
    return fingerprint;
  }

  /**
   * Get or create user in referral system
   * @param {string} userId - Unique user identifier
   * @param {string} referralCodeProvided - Optional referral code provided by user
   * @returns {object} User object with referral data
   */
  getOrCreateUser(userId, referralCodeProvided = null) {
    if (!userId) {
      throw new Error('[Referral] userId is required');
    }

    const users = this.getAllUsers();
    let user = users.find(u => u.userId === userId);

    // User already exists
    if (user) {
      console.log('[Referral] User found:', userId);
      return user;
    }

    // Create new user
    user = {
      userId: userId,
      referralCode: this.generateReferralCode(),
      referredBy: null,
      referredByUserId: null,
      referralRewardGiven: false,
      firstActionCompletedAt: null,
      createdAt: Date.now(),
      deviceFingerprint: this.getDeviceFingerprint().id,
      referralStats: {
        totalReferralsAccepted: 0,
        totalReferralsRewarded: 0,
        totalPointsEarned: 0
      }
    };

    // Validate and apply referral code if provided
    if (referralCodeProvided) {
      const validationResult = this.validateAndApplyReferralCode(user, referralCodeProvided);
      if (validationResult.success) {
        user.referredBy = validationResult.referralCode;
        user.referredByUserId = validationResult.referrerId;
        this.logAuditEvent('REFERRAL_ACCEPTED', {
          newUserId: userId,
          referralCode: referralCodeProvided,
          referrerId: validationResult.referrerId
        });
        console.log('[Referral] Referral code applied:', referralCodeProvided);
      } else {
        this.logAuditEvent('REFERRAL_REJECTED', {
          newUserId: userId,
          referralCode: referralCodeProvided,
          reason: validationResult.reason
        });
        console.warn('[Referral] Referral code rejected:', validationResult.reason);
      }
    }

    // Save user
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    console.log('[Referral] New user created:', userId, user.referralCode);

    return user;
  }

  /**
   * Validate and apply referral code
   * @param {object} newUser - New user object
   * @param {string} referralCode - Referral code to validate
   * @returns {object} Validation result { success, reason, referrerId, referralCode }
   */
  validateAndApplyReferralCode(newUser, referralCode) {
    // Sanitize input
    referralCode = String(referralCode).trim().toUpperCase();

    // Check format
    if (!this.isValidReferralCodeFormat(referralCode)) {
      return {
        success: false,
        reason: 'Invalid referral code format'
      };
    }

    // Find referrer
    const referrer = this.getUserByReferralCode(referralCode);
    if (!referrer) {
      return {
        success: false,
        reason: 'Referral code not found'
      };
    }

    // Prevent self-referral
    if (referrer.userId === newUser.userId) {
      return {
        success: false,
        reason: 'Cannot refer yourself'
      };
    }

    // Check for duplicate registration from same device
    if (this.isDuplicateDeviceRegistration(referrer.userId)) {
      return {
        success: false,
        reason: 'Duplicate registration detected'
      };
    }

    // Check referrer hasn't exceeded max referrals
    if (referrer.referralStats.totalReferralsAccepted >= this.MAX_REFERRALS_PER_USER) {
      return {
        success: false,
        reason: 'Referral limit exceeded for this code'
      };
    }

    return {
      success: true,
      referrerId: referrer.userId,
      referralCode: referralCode
    };
  }

  /**
   * Detect if user is completing their first action (return or donation)
   * and process referral reward if applicable
   * 
   * @param {string} userId - User completing the action
   * @param {string} actionType - 'return' or 'donation'
   * @param {number} pointsEarned - Points earned from this action
   * @returns {object} Reward result { success, referralRewardApplied, bonusPoints }
   */
  processFirstActionReward(userId, actionType = 'return', pointsEarned = 0) {
    if (!userId || !['return', 'donation'].includes(actionType)) {
      console.error('[Referral] Invalid parameters for first action reward');
      return { success: false, referralRewardApplied: false, bonusPoints: 0 };
    }

    const user = this.getUserById(userId);
    if (!user) {
      console.warn('[Referral] User not found for first action processing:', userId);
      return { success: false, referralRewardApplied: false, bonusPoints: 0 };
    }

    const result = {
      success: false,
      referralRewardApplied: false,
      bonusPoints: 0,
      referredByUserId: null,
      referrerReward: 0,
      messages: []
    };

    // Check if this is truly the first action
    if (user.firstActionCompletedAt !== null) {
      console.log('[Referral] User already completed first action:', userId);
      return result;
    }

    // Mark first action as completed
    user.firstActionCompletedAt = Date.now();

    // Check if user was referred and hasn't received reward yet
    if (user.referredByUserId && !user.referralRewardGiven) {
      const referrer = this.getUserById(user.referredByUserId);
      
      if (referrer) {
        // Award referred user
        result.bonusPoints = this.REFERRED_USER_REWARD;
        user.referralRewardGiven = true;
        
        // Update referrer stats
        referrer.referralStats.totalReferralsRewarded += 1;
        referrer.referralStats.totalPointsEarned += this.REFERRER_REWARD;

        result.success = true;
        result.referralRewardApplied = true;
        result.referredByUserId = user.referredByUserId;
        result.referrerReward = this.REFERRER_REWARD;
        result.messages.push(
          `🌱 Welcome! You earned ${this.REFERRED_USER_REWARD} bonus EcoPoints for your first circular action!`
        );

        // Log audit event
        this.logAuditEvent('REFERRAL_REWARD_DISTRIBUTED', {
          referredUserId: userId,
          referrerId: referrer.userId,
          referredUserBonus: this.REFERRED_USER_REWARD,
          referrerBonus: this.REFERRER_REWARD,
          actionType: actionType
        });

        console.log('[Referral] Referral reward distributed', {
          referred: userId,
          referrer: referrer.userId,
          bonusPoints: this.REFERRED_USER_REWARD
        });

        // Save updated users
        this.updateUser(user);
        this.updateUser(referrer);

        return result;
      }
    }

    // Save first action even if no referral reward
    this.updateUser(user);
    return result;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID to find
   * @returns {object|null} User object or null
   */
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(u => u.userId === userId) || null;
  }

  /**
   * Get user by referral code
   * @param {string} referralCode - Referral code to find
   * @returns {object|null} User object or null
   */
  getUserByReferralCode(referralCode) {
    const users = this.getAllUsers();
    return users.find(u => u.referralCode === referralCode.toUpperCase()) || null;
  }

  /**
   * Get all users in referral system
   * @returns {array} Array of user objects
   */
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    } catch (e) {
      console.error('[Referral] Error reading users:', e);
      return [];
    }
  }

  /**
   * Update existing user in storage
   * @param {object} user - User object to update
   */
  updateUser(user) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.userId === user.userId);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  /**
   * Generate unique referral code in LOOP-XXXX format
   * @returns {string} Unique referral code
   */
  generateReferralCode() {
    let code = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      code = `${this.REFERRAL_CODE_PREFIX}-${this.generateRandomId(4)}`;
      
      // Check if code already exists
      const existingUser = this.getUserByReferralCode(code);
      isUnique = !existingUser;
      
      attempts++;
    }

    if (!isUnique) {
      throw new Error('[Referral] Could not generate unique referral code');
    }

    return code;
  }

  /**
   * Check if referral code format is valid
   * @param {string} code - Code to validate
   * @returns {boolean} True if valid format
   */
  isValidReferralCodeFormat(code) {
    const pattern = /^LOOP-[A-Z0-9]{4}$/;
    return pattern.test(code);
  }

  /**
   * Generate random ID/code
   * @param {number} length - Length of random string
   * @returns {string} Random alphanumeric string
   */
  generateRandomId(length = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Detect duplicate device registration attempts
   * @param {string} referrerId - Referrer user ID
   * @returns {boolean} True if duplicate detected
   */
  isDuplicateDeviceRegistration(referrerId) {
    const users = this.getAllUsers();
    const currentDeviceFingerprint = this.getDeviceFingerprint().id;
    
    // Find all users on this device
    const usersOnDevice = users.filter(u => u.deviceFingerprint === currentDeviceFingerprint);
    
    // Check if any of them were referred by the same referrer
    return usersOnDevice.some(u => u.referredByUserId === referrerId && u.userId !== referrerId);
  }

  /**
   * Get device fingerprint
   * @returns {object} Device fingerprint object
   */
  getDeviceFingerprint() {
    const stored = localStorage.getItem(this.DEVICE_FINGERPRINT_KEY);
    return stored ? JSON.parse(stored) : this.createDeviceFingerprint();
  }

  /**
   * Log audit event for compliance and debugging
   * @param {string} eventType - Type of event
   * @param {object} data - Event data
   */
  logAuditEvent(eventType, data = {}) {
    const audit = JSON.parse(localStorage.getItem(this.REFERRAL_AUDIT_KEY) || '[]');
    
    const event = {
      eventType: eventType,
      timestamp: Date.now(),
      data: data,
      deviceFingerprint: this.getDeviceFingerprint().id
    };

    audit.push(event);

    // Keep only last 1000 events to prevent storage bloat
    if (audit.length > 1000) {
      audit.shift();
    }

    localStorage.setItem(this.REFERRAL_AUDIT_KEY, JSON.stringify(audit));
    console.log('[Referral Audit]', eventType, data);
  }

  /**
   * Get audit log for a specific user
   * @param {string} userId - User ID to get audit for
   * @returns {array} Filtered audit events
   */
  getAuditLogForUser(userId) {
    const audit = JSON.parse(localStorage.getItem(this.REFERRAL_AUDIT_KEY) || '[]');
    return audit.filter(event => 
      event.data.userId === userId || 
      event.data.newUserId === userId ||
      event.data.referredUserId === userId ||
      event.data.referrerId === userId
    );
  }

  /**
   * Get referral statistics for a user
   * @param {string} userId - User ID
   * @returns {object} Detailed referral stats
   */
  getReferralStats(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      return null;
    }

    // Find users referred by this person
    const users = this.getAllUsers();
    const referredUsers = users.filter(u => u.referredByUserId === userId);
    const rewaredReferrals = referredUsers.filter(u => u.referralRewardGiven);

    return {
      referralCode: user.referralCode,
      totalReferrals: referredUsers.length,
      totalRewarded: rewaredReferrals.length,
      totalPointsEarned: user.referralStats.totalPointsEarned,
      referredByUserId: user.referredByUserId,
      referredByCode: user.referredBy,
      bonusPointsReceived: user.referralRewardGiven ? this.REFERRED_USER_REWARD : 0,
      firstActionCompleted: user.firstActionCompletedAt !== null,
      createdAt: user.createdAt
    };
  }

  /**
   * Check if user is valid and has completed required actions
   * @param {string} userId - User ID to check
   * @returns {object} Validation status
   */
  validateUserStatus(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      return {
        exists: false,
        firstActionDone: false,
        referralBonusApplied: false
      };
    }

    return {
      exists: true,
      referralCode: user.referralCode,
      firstActionDone: user.firstActionCompletedAt !== null,
      referralBonusApplied: user.referralRewardGiven,
      referredByCode: user.referredBy
    };
  }

  /**
   * Clear all referral data (for testing/reset only)
   */
  clearAllData() {
    console.warn('[Referral] Clearing all data - this is irreversible');
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.REFERRAL_TRACKING_KEY);
    localStorage.removeItem(this.REFERRAL_AUDIT_KEY);
    this.initializeSystem();
  }
}

// Initialize global referral system instance
const referralSystem = new ReferralSystem();
console.log('[Referral] System ready');
