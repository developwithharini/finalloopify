-- Apply remaining migrations for OTP & Location

PRAGMA foreign_keys = ON;

-- Add phone_number and session_token if they don't exist
-- (Skip with error if already present - this is OK)

-- Create OTP sessions table if not exists
CREATE TABLE IF NOT EXISTS otp_sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'expired', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_status ON otp_sessions(status);

-- Create location history table
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

-- Update hubs with real coordinates
UPDATE hubs SET latitude = 28.6139, longitude = 77.2090 WHERE hub_name LIKE '%Delhi%' OR location LIKE '%Delhi%';
UPDATE hubs SET latitude = 19.0760, longitude = 72.8777 WHERE hub_name LIKE '%Mumbai%' OR location LIKE '%Mumbai%';
UPDATE hubs SET latitude = 13.0827, longitude = 80.2707 WHERE hub_name LIKE '%Chennai%' OR location LIKE '%Chennai%';
UPDATE hubs SET latitude = 12.9716, longitude = 77.5946 WHERE hub_name LIKE '%Bangalore%' OR location LIKE '%Bangalore%';
UPDATE hubs SET latitude = 23.1815, longitude = 79.9864 WHERE hub_name LIKE '%Bhopal%' OR location LIKE '%Bhopal%';

-- Verify hubs
SELECT hub_id, hub_name, location, latitude, longitude FROM hubs WHERE latitude IS NOT NULL LIMIT 5;
