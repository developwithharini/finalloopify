/**
 * LOOPIFY - Sustainability Platform Database Schema
 * 
 * SQLite Database Design
 * Version: 1.0
 * Created: January 31, 2026
 * 
 * This schema supports:
 * - User management & authentication
 * - EcoPoints wallet system
 * - Weekly streaks & gamification
 * - Referral rewards program
 * - Circular hubs & collection drives
 * - Returns & donations (Level 3 & 4)
 * - Thrift shop inventory & redemptions
 * - Upcycle auction system with bidding
 * - Admin uploads & management
 * 
 * All tables use proper normalization and foreign key constraints.
 */

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================================================
-- TABLE: users
-- Purpose: Core user accounts and profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'hub-admin', 'super-admin')),
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_user_id INTEGER,
  eco_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(referred_by_user_id) REFERENCES users(user_id)
);

-- Index for frequent lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by_user_id);

-- ============================================================================
-- TABLE: eco_transactions
-- Purpose: Complete audit trail of EcoPoints movements
-- ============================================================================
CREATE TABLE IF NOT EXISTS eco_transactions (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  source TEXT NOT NULL,
  points_amount INTEGER NOT NULL,
  reason TEXT,
  reference_id INTEGER,
  reference_type TEXT,
  balance_after INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- Indexes for transaction queries
CREATE INDEX idx_eco_user ON eco_transactions(user_id);
CREATE INDEX idx_eco_created ON eco_transactions(created_at);
CREATE INDEX idx_eco_source ON eco_transactions(source);

-- ============================================================================
-- TABLE: weekly_streaks
-- Purpose: Track user engagement and weekly milestones
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_streaks (
  streak_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_week TEXT,
  milestone_earned BOOLEAN NOT NULL DEFAULT 0,
  milestone_bonus_claimed BOOLEAN NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- ============================================================================
-- TABLE: referral_relationships
-- Purpose: Track all referral connections and reward status
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_relationships (
  referral_id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL UNIQUE,
  referrer_reward_given BOOLEAN NOT NULL DEFAULT 0,
  referred_reward_given BOOLEAN NOT NULL DEFAULT 0,
  referral_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reward_date DATETIME,
  FOREIGN KEY(referrer_user_id) REFERENCES users(user_id),
  FOREIGN KEY(referred_user_id) REFERENCES users(user_id)
);

-- Index for referral lookups
CREATE INDEX idx_referral_referrer ON referral_relationships(referrer_user_id);
CREATE INDEX idx_referral_referred ON referral_relationships(referred_user_id);

-- ============================================================================
-- TABLE: hubs
-- Purpose: Circular hub locations for item returns and donations
-- ============================================================================
CREATE TABLE IF NOT EXISTS hubs (
  hub_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hub_name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  distance_km INTEGER,
  capacity INTEGER,
  operating_hours TEXT,
  contact_phone TEXT,
  last_collection_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for location-based queries
CREATE INDEX idx_hub_status ON hubs(status);

-- ============================================================================
-- TABLE: returns
-- Purpose: Track item returns and donations from users
-- ============================================================================
CREATE TABLE IF NOT EXISTS returns (
  return_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hub_id INTEGER NOT NULL,
  level INTEGER NOT NULL CHECK(level IN (3, 4)),
  return_type TEXT NOT NULL CHECK(return_type IN ('return', 'donation')),
  fulfillment_type TEXT NOT NULL CHECK(fulfillment_type IN ('pickup', 'self-drop')),
  quantity INTEGER NOT NULL DEFAULT 1,
  items_list TEXT,
  estimated_points INTEGER,
  actual_points_awarded INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'received', 'verified', 'completed')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  received_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

-- Indexes for return queries
CREATE INDEX idx_returns_user ON returns(user_id);
CREATE INDEX idx_returns_hub ON returns(hub_id);
CREATE INDEX idx_returns_status ON returns(status);
CREATE INDEX idx_returns_level ON returns(level);

-- ============================================================================
-- TABLE: collection_drives
-- Purpose: Organize collection events at hubs
-- ============================================================================
CREATE TABLE IF NOT EXISTS collection_drives (
  drive_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hub_id INTEGER NOT NULL,
  drive_name TEXT NOT NULL,
  drive_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  expected_items INTEGER,
  items_collected INTEGER,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'ongoing', 'completed')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

-- Index for drive queries
CREATE INDEX idx_drives_hub ON collection_drives(hub_id);
CREATE INDEX idx_drives_date ON collection_drives(drive_date);

-- ============================================================================
-- TABLE: thrift_items
-- Purpose: Inventory of items available for redemption
-- ============================================================================
CREATE TABLE IF NOT EXISTS thrift_items (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  eco_points_cost INTEGER NOT NULL,
  image_url TEXT,
  condition TEXT CHECK(condition IN ('like_new', 'excellent', 'good', 'fair')),
  size TEXT,
  color TEXT,
  uploaded_by_user_id INTEGER,
  hub_id INTEGER NOT NULL,
  uploaded_date DATE NOT NULL,
  redeemed BOOLEAN NOT NULL DEFAULT 0,
  redeemed_by_user_id INTEGER,
  redeemed_at DATETIME,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK(availability_status IN ('available', 'redeemed', 'auction_pending', 'auction_active', 'auction_won', 'damaged', 'removed')),
  quantity_available INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(uploaded_by_user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id),
  FOREIGN KEY(redeemed_by_user_id) REFERENCES users(user_id)
);

-- Indexes for thrift queries
CREATE INDEX idx_thrift_hub ON thrift_items(hub_id);
CREATE INDEX idx_thrift_status ON thrift_items(availability_status);
CREATE INDEX idx_thrift_category ON thrift_items(category);
CREATE INDEX idx_thrift_uploaded ON thrift_items(uploaded_date);

-- ============================================================================
-- TABLE: redemptions
-- Purpose: Record of thrift item redemptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS redemptions (
  redemption_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  eco_points_paid INTEGER NOT NULL,
  fulfillment_type TEXT CHECK(fulfillment_type IN ('pickup', 'delivery')),
  fulfillment_hub_id INTEGER,
  redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed', 'cancelled', 'returned')),
  FOREIGN KEY(item_id) REFERENCES thrift_items(item_id),
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(fulfillment_hub_id) REFERENCES hubs(hub_id)
);

-- Indexes for redemption queries
CREATE INDEX idx_redemption_user ON redemptions(user_id);
CREATE INDEX idx_redemption_item ON redemptions(item_id);
CREATE INDEX idx_redemption_date ON redemptions(redeemed_at);

-- ============================================================================
-- TABLE: auctions
-- Purpose: Manage upcycle auction events for 30+ day unredeemed items
-- ============================================================================
CREATE TABLE IF NOT EXISTS auctions (
  auction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL UNIQUE,
  auction_start_date DATETIME NOT NULL,
  auction_end_date DATETIME NOT NULL,
  starting_bid INTEGER NOT NULL DEFAULT 5,
  highest_bid INTEGER,
  highest_bidder_user_id INTEGER,
  total_bids INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'no_winner', 'cancelled')),
  winner_user_id INTEGER,
  winner_points_paid INTEGER,
  winner_announced_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES thrift_items(item_id),
  FOREIGN KEY(highest_bidder_user_id) REFERENCES users(user_id),
  FOREIGN KEY(winner_user_id) REFERENCES users(user_id)
);

-- Indexes for auction queries
CREATE INDEX idx_auction_status ON auctions(status);
CREATE INDEX idx_auction_end_date ON auctions(auction_end_date);
CREATE INDEX idx_auction_item ON auctions(item_id);

-- ============================================================================
-- TABLE: auction_bids
-- Purpose: Track all bids placed on auctions
-- ============================================================================
CREATE TABLE IF NOT EXISTS auction_bids (
  bid_id INTEGER PRIMARY KEY AUTOINCREMENT,
  auction_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  bid_amount INTEGER NOT NULL,
  is_winning_bid BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(auction_id) REFERENCES auctions(auction_id),
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- Indexes for bid queries
CREATE INDEX idx_bid_auction ON auction_bids(auction_id);
CREATE INDEX idx_bid_user ON auction_bids(user_id);
CREATE INDEX idx_bid_date ON auction_bids(created_at);

-- ============================================================================
-- TABLE: material_bank
-- Purpose: Track material items available for collection/matching
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_bank (
  material_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  material_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT,
  description TEXT,
  location TEXT,
  available_for_collection BOOLEAN NOT NULL DEFAULT 1,
  matched_with_collector BOOLEAN NOT NULL DEFAULT 0,
  matched_collector_user_id INTEGER,
  matched_at DATETIME,
  collected_at DATETIME,
  estimated_points INTEGER,
  actual_points_awarded INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'pending_collection', 'collected', 'expired')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(matched_collector_user_id) REFERENCES users(user_id)
);

-- Indexes for material bank queries
CREATE INDEX idx_material_user ON material_bank(user_id);
CREATE INDEX idx_material_status ON material_bank(status);
CREATE INDEX idx_material_type ON material_bank(material_type);

-- ============================================================================
-- TABLE: admin_logs
-- Purpose: Audit trail for admin actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(admin_user_id) REFERENCES users(user_id)
);

-- Index for admin log queries
CREATE INDEX idx_admin_log_admin ON admin_logs(admin_user_id);
CREATE INDEX idx_admin_log_date ON admin_logs(created_at);

-- ============================================================================
-- TABLE: platform_stats
-- Purpose: Track platform-wide metrics and statistics
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_stats (
  stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE NOT NULL UNIQUE,
  total_users INTEGER,
  active_users_today INTEGER,
  total_eco_points_distributed INTEGER,
  total_items_redeemed INTEGER,
  total_items_returned INTEGER,
  total_items_auctioned INTEGER,
  total_bids_placed INTEGER,
  total_referrals_completed INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: waste_activities
-- Purpose: Track waste classification and diversion activities
-- ============================================================================
CREATE TABLE IF NOT EXISTS waste_activities (
  activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hub_id INTEGER,
  activity_type TEXT NOT NULL CHECK(activity_type IN ('classified', 'tracked', 'reused', 'matched', 'composted', 'recycled', 'landfill')),
  waste_category TEXT,
  quantity REAL,
  unit TEXT DEFAULT 'kg',
  diversion_type TEXT CHECK(diversion_type IN ('composted', 'recycled', 'reused', 'landfill')),
  eco_points_awarded INTEGER DEFAULT 0,
  carbon_savings_kg REAL DEFAULT 0,
  resource_saved_kg REAL DEFAULT 0,
  landfill_space_saved_m3 REAL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

CREATE INDEX idx_waste_user ON waste_activities(user_id);
CREATE INDEX idx_waste_type ON waste_activities(activity_type);
CREATE INDEX idx_waste_diversion ON waste_activities(diversion_type);
CREATE INDEX idx_waste_created ON waste_activities(created_at);

-- ============================================================================
-- TABLE: food_tracking
-- Purpose: Track food items and shelf life management
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_tracking (
  food_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hub_id INTEGER,
  food_name TEXT NOT NULL,
  quantity_kg REAL,
  category TEXT,
  expiry_date DATE,
  status TEXT CHECK(status IN ('fresh', 'expiring_soon', 'composted', 'donated', 'sold')),
  carbon_savings_kg REAL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

CREATE INDEX idx_food_user ON food_tracking(user_id);
CREATE INDEX idx_food_status ON food_tracking(status);

-- ============================================================================
-- TABLE: environmental_impact
-- Purpose: Aggregated environmental metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS environmental_impact (
  impact_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  hub_id INTEGER,
  period_date DATE DEFAULT CURRENT_DATE,
  items_classified INTEGER DEFAULT 0,
  foods_tracked INTEGER DEFAULT 0,
  items_reused INTEGER DEFAULT 0,
  materials_matched INTEGER DEFAULT 0,
  composted_kg REAL DEFAULT 0,
  recycled_kg REAL DEFAULT 0,
  reused_kg REAL DEFAULT 0,
  landfill_kg REAL DEFAULT 0,
  total_carbon_avoided_kg REAL DEFAULT 0,
  total_resources_saved_kg REAL DEFAULT 0,
  total_landfill_saved_m3 REAL DEFAULT 0,
  methane_prevented_kg REAL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

CREATE INDEX idx_impact_user ON environmental_impact(user_id);
CREATE INDEX idx_impact_hub ON environmental_impact(hub_id);
CREATE INDEX idx_impact_date ON environmental_impact(period_date);

-- ============================================================================
-- TABLE: contact_messages
-- Purpose: Store contact form submissions from pricing page
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  message_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  response_notes TEXT
);

-- Index for contact message queries
CREATE INDEX idx_contact_created ON contact_messages(created_at);
CREATE INDEX idx_contact_is_read ON contact_messages(is_read);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active users with their current stats
CREATE VIEW IF NOT EXISTS v_user_stats AS
SELECT 
  u.user_id,
  u.name,
  u.email,
  u.eco_points,
  u.role,
  ws.current_streak,
  ws.longest_streak,
  COUNT(DISTINCT r.return_id) as total_returns,
  COUNT(DISTINCT red.redemption_id) as total_redemptions,
  COUNT(DISTINCT ab.bid_id) as total_bids_placed,
  u.created_at
FROM users u
LEFT JOIN weekly_streaks ws ON u.user_id = ws.user_id
LEFT JOIN returns r ON u.user_id = r.user_id
LEFT JOIN redemptions red ON u.user_id = red.user_id
LEFT JOIN auction_bids ab ON u.user_id = ab.user_id
WHERE u.status = 'active'
GROUP BY u.user_id;

-- View: Active auctions with bidding info
CREATE VIEW IF NOT EXISTS v_active_auctions AS
SELECT 
  a.auction_id,
  a.item_id,
  ti.item_name,
  ti.category,
  ti.hub_id,
  h.hub_name,
  a.auction_start_date,
  a.auction_end_date,
  CAST((julianday(a.auction_end_date) - julianday('now')) AS INTEGER) as hours_remaining,
  a.starting_bid,
  a.highest_bid,
  a.total_bids,
  u.name as highest_bidder_name,
  a.status
FROM auctions a
JOIN thrift_items ti ON a.item_id = ti.item_id
JOIN hubs h ON ti.hub_id = h.hub_id
LEFT JOIN users u ON a.highest_bidder_user_id = u.user_id
WHERE a.status = 'active'
AND a.auction_end_date > datetime('now')
ORDER BY a.auction_end_date ASC;

-- View: Hub collection statistics
CREATE VIEW IF NOT EXISTS v_hub_stats AS
SELECT 
  h.hub_id,
  h.hub_name,
  h.location,
  COUNT(DISTINCT r.return_id) as total_returns,
  COUNT(DISTINCT ti.item_id) as total_items_received,
  COUNT(DISTINCT red.redemption_id) as total_items_redeemed,
  COUNT(DISTINCT a.auction_id) as items_in_auction,
  COUNT(DISTINCT cd.drive_id) as collection_drives
FROM hubs h
LEFT JOIN returns r ON h.hub_id = r.hub_id
LEFT JOIN thrift_items ti ON h.hub_id = ti.hub_id
LEFT JOIN redemptions red ON ti.item_id = red.item_id
LEFT JOIN auctions a ON ti.item_id = a.item_id AND a.status = 'active'
LEFT JOIN collection_drives cd ON h.hub_id = cd.hub_id
GROUP BY h.hub_id;
