/**
 * LOOPIFY - OTP & LOCATION MIGRATION
 * 
 * This migration adds:
 * 1. Phone number + OTP support to users table
 * 2. Latitude/Longitude to hubs table
 * 3. Session token management for auth
 * 
 * Version: 1.1
 * Date: January 31, 2026
 */

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================================================
-- USERS TABLE: Add OTP & Phone Number Authentication
-- ============================================================================

-- Add phone-based auth columns to users table
-- NOTE: These can be added to existing users table via ALTER TABLE if needed
ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;
ALTER TABLE users ADD COLUMN otp_code TEXT;
ALTER TABLE users ADD COLUMN otp_expires_at DATETIME;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN session_token TEXT UNIQUE;
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Create index for phone lookup (for OTP verification)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);

-- ============================================================================
-- HUBS TABLE: Add Geolocation Data
-- ============================================================================

-- IMPORTANT: Latitude and Longitude may already exist in hubs table
-- If columns already exist, this migration will be skipped
-- Verify with: SELECT sql FROM sqlite_master WHERE type='table' AND name='hubs';

-- If not present, uncomment below:
-- ALTER TABLE hubs ADD COLUMN latitude REAL;
-- ALTER TABLE hubs ADD COLUMN longitude REAL;

-- Create spatial index for nearby hub queries
CREATE INDEX IF NOT EXISTS idx_hub_geolocation ON hubs(latitude, longitude);

-- ============================================================================
-- OTP_SESSIONS TABLE: Track OTP attempts and verification
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'expired', 'failed')),
  UNIQUE(phone_number, status)
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_status ON otp_sessions(status);

-- ============================================================================
-- LOCATION_HISTORY TABLE: Track user location for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS location_history (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  nearest_hub_id INTEGER,
  distance_km REAL,
  accuracy_meters INTEGER,
  detected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(nearest_hub_id) REFERENCES hubs(hub_id)
);

CREATE INDEX IF NOT EXISTS idx_location_user ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_detected ON location_history(detected_at);
