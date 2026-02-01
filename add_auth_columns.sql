PRAGMA foreign_keys = ON;

CREATE TEMPORARY TABLE users_backup AS SELECT * FROM users;
DROP TABLE users;

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  otp_code TEXT,
  otp_expires_at DATETIME,
  is_verified BOOLEAN DEFAULT 0,
  session_token TEXT UNIQUE,
  last_login DATETIME,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'hub-admin', 'super-admin')),
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_user_id INTEGER,
  eco_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(referred_by_user_id) REFERENCES users(user_id)
);

INSERT INTO users (user_id, name, email, password_hash, role, referral_code, referred_by_user_id, eco_points, status, created_at, updated_at)
SELECT user_id, name, email, password_hash, role, referral_code, referred_by_user_id, eco_points, status, created_at, updated_at FROM users_backup;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by_user_id);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_session_token ON users(session_token);

DROP TABLE users_backup;
