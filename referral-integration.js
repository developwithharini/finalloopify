/**
 * Loopify Referral Integration Guide
 * 
 * Step-by-step integration of referral system into existing app
 * Includes helper functions and implementation examples
 */

// ============================================
// STEP 1: INCLUDE SCRIPTS IN HTML
// ============================================
/*
Add these to your HTML <head> or before closing </body>:

<script src="referral-system.js"></script>
<script src="referral-ui.js"></script>
<script src="referral-integration.js"></script>

Required dependencies (already loaded):
- Font Awesome 6.4.0 for icons
- localStorage support
*/

// ============================================
// STEP 2: INITIALIZATION ON APP START
// ============================================

class ReferralIntegration {
  constructor() {
    this.currentUserId = null;
    this.isInitialized = false;
  }

  /**
   * Initialize referral system when app loads
   * Call this once on app startup
   * 
   * @param {string} userId - Current user ID (can be from login or local storage)
   * @param {boolean} isNewUser - Whether this is a new user (first visit)
   */
  initializeApp(userId, isNewUser = false) {
    if (!userId) {
      console.error('[ReferralIntegration] userId is required');
      return;
    }

    console.log('[ReferralIntegration] Initializing app for user:', userId);
    this.currentUserId = userId;

    // Get or create user in referral system
    const user = referralSystem.getOrCreateUser(userId);
    console.log('[ReferralIntegration] User referral data:', {
      referralCode: user.referralCode,
      wasReferred: !!user.referredBy,
      bonusAwarded: user.referralRewardGiven
    });

    // Show referral modal for new users
    if (isNewUser && !user.referredBy) {
      console.log('[ReferralIntegration] Showing referral entry modal for new user');
      referralUI.showReferralEntryModal(userId, (enteredCode) => {
        if (enteredCode) {
          console.log('[ReferralIntegration] User entered referral code:', enteredCode);
          referralUI.showNotification(
            'success',
            '✨ Referral code registered!',
            'You\'ll earn 30 bonus EcoPoints after your first action.'
          );
        }
      });
    }

    this.isInitialized = true;
  }

  /**
   * When user completes first return or donation
   * CRITICAL: Call this immediately after first successful action
   * 
   * @param {string} actionType - 'return' or 'donation'
   * @param {number} pointsEarned - Points earned from action
   * @returns {object} Reward result
   */
  processFirstAction(actionType = 'return', pointsEarned = 0) {
    if (!this.currentUserId) {
      console.error('[ReferralIntegration] No current user');
      return null;
    }

    console.log('[ReferralIntegration] Processing first action:', actionType);

    // Process referral reward
    const result = referralSystem.processFirstActionReward(
      this.currentUserId,
      actionType,
      pointsEarned
    );

    // Show notifications if reward was given
    if (result.referralRewardApplied) {
      // Notify referred user
      referralUI.showRewardNotification(
        this.currentUserId,
        result.bonusPoints,
        'referred'
      );

      // You should also notify the referrer (if they're online)
      // In a real app with backend, this would be sent via notification system
      console.log('[ReferralIntegration] Referrer ID for notification:', result.referredByUserId);
    }

    return result;
  }

  /**
   * Display referral code in user profile/dashboard
   * @param {string} containerId - HTML element ID where to display
   */
  displayUserReferralCode(containerId = 'referral-widget-container') {
    if (!this.currentUserId) {
      console.error('[ReferralIntegration] No current user');
      return;
    }

    referralUI.displayReferralCodeWidget(this.currentUserId, containerId);
  }

  /**
   * Display referral dashboard
   * @param {string} containerId - HTML element ID where to display
   */
  displayReferralDashboard(containerId = 'referral-dashboard-container') {
    if (!this.currentUserId) {
      console.error('[ReferralIntegration] No current user');
      return;
    }

    referralUI.displayReferralDashboard(this.currentUserId, containerId);
  }

  /**
   * Get user's referral statistics
   * @returns {object} Referral stats
   */
  getUserReferralStats() {
    if (!this.currentUserId) {
      return null;
    }

    return referralSystem.getReferralStats(this.currentUserId);
  }

  /**
   * Manually award points to user
   * Integrates with EcoPoints system
   * 
   * @param {string} userId - User ID
   * @param {number} points - Points to award
   * @param {string} reason - Reason for points (for logging)
   */
  awardPoints(userId, points, reason = 'referral_bonus') {
    console.log('[ReferralIntegration] Awarding', points, 'points to', userId, 'for:', reason);

    // Check if EcoPoints system exists
    if (typeof ecoPointsSystem !== 'undefined' && ecoPointsSystem.addPoints) {
      ecoPointsSystem.addPoints(userId, points, reason);
      console.log('[ReferralIntegration] Points awarded via ecoPointsSystem');
    } else {
      // Fallback: Add to localStorage directly
      const points_key = `loopify_ecopoints_${userId}`;
      const currentPoints = parseInt(localStorage.getItem(points_key) || '0');
      const newPoints = currentPoints + points;
      localStorage.setItem(points_key, newPoints.toString());
      console.log('[ReferralIntegration] Points awarded via localStorage:', newPoints);
    }
  }
}

// Initialize global integration instance
const referralIntegration = new ReferralIntegration();
console.log('[ReferralIntegration] Integration ready');

// ============================================
// STEP 3: INTEGRATION POINTS IN YOUR APP
// ============================================

/*
PLACE 1: On App Initialization
───────────────────────────────
In your app.html or main JS file, add this:

// Detect if new user
const isNewUser = !localStorage.getItem('user_has_visited');
const userId = generateOrGetUserId(); // Your existing user ID logic

// Initialize referral system
referralIntegration.initializeApp(userId, isNewUser);

if (isNewUser) {
  localStorage.setItem('user_has_visited', 'true');
}


PLACE 2: When User Completes First Return
─────────────────────────────────────────
In your return/donation completion handler, add this:

function completeReturn(itemId) {
  // ... Your existing return logic ...
  
  // IMPORTANT: Add this after successful return
  const result = referralIntegration.processFirstAction('return', 10);
  
  if (result.referralRewardApplied) {
    console.log('User earned referral bonus!', result.bonusPoints);
  }
}


PLACE 3: Display Referral Code in Profile
──────────────────────────────────────────
In your profile page HTML:

<div id="referral-widget-container"></div>

<script>
  referralIntegration.displayUserReferralCode('referral-widget-container');
</script>


PLACE 4: Display Dashboard (Optional)
────────────────────────────────────
<div id="referral-dashboard-container"></div>

<script>
  referralIntegration.displayReferralDashboard('referral-dashboard-container');
</script>

*/

// ============================================
// STEP 4: COMMON USE CASES
// ============================================

/**
 * Use Case 1: Get user's referral code to show in UI
 */
function getUserReferralCode(userId) {
  const user = referralSystem.getUserById(userId);
  return user ? user.referralCode : null;
}

/**
 * Use Case 2: Check if user was referred and hasn't received bonus yet
 */
function hasEligibleReferralBonus(userId) {
  const user = referralSystem.getUserById(userId);
  if (!user) return false;

  return (
    user.referredBy !== null && // Was referred
    !user.referralRewardGiven && // Hasn't received bonus
    user.firstActionCompletedAt === null // Hasn't completed first action
  );
}

/**
 * Use Case 3: Get list of all users referred by someone
 */
function getUsersReferredBy(referrerId) {
  const users = referralSystem.getAllUsers();
  return users.filter(u => u.referredByUserId === referrerId);
}

/**
 * Use Case 4: Get referral performance for analytics
 */
function getReferralAnalytics() {
  const users = referralSystem.getAllUsers();
  
  return {
    totalUsers: users.length,
    usersWithReferrals: users.filter(u => u.referredBy !== null).length,
    totalReferralsCompleted: users.filter(u => u.referralRewardGiven).length,
    totalBonusPointsDistributed: users.reduce((sum, u) => {
      return sum + (u.referralRewardGiven ? referralSystem.REFERRED_USER_REWARD : 0);
    }, 0),
    topReferrers: users
      .map(u => ({
        userId: u.userId,
        code: u.referralCode,
        referralsCount: users.filter(x => x.referredByUserId === u.userId).length,
        pointsEarned: u.referralStats.totalPointsEarned
      }))
      .sort((a, b) => b.referralsCount - a.referralsCount)
      .slice(0, 10)
  };
}

/**
 * Use Case 5: Testing - Simulate referral flow
 */
function testReferralFlow() {
  console.log('=== Starting Referral System Test ===');

  // Create referrer
  const referrer = referralSystem.getOrCreateUser('test-referrer-123');
  console.log('Referrer created:', referrer.referralCode);

  // Create new user with referral code
  const newUser = referralSystem.getOrCreateUser('test-referred-456', referrer.referralCode);
  console.log('New user created, referred by:', newUser.referredBy);

  // Simulate first action
  const result = referralSystem.processFirstActionReward('test-referred-456', 'return', 10);
  console.log('First action processed:', result);

  // Check stats
  const referrerStats = referralSystem.getReferralStats(referrer.userId);
  console.log('Referrer stats:', referrerStats);

  console.log('=== Test Complete ===');
}

// ============================================
// STEP 5: ERROR HANDLING
// ============================================

/**
 * Wrapper for safe referral operations
 */
function safeReferralOperation(operation, fallback = null) {
  try {
    return operation();
  } catch (error) {
    console.error('[ReferralIntegration] Error:', error);
    return fallback;
  }
}

/**
 * Example usage:
 * const stats = safeReferralOperation(
 *   () => referralSystem.getReferralStats(userId),
 *   {}
 * );
 */

// ============================================
// STEP 6: DEBUGGING
// ============================================

/**
 * Get comprehensive debug info for troubleshooting
 */
function getReferralDebugInfo(userId = null) {
  const info = {
    systemReady: referralSystem && referralUI,
    deviceFingerprint: referralSystem.getDeviceFingerprint(),
    totalUsers: referralSystem.getAllUsers().length,
    storageUsed: {
      users: localStorage.getItem(referralSystem.USERS_KEY).length,
      tracking: localStorage.getItem(referralSystem.REFERRAL_TRACKING_KEY).length,
      audit: localStorage.getItem(referralSystem.REFERRAL_AUDIT_KEY).length
    },
    localStorage: {
      [referralSystem.USERS_KEY]: localStorage.getItem(referralSystem.USERS_KEY),
      [referralSystem.DEVICE_FINGERPRINT_KEY]: localStorage.getItem(referralSystem.DEVICE_FINGERPRINT_KEY)
    }
  };

  if (userId) {
    info.userSpecific = {
      user: referralSystem.getUserById(userId),
      stats: referralSystem.getReferralStats(userId),
      auditLog: referralSystem.getAuditLogForUser(userId)
    };
  }

  return info;
}

console.log('[ReferralIntegration] All helpers ready. Call getReferralDebugInfo() to debug.');
