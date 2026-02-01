# LOOPIFY DATABASE - COMPLETE TECHNICAL DOCUMENTATION

> **Production-ready SQLite database for the Loopify sustainability platform**

---

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Table Specifications](#table-specifications)
4. [Key Features](#key-features)
5. [Installation & Setup](#installation--setup)
6. [API Reference](#api-reference)
7. [Performance & Indexing](#performance--indexing)
8. [Scalability Roadmap](#scalability-roadmap)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
The Loopify database powers a complete sustainability and circular economy platform, enabling users to:
- Earn EcoPoints through sustainable activities
- Participate in referral rewards programs
- Redeem items from a thrift shop
- Bid on auctions for 30+ day unredeemed items
- Track returns and donations
- Maintain weekly engagement streaks
- Contribute materials for collection

### Design Principles
- **Normalized Schema**: Eliminates data redundancy, ensures data integrity
- **Foreign Key Constraints**: Enforces referential integrity across all tables
- **Audit Trails**: Complete transaction history for all EcoPoints movements
- **Time-Based Logic**: Supports streak calculations, auction timers, 30-day eligibility
- **Scalable Architecture**: Easily extends to multiple databases or cloud platforms
- **Hackathon-Ready**: Minimal dependencies, works with just SQLite

### Technology Stack
- **Database**: SQLite 3
- **File-based**: Single `loopify.db` file
- **Constraints**: Foreign keys, CHECK constraints, UNIQUE constraints
- **Indexes**: Strategic indexes on frequently queried columns
- **Views**: Pre-built views for common queries

---

## Database Architecture

### Entity Relationship Diagram (Logical)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                            │
├─────────────────────────────────────────────────────────────────┤

   users (CENTER)
   ├─ eco_transactions (audit trail)
   ├─ weekly_streaks (engagement)
   ├─ referral_relationships (network)
   ├─ returns (donations)
   ├─ material_bank (contributions)
   ├─ eco_transactions (all movements)
   └─ admin_logs (actions)

   ↓ (returns)
   hubs ─────── collection_drives
   
   ↓ (to hub)
   thrift_items
   ├─ redemptions (users redeem items)
   └─ auctions (30+ day items)
      └─ auction_bids (user bidding)

   platform_stats (daily snapshots)
```

### Normalization Level
**3rd Normal Form (3NF)** with strategic denormalization:
- All tables decomposed to eliminate transitive dependencies
- Foreign keys maintain referential integrity
- Strategic denormalization in `eco_transactions` for audit trail efficiency
- Minimal redundancy while maintaining query performance

---

## Table Specifications

### 1. USERS Table
**Purpose**: Core user accounts and authentication

```sql
user_id (INTEGER PRIMARY KEY)      -- Auto-incrementing unique ID
name (TEXT)                         -- User's display name
email (TEXT UNIQUE)                 -- Login email, must be unique
password_hash (TEXT)                -- Bcrypt/Argon2 hash (not plain text!)
role (TEXT)                         -- 'user', 'hub-admin', 'super-admin'
referral_code (TEXT UNIQUE)         -- Generated code like "LOOP-A1B2"
referred_by_user_id (INTEGER FK)    -- NULL if no referrer
eco_points (INTEGER)                -- Current balance
status (TEXT)                       -- 'active', 'inactive', 'suspended'
created_at (DATETIME)               -- Account creation timestamp
updated_at (DATETIME)               -- Last profile update
```

**Indexes**:
- `email` (for login lookups)
- `referral_code` (for code validation)
- `referred_by_user_id` (for referral networks)

**Constraints**:
- Email must be unique
- Referral code must be unique
- Role must be one of: user, hub-admin, super-admin
- Status must be one of: active, inactive, suspended

---

### 2. ECO_TRANSACTIONS Table
**Purpose**: Complete audit trail of all EcoPoints movements

```sql
transaction_id (INTEGER PRIMARY KEY)  -- Unique transaction ID
user_id (INTEGER FK)                  -- Which user
transaction_type (TEXT)               -- 'earn' or 'spend'
source (TEXT)                         -- 'return', 'referral', 'level_1', 'redemption', 'auction', 'admin', 'material'
points_amount (INTEGER)               -- Points added (positive) or deducted (negative)
reason (TEXT)                         -- Human-readable reason
reference_id (INTEGER)                -- ID of related entity (return_id, auction_id, etc.)
reference_type (TEXT)                 -- Type of reference ('return', 'redemption', 'auction')
balance_after (INTEGER)               -- Balance after transaction
created_at (DATETIME)                 -- Timestamp
```

**Indexes**:
- `user_id` (for user history)
- `created_at` (for date range queries)
- `source` (for reporting by source)

**Usage Example**:
```sql
-- User earns 50 points from return
INSERT INTO eco_transactions 
VALUES (NULL, 1, 'earn', 'return', 50, 'Item return at hub', 
        1, 'return', 250, CURRENT_TIMESTAMP);
```

---

### 3. WEEKLY_STREAKS Table
**Purpose**: Track engagement and gamification

```sql
streak_id (INTEGER PRIMARY KEY)
user_id (INTEGER FK UNIQUE)               -- One row per user
current_streak (INTEGER)                  -- Consecutive weeks active
longest_streak (INTEGER)                  -- Personal record
last_active_week (TEXT)                   -- ISO week "2026-W05"
milestone_earned (BOOLEAN)                -- Did they complete a 4-week streak?
milestone_bonus_claimed (BOOLEAN)         -- Was 50-point bonus given?
updated_at (DATETIME)                     -- When streak was last updated
```

**Update Logic**:
1. User completes any action this week
2. Check if `last_active_week != current_week`
3. If yes: `current_streak += 1`
4. Update `longest_streak` if higher
5. If `current_streak % 4 == 0`: Mark `milestone_earned = 1`
6. Award 50 bonus points for milestone

---

### 4. REFERRAL_RELATIONSHIPS Table
**Purpose**: Track referral network and reward status

```sql
referral_id (INTEGER PRIMARY KEY)
referrer_user_id (INTEGER FK)             -- Who referred
referred_user_id (INTEGER FK UNIQUE)      -- Who was referred (can only have 1 referrer)
referrer_reward_given (BOOLEAN)           -- 30 points to referrer?
referred_reward_given (BOOLEAN)           -- 10 points to referred?
referral_date (DATETIME)                  -- When referred
reward_date (DATETIME)                    -- When rewards awarded
```

**Reward Rules**:
- Referrer gets **30 points** when referred user joins
- Referred user gets **10 points** on first action (any EcoPoints transaction)
- Both rewards are one-time only

---

### 5. HUBS Table
**Purpose**: Circular hub locations

```sql
hub_id (INTEGER PRIMARY KEY)
hub_name (TEXT UNIQUE)                    -- "Downtown Hub", "South Side Hub", etc.
location (TEXT)                           -- Region name
address (TEXT)                            -- Physical address
latitude (REAL)                           -- For map integration
longitude (REAL)                          -- For map integration
distance_km (INTEGER)                     -- From city center
capacity (INTEGER)                        -- Storage capacity
operating_hours (TEXT)                    -- "9AM-6PM"
contact_phone (TEXT)                      -- Hub phone number
last_collection_date (DATE)               -- Last organized pickup
status (TEXT)                             -- 'active', 'inactive', 'maintenance'
created_at (DATETIME)
updated_at (DATETIME)
```

**Supported Hubs** (from seed data):
1. Downtown Hub
2. South Side Hub
3. North Side Hub
4. West Side Hub
5. East Side Hub

---

### 6. RETURNS Table
**Purpose**: Track user returns and donations

```sql
return_id (INTEGER PRIMARY KEY)
user_id (INTEGER FK)                      -- Who returned items
hub_id (INTEGER FK)                       -- Which hub received
level (INTEGER)                           -- 3 (donations) or 4 (material)
return_type (TEXT)                        -- 'return' or 'donation'
fulfillment_type (TEXT)                   -- 'pickup' or 'self-drop'
quantity (INTEGER)                        -- How many items
items_list (TEXT)                         -- Description of items
estimated_points (INTEGER)                -- Initial estimate
actual_points_awarded (INTEGER)           -- Final amount awarded
status (TEXT)                             -- 'pending' → 'received' → 'verified' → 'completed'
created_at (DATETIME)
received_at (DATETIME)                    -- When hub received
```

**Status Flow**:
```
pending → received → verified → completed
  (submitted)  (at hub)  (checked)  (points given)
```

---

### 7. THRIFT_ITEMS Table
**Purpose**: Inventory of redeemable items

```sql
item_id (INTEGER PRIMARY KEY)
item_name (TEXT)                          -- "Vintage Denim Jacket"
category (TEXT)                           -- "Clothing", "Electronics", "Furniture"
description (TEXT)                        -- Full description
eco_points_cost (INTEGER)                 -- How many points to redeem
image_url (TEXT)                          -- Photo for UI
condition (TEXT)                          -- 'like_new', 'excellent', 'good', 'fair'
size (TEXT)                               -- "M", "L", etc. (optional)
color (TEXT)                              -- "blue", "black"
uploaded_by_user_id (INTEGER FK)          -- Hub admin who uploaded
hub_id (INTEGER FK)                       -- Which hub has it
uploaded_date (DATE)                      -- When listed
redeemed (BOOLEAN)                        -- Has anyone redeemed it?
redeemed_by_user_id (INTEGER FK)          -- Who redeemed it
redeemed_at (DATETIME)                    -- When
availability_status (TEXT)                -- 'available', 'redeemed', 'auction_pending', 'auction_active', 'auction_won', 'damaged', 'removed'
quantity_available (INTEGER)              -- Stock
created_at (DATETIME)
```

**Status Transitions**:
```
available (user can redeem)
    ↓ (30+ days pass)
auction_pending (queued for auction)
    ↓ (auction created)
auction_active (actively bidding)
    ↓ (auction ends)
auction_won (winner assigned)
    ↓ (or)
redeemed (user redeemed instead)
```

---

### 8. REDEMPTIONS Table
**Purpose**: Record completed item redemptions

```sql
redemption_id (INTEGER PRIMARY KEY)
item_id (INTEGER FK)                      -- Which item
user_id (INTEGER FK)                      -- Who redeemed
eco_points_paid (INTEGER)                 -- Points spent
fulfillment_type (TEXT)                   -- 'pickup' or 'delivery'
fulfillment_hub_id (INTEGER FK)           -- Where to pick up
redeemed_at (DATETIME)                    -- Timestamp
status (TEXT)                             -- 'completed', 'cancelled', 'returned'
```

---

### 9. AUCTIONS Table
**Purpose**: Manage auctions for 30+ day items

```sql
auction_id (INTEGER PRIMARY KEY)
item_id (INTEGER FK UNIQUE)               -- Each item in ONE auction max
auction_start_date (DATETIME)             -- When bidding starts
auction_end_date (DATETIME)               -- When bidding ends (typically +72 hours)
starting_bid (INTEGER)                    -- Minimum bid (default: 5 points)
highest_bid (INTEGER)                     -- Current high bid
highest_bidder_user_id (INTEGER FK)       -- User with highest bid
total_bids (INTEGER)                      -- Total bid count
status (TEXT)                             -- 'active', 'completed', 'no_winner', 'cancelled'
winner_user_id (INTEGER FK)               -- Final winner
winner_points_paid (INTEGER)              -- Amount winner paid
winner_announced_at (DATETIME)            -- When winner determined
created_at (DATETIME)
```

**Auction Logic**:
1. Item sits in inventory for 30+ days without redemption
2. Automatically moved to auction (NEW status: `auction_pending` then `auction_active`)
3. User places bids (minimum 5 points, 1 point increments)
4. 72 hours after start, auction ends
5. Highest bidder wins, points deducted, item status → `auction_won`
6. If no bids: status → `no_winner`, item removed from circulation

---

### 10. AUCTION_BIDS Table
**Purpose**: Audit trail of all bids placed

```sql
bid_id (INTEGER PRIMARY KEY)
auction_id (INTEGER FK)                   -- Which auction
user_id (INTEGER FK)                      -- Who bid
bid_amount (INTEGER)                      -- Amount of bid (EcoPoints)
is_winning_bid (BOOLEAN)                  -- Is this the current high bid?
created_at (DATETIME)                     -- When bid placed
```

---

### 11. MATERIAL_BANK Table
**Purpose**: Track materials available for collection

```sql
material_id (INTEGER PRIMARY KEY)
user_id (INTEGER FK)                      -- Who is contributing
item_name (TEXT)                          -- "Cardboard Boxes"
material_type (TEXT)                      -- "cardboard", "plastic", "aluminum", "glass", "textiles"
quantity (INTEGER)                        -- How many
unit (TEXT)                               -- "pieces", "kg", "liters"
description (TEXT)                        -- Details
location (TEXT)                           -- Where to collect from
available_for_collection (BOOLEAN)        -- Can someone pick it up?
matched_with_collector (BOOLEAN)          -- Has a collector claimed it?
matched_collector_user_id (INTEGER FK)    -- Who's collecting it
matched_at (DATETIME)                     -- When matched
collected_at (DATETIME)                   -- When actually picked up
estimated_points (INTEGER)                -- Estimated reward
actual_points_awarded (INTEGER)           -- Actual reward
status (TEXT)                             -- 'available', 'pending_collection', 'collected', 'expired'
created_at (DATETIME)
```

---

### 12. COLLECTION_DRIVES Table
**Purpose**: Organize scheduled collection events

```sql
drive_id (INTEGER PRIMARY KEY)
hub_id (INTEGER FK)                       -- Which hub
drive_name (TEXT)                         -- "January Winter Clean-Out"
drive_date (DATE)                         -- When
start_time (TIME)                         -- Opening time
end_time (TIME)                           -- Closing time
expected_items (INTEGER)                  -- Forecast
items_collected (INTEGER)                 -- Actual collected
status (TEXT)                             -- 'planned', 'ongoing', 'completed'
created_at (DATETIME)
```

---

### 13. ADMIN_LOGS Table
**Purpose**: Audit trail for administrator actions

```sql
log_id (INTEGER PRIMARY KEY)
admin_user_id (INTEGER FK)                -- Which admin
action (TEXT)                             -- "item_upload", "user_points_adjustment", "auction_created"
target_type (TEXT)                        -- "user", "item", "auction"
target_id (INTEGER)                       -- ID of affected entity
details (TEXT)                            -- JSON or text description
ip_address (TEXT)                         -- Who made the change (optional)
user_agent (TEXT)                         -- Browser/client info (optional)
created_at (DATETIME)
```

---

### 14. PLATFORM_STATS Table
**Purpose**: Daily snapshot of platform metrics

```sql
stat_id (INTEGER PRIMARY KEY)
stat_date (DATE UNIQUE)                   -- One row per day
total_users (INTEGER)                     -- Total registered
active_users_today (INTEGER)              -- Users active on this day
total_eco_points_distributed (INTEGER)    -- Cumulative
total_items_redeemed (INTEGER)            -- Cumulative
total_items_returned (INTEGER)            -- Cumulative
total_items_auctioned (INTEGER)           -- Cumulative
total_bids_placed (INTEGER)               -- Cumulative
total_referrals_completed (INTEGER)       -- Cumulative
created_at (DATETIME)
```

---

## Key Features

### 1. Time-Based Logic

#### 30-Day Auction Eligibility
Items automatically move to auction after 30 days without redemption:

```sql
-- Run daily or weekly
INSERT INTO auctions (item_id, auction_start_date, auction_end_date, starting_bid, status)
SELECT 
  item_id,
  CURRENT_TIMESTAMP,
  datetime(CURRENT_TIMESTAMP, '+72 hours'),
  5,
  'active'
FROM thrift_items
WHERE availability_status = 'available'
  AND DATE(uploaded_date) <= DATE('now', '-30 days');
```

#### Weekly Streak Calculation
Streaks reset if user doesn't participate that week:

```sql
-- Check if user was active this week
UPDATE weekly_streaks 
SET current_streak = CASE 
                      WHEN last_active_week = strftime('%Y-W%W', 'now')
                      THEN current_streak
                      ELSE 0
                    END
WHERE user_id = ?;
```

### 2. Complete Audit Trail

Every EcoPoints transaction is logged:
- Source of points (return, referral, redemption, auction, admin)
- Exact timestamp
- Reference to originating entity
- Balance after transaction

Enables:
- User point history
- Compliance/fraud detection
- Analytics by source
- Leaderboards

### 3. Referral Network Tracking

Supports multi-level analysis:
- Direct referrals (A → B)
- Referral chain (A → B → C)
- Reward tracking (who got paid, when)
- Device fingerprinting for abuse prevention

### 4. Role-Based Access Control

Three roles with different permissions:

| Role | Capabilities |
|------|---------------|
| `user` | View items, redeem, bid, return items, donate |
| `hub-admin` | Upload items, manage returns, view hub stats |
| `super-admin` | All admin functions, platform-wide adjustments |

### 5. Real-Time Inventory Management

```sql
-- Available items count by hub
SELECT hub_id, COUNT(*) as available
FROM thrift_items 
WHERE availability_status = 'available'
GROUP BY hub_id;

-- Items expiring soon (approaching 30-day threshold)
SELECT * FROM thrift_items
WHERE DATE(uploaded_date) = DATE('now', '-29 days');
```

---

## Installation & Setup

### Quick Start (5 minutes)

#### Prerequisites
- macOS/Linux/Windows
- SQLite3 installed
  - **macOS**: `brew install sqlite`
  - **Linux**: `sudo apt-get install sqlite3`
  - **Windows**: Download from [sqlite.org](https://www.sqlite.org/download.html)

#### Setup Steps

**1. Navigate to project directory**
```bash
cd /path/to/LOOPIFY/Loopify-1
```

**2. Make setup script executable**
```bash
chmod +x setup_database.sh
```

**3. Run setup**
```bash
./setup_database.sh
```

This will:
- Create fresh `loopify.db`
- Load schema from `database_schema.sql`
- Prompt to load seed data
- Display table count and statistics
- Validate database integrity

#### Manual Setup (if script doesn't work)

```bash
# Create database with schema
sqlite3 loopify.db < database_schema.sql

# Load seed data
sqlite3 loopify.db < database_seed_data.sql

# Test connection
sqlite3 loopify.db ".tables"
```

### Verification

```bash
# Check database size
ls -lh loopify.db

# Count tables
sqlite3 loopify.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"

# List all tables
sqlite3 loopify.db ".tables"

# Check user count
sqlite3 loopify.db "SELECT COUNT(*) FROM users;"
```

---

## API Reference

### Common Operations

#### Create New User
```sql
INSERT INTO users (name, email, password_hash, role, referral_code, eco_points)
VALUES ('John Doe', 'john@example.com', 'hashed_pwd_123', 'user', 'LOOP-J1K2', 0);
```

#### Award EcoPoints
```sql
BEGIN TRANSACTION;
UPDATE users SET eco_points = eco_points + 50 WHERE user_id = 1;
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, balance_after)
SELECT 1, 'earn', 'return', 50, 'Item return - Level 3', eco_points
FROM users WHERE user_id = 1;
COMMIT;
```

#### Place Auction Bid
```sql
BEGIN TRANSACTION;
INSERT INTO auction_bids (auction_id, user_id, bid_amount)
VALUES (1, 2, 45);
UPDATE auctions 
SET highest_bid = 45, highest_bidder_user_id = 2, total_bids = total_bids + 1
WHERE auction_id = 1 AND highest_bid < 45;
COMMIT;
```

#### Finalize Auction
```sql
BEGIN TRANSACTION;
UPDATE auctions 
SET status = 'completed', winner_user_id = highest_bidder_user_id, 
    winner_announced_at = CURRENT_TIMESTAMP
WHERE auction_id = 1;
UPDATE users SET eco_points = eco_points - (SELECT highest_bid FROM auctions WHERE auction_id = 1)
WHERE user_id = (SELECT winner_user_id FROM auctions WHERE auction_id = 1);
COMMIT;
```

#### Complete Return & Award Points
```sql
BEGIN TRANSACTION;
UPDATE returns SET status = 'completed', actual_points_awarded = 50 WHERE return_id = 1;
UPDATE users SET eco_points = eco_points + 50 WHERE user_id = (SELECT user_id FROM returns WHERE return_id = 1);
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason)
SELECT user_id, 'earn', 'return', 50, 'Return verified at hub' FROM returns WHERE return_id = 1;
COMMIT;
```

---

## Performance & Indexing

### Strategically Placed Indexes

```sql
-- User lookups (login, referral validation)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Transaction queries (user history, reporting)
CREATE INDEX idx_eco_user ON eco_transactions(user_id);
CREATE INDEX idx_eco_created ON eco_transactions(created_at);
CREATE INDEX idx_eco_source ON eco_transactions(source);

-- Inventory queries (store browsing, auction conversion)
CREATE INDEX idx_thrift_hub ON thrift_items(hub_id);
CREATE INDEX idx_thrift_status ON thrift_items(availability_status);
CREATE INDEX idx_thrift_category ON thrift_items(category);
CREATE INDEX idx_thrift_uploaded ON thrift_items(uploaded_date);  -- For 30-day detection

-- Auction queries (active auctions, bid tracking)
CREATE INDEX idx_auction_status ON auctions(status);
CREATE INDEX idx_auction_end_date ON auctions(auction_end_date);
```

### Query Performance Tips

1. **User History**: O(log n) with `idx_eco_user`
2. **Active Auctions**: O(log n) with `idx_auction_status` + `idx_auction_end_date`
3. **30-Day Eligibility**: O(log n) with `idx_thrift_uploaded`
4. **Hub Inventory**: O(log n) with `idx_thrift_hub` + `idx_thrift_status`

### Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| User login | <10ms | Email indexed |
| Get transaction history | <50ms | Indexed by user_id |
| Find eligible items for auction | <100ms | Indexed by date |
| List active auctions | <50ms | Indexed by status |
| Place bid | <20ms | Direct update |

---

## Scalability Roadmap

### Phase 1: SQLite (Current - Hackathon)
- Single file database
- No server required
- Perfect for rapid prototyping
- Supports up to ~100K users comfortably

### Phase 2: PostgreSQL (Growth)
When you outgrow SQLite:
```sql
-- Switch to PostgreSQL (nearly identical schema)
-- Changes:
-- - AUTOINCREMENT → SERIAL or BIGSERIAL
-- - DATETIME → TIMESTAMP
-- - Add PARTITIONING for eco_transactions table
-- - Add REPLICATION for high availability
```

### Phase 3: Microservices (Scale)
```
┌─────────────────┐     ┌─────────────────┐
│  Auth Service   │     │ EcoPoints Service│
│  (PostgreSQL)   │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
         ┌──────────────────────┐
         │  API Gateway         │
         │  (Node.js / Python)  │
         └──────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌─────────────────┐   ┌─────────────────┐
   │  Auction Service │   │  Material Bank  │
   │  (PostgreSQL)   │   │  (PostgreSQL)   │
   └─────────────────┘   └─────────────────┘
```

### Phase 4: Data Warehouse (Analytics)
```sql
-- Aggregate tables for reporting
CREATE TABLE eco_daily_stats AS
SELECT DATE(created_at) as date, source, 
       SUM(points_amount) as total_points,
       COUNT(*) as transaction_count
FROM eco_transactions
GROUP BY DATE(created_at), source;
```

---

## Troubleshooting

### Common Issues

#### 1. "database is locked"
```bash
# Too many concurrent writers in SQLite
# Solution: Use WAL (Write-Ahead Logging)
sqlite3 loopify.db "PRAGMA journal_mode=WAL;"
```

#### 2. Foreign key constraint fails
```bash
# Enable foreign key enforcement (may need to be done per connection)
sqlite3 loopify.db "PRAGMA foreign_keys = ON;"

# Then test a constraint
INSERT INTO eco_transactions (user_id, ...) VALUES (9999, ...);  -- Fails if user_id 9999 doesn't exist
```

#### 3. Auction not auto-creating
```bash
# Verify 30-day item exists
SELECT * FROM thrift_items 
WHERE DATE(uploaded_date) <= DATE('now', '-30 days')
  AND availability_status = 'available';

# Manually trigger conversion
INSERT INTO auctions (item_id, auction_start_date, auction_end_date, starting_bid)
SELECT item_id, CURRENT_TIMESTAMP, datetime(CURRENT_TIMESTAMP, '+72 hours'), 5
FROM thrift_items
WHERE uploaded_date <= DATE('now', '-30 days')
  AND item_id NOT IN (SELECT item_id FROM auctions);

UPDATE thrift_items SET availability_status = 'auction_active'
WHERE item_id IN (SELECT item_id FROM auctions WHERE status = 'active');
```

#### 4. Backup and restore
```bash
# Backup current database
cp loopify.db loopify.db.backup.$(date +%s)

# Export to SQL file
sqlite3 loopify.db ".dump" > backup.sql

# Restore from backup
sqlite3 new_loopify.db < backup.sql
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Check for expired auctions
- Award milestone bonuses for weekly streaks
- Generate daily stats snapshot

**Weekly**:
- Audit admin logs for suspicious activity
- Review material bank expiry
- Create collection drive reports

**Monthly**:
- Archive old transactions (if >1M rows)
- Update materialized views
- Performance analysis

### Database Health Check

```sql
-- Check for orphaned records
SELECT 'Orphaned returns' as issue, COUNT(*) as count 
FROM returns r 
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = r.user_id);

-- Check for broken auctions
SELECT 'Auctions without items' as issue, COUNT(*) as count 
FROM auctions a 
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_id = a.item_id);

-- Check for data inconsistencies
SELECT 'Users with negative points' as issue, COUNT(*) as count 
FROM users WHERE eco_points < 0;
```

---

## Advanced Topics

### Transaction Management

All multi-step operations should use transactions:

```sql
BEGIN TRANSACTION;
-- Multiple operations here
COMMIT;  -- Or ROLLBACK; to undo
```

### Window Functions

Calculate rankings and running totals:

```sql
-- Leaderboard with ranks
SELECT 
  user_id, 
  name, 
  eco_points,
  RANK() OVER (ORDER BY eco_points DESC) as rank
FROM users
WHERE status = 'active'
LIMIT 10;
```

### Triggers (Advanced)

Auto-update timestamps:

```sql
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP 
  WHERE user_id = NEW.user_id;
END;
```

---

## Support

For questions or issues:
1. Check example queries: `database_example_queries.sql`
2. Review schema documentation: `database_schema.sql`
3. Test with sample data: `database_seed_data.sql`
4. Run verification script: `setup_database.sh`

---

**Last Updated**: January 31, 2026
**Version**: 1.0
**Status**: Production Ready ✓
