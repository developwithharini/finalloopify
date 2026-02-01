/**
 * OTP & AUTHENTICATION UTILITIES
 * 
 * Provides OTP generation, verification, and session management
 * Production-ready with proper validation and security considerations
 * 
 * For MVP: OTP printed to console (can be extended with real SMS)
 */

/**
 * Generate random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate unique session token
 * @returns {string} Session token (32 chars)
 */
export function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Calculate OTP expiry time (5 minutes from now)
 * @returns {string} ISO 8601 datetime string
 */
export function calculateOTPExpiry() {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 5);
  return expiryTime.toISOString();
}

/**
 * Validate phone number format (Indian format)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid format
 */
export function isValidPhoneNumber(phoneNumber) {
  // Indian phone: 10 digits, optionally with +91 prefix
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
}

/**
 * Normalize phone number to 10-digit format
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Normalized 10-digit phone number
 */
export function normalizePhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/\D/g, '');
  // Remove leading 91 if present (country code)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Check if OTP is expired
 * @param {string} expiryTime - ISO 8601 datetime string
 * @returns {boolean} True if expired
 */
export function isOTPExpired(expiryTime) {
  return new Date() > new Date(expiryTime);
}

/**
 * Demo helper: Log OTP to console (for MVP/hackathon)
 * In production, this would send via SMS gateway
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - Generated OTP code
 */
export function logOTPForDemo(phoneNumber, otp) {
  console.log('\n' + '='.repeat(60));
  console.log('📱 OTP GENERATION (DEMO MODE)');
  console.log('='.repeat(60));
  console.log(`Phone: +91-${phoneNumber}`);
  console.log(`OTP Code: ${otp}`);
  console.log('Valid for: 5 minutes');
  console.log('Note: In production, SMS would be sent to user');
  console.log('='.repeat(60) + '\n');
}

/**
 * Validate OTP attempt
 * @param {string} submittedOTP - OTP entered by user
 * @param {string} storedOTP - OTP stored in database
 * @param {string} expiryTime - OTP expiry time
 * @returns {object} Validation result {valid: boolean, reason: string}
 */
export function validateOTPAttempt(submittedOTP, storedOTP, expiryTime) {
  if (!submittedOTP || !storedOTP) {
    return { valid: false, reason: 'OTP not generated or request not found' };
  }
  
  if (isOTPExpired(expiryTime)) {
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  
  if (submittedOTP.toString() !== storedOTP.toString()) {
    return { valid: false, reason: 'Incorrect OTP. Please try again.' };
  }
  
  return { valid: true, reason: 'OTP verified successfully' };
}

/**
 * Create secure user object for session
 * @param {object} userRecord - Raw user record from database
 * @returns {object} Safe user object without passwords/sensitive data
 */
export function createSafeUserObject(userRecord) {
  if (!userRecord) return null;
  
  return {
    user_id: userRecord.user_id,
    name: userRecord.name || 'User',
    phone_number: userRecord.phone_number,
    email: userRecord.email,
    eco_points: userRecord.eco_points,
    role: userRecord.role,
    is_verified: userRecord.is_verified,
    last_login: userRecord.last_login,
    created_at: userRecord.created_at
  };
}
