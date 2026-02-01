# LOOPIFY DATABASE - QUICK REFERENCE GUIDE

> **TL;DR: Production-ready SQLite database for Loopify**

---

## 5-Minute Setup

```bash
# 1. Navigate to directory
cd /path/to/LOOPIFY/Loopify-1

# 2. Run setup
bash setup_database.sh

# 3. Done! Database is ready
```

---

## Database Files

| File | Purpose |
|------|---------|
| `loopify.db` | Main database (created by setup) |
| `database_schema.sql` | Table definitions & constraints |
| `database_seed_data.sql` | 10 sample users, 5 hubs, test data |
| `database_example_queries.sql` | 50+ ready-to-use queries |
| `setup_database.sh` | One-command initialization |
| `DATABASE_DOCUMENTATION.md` | Full technical docs |

---

## Quick Access

### Open Database Shell
```bash
sqlite3 loopify.db
```

### Run Queries
```bash
# Single query
sqlite3 loopify.db "SELECT * FROM users LIMIT 5;"

# From file
sqlite3 loopify.db < database_example_queries.sql

# Export to CSV
sqlite3 loopify.db ".mode csv" ".output export.csv" "SELECT * FROM users;" ".quit"
```

### Backup Database
```bash
cp loopify.db loopify.db.backup.$(date +%s)
# Or: sqlite3 loopify.db ".dump" > backup.sql
```

---

## Core Tables (14 total)

```
users ──────────────────────┐
  ├─ eco_transactions       │
  ├─ weekly_streaks         │
  ├─ referral_relationships │
  ├─ returns ───┐           │
  └─ admin_logs │           │
                │           │
            hubs ◄──────────┤
              ├─ thrift_items ───────┐
              │  ├─ redemptions      │
              │  └─ auctions         │
              │     └─ auction_bids  │
              └─ collection_drives   │
                                     ↓
                        material_bank + platform_stats
```

---

## Essential Queries

### EcoPoints

**Award points to user**:
```sql
UPDATE users SET eco_points = eco_points + 50 WHERE user_id = 1;
INSERT INTO eco_transactions 
VALUES (NULL, 1, 'earn', 'return', 50, 'Return verified', NULL, NULL, (SELECT eco_points FROM users WHERE user_id = 1), CURRENT_TIMESTAMP);
```

**Get user balance**:
```sql
SELECT user_id, name, eco_points FROM users WHERE user_id = 1;
```

**Get transaction history**:
```sql
SELECT * FROM eco_transactions WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20;
```

### Referrals

**Award referral bonuses** (30 to referrer, 10 to referred):
```sql
UPDATE users SET eco_points = eco_points + 30 WHERE user_id = 1;  -- Referrer
UPDATE users SET eco_points = eco_points + 10 WHERE user_id = 10; -- Referred
UPDATE referral_relationships SET referrer_reward_given = 1, referred_reward_given = 1 
WHERE referrer_user_id = 1 AND referred_user_id = 10;
```

### Auctions

**List active auctions**:
```sql
SELECT a.auction_id, ti.item_name, a.highest_bid, u.name as highest_bidder, 
       datetime(a.auction_end_date, 'localtime') as ends_at
FROM auctions a
JOIN thrift_items ti ON a.item_id = ti.item_id
LEFT JOIN users u ON a.highest_bidder_user_id = u.user_id
WHERE a.status = 'active' AND a.auction_end_date > datetime('now');
```

**Move 30+ day items to auction**:
```sql
INSERT INTO auctions (item_id, auction_start_date, auction_end_date, starting_bid, status)
SELECT item_id, CURRENT_TIMESTAMP, datetime(CURRENT_TIMESTAMP, '+72 hours'), 5, 'active'
FROM thrift_items
WHERE availability_status = 'available' 
  AND DATE(uploaded_date) <= DATE('now', '-30 days')
  AND item_id NOT IN (SELECT item_id FROM auctions);
```

**Place bid**:
```sql
INSERT INTO auction_bids (auction_id, user_id, bid_amount) VALUES (1, 2, 55);
UPDATE auctions SET highest_bid = 55, highest_bidder_user_id = 2, total_bids = total_bids + 1 
WHERE auction_id = 1;
```

**Finalize auction** (run when `auction_end_date <= now()`):
```sql
UPDATE auctions SET status = 'completed', winner_user_id = highest_bidder_user_id, 
  winner_announced_at = CURRENT_TIMESTAMP WHERE auction_id = 1;
UPDATE users SET eco_points = eco_points - (SELECT highest_bid FROM auctions WHERE auction_id = 1)
WHERE user_id = (SELECT winner_user_id FROM auctions WHERE auction_id = 1);
```

### Streaks

**Update streak after activity**:
```sql
UPDATE weekly_streaks 
SET current_streak = current_streak + 1,
    longest_streak = MAX(current_streak + 1, longest_streak),
    last_active_week = strftime('%Y-W%W', 'now')
WHERE user_id = 1 AND last_active_week != strftime('%Y-W%W', 'now');
```

**Award milestone bonus** (every 4 weeks):
```sql
UPDATE users SET eco_points = eco_points + 50 
WHERE user_id IN (SELECT user_id FROM weekly_streaks WHERE milestone_earned = 1 AND milestone_bonus_claimed = 0);
UPDATE weekly_streaks SET milestone_bonus_claimed = 1 WHERE milestone_earned = 1 AND milestone_bonus_claimed = 0;
```

### Analytics

**Top users by points**:
```sql
SELECT user_id, name, eco_points FROM users ORDER BY eco_points DESC LIMIT 10;
```

**Hub statistics**:
```sql
SELECT h.hub_name, COUNT(DISTINCT ti.item_id) as items,
       COUNT(DISTINCT r.return_id) as returns,
       COUNT(DISTINCT a.auction_id) as auctions
FROM hubs h
LEFT JOIN thrift_items ti ON h.hub_id = ti.hub_id
LEFT JOIN returns r ON h.hub_id = r.hub_id
LEFT JOIN auctions a ON ti.item_id = a.item_id
GROUP BY h.hub_id;
```

---

## Schema Overview

### Users & Auth
- `users` - Accounts, email, roles, referral codes, EcoPoints

### Transactions
- `eco_transactions` - Complete audit log (earn/spend)
- `admin_logs` - Admin action history

### Engagement
- `weekly_streaks` - Streak count, milestone tracking
- `referral_relationships` - Referral network & rewards

### Locations
- `hubs` - 5 circular hub locations
- `collection_drives` - Scheduled pickups

### Items & Commerce
- `thrift_items` - Inventory (available, auction_active, redeemed, etc.)
- `redemptions` - Completed item purchases
- `auctions` - 72-hour auctions for 30+ day items
- `auction_bids` - Bid history with timestamps

### Returns
- `returns` - User donations/returns with status flow

### Materials
- `material_bank` - Available materials for collection

### Analytics
- `platform_stats` - Daily snapshots

---

## Data Model Highlights

### EcoPoints Flow
```
User Action (return, referral, redemption, auction win)
    ↓
Validated
    ↓
Points updated in users table
    ↓
Transaction recorded in eco_transactions (audit trail)
```

### Item Lifecycle (30-Day Auction Rule)
```
available (day 0-29)
    ↓ (day 30 passes)
auction_pending → auction_active (72-hour auction)
    ↓
auction_won (highest bidder assigned)
    ↓
(or: redeemed if user bought before 30 days)
```

### Referral Rewards
```
referrer (A) invites referred (B)
    ↓
B joins platform
    ↓
B makes first transaction
    ↓
A gets +30 points (referrer bonus)
B gets +10 points (first-action bonus)
    ↓
Both one-time only
```

---

## Sample Data Included

**Users** (10 total):
- 8 regular users with various EcoPoints balances
- 1 hub-admin (Carol, Frank)
- 1 super-admin (Admin User)

**Hubs** (5 locations):
- Downtown, South Side, North Side, West Side, East Side

**Items** (10 in inventory):
- Electronics, clothing, furniture, books, accessories, sports

**Auctions** (3 active):
- 72-hour bidding, starting at 5 points
- Sample bids and winners

**Returns** (8 logged):
- Mix of Level 3 (donations) and Level 4 (materials)
- Various fulfillment types

---

## Constraints & Validation

| Table | Constraint | Meaning |
|-------|-----------|---------|
| users | role IN (...) | Only valid roles allowed |
| users | email UNIQUE | One account per email |
| users | referral_code UNIQUE | Each code unique |
| thrift_items | quantity_available >= 0 | Can't have negative stock |
| auctions | starting_bid >= 5 | Minimum 5 points |
| returns | level IN (3, 4) | Only Level 3 or 4 |
| eco_transactions | FK user_id | Every transaction has a user |
| auction_bids | FK auction_id | Every bid tied to auction |

---

## Foreign Keys Enforced

Every table with FK has referential integrity:
- Can't insert return for non-existent user
- Can't bid on non-existent auction
- Can't delete hub with active items

---

## Indexes (Optimized Queries)

Fast lookups on:
- User email (login)
- User referral code (validation)
- Thrift item uploaded date (30-day detection)
- Auction status & end date (active auctions)
- Transaction user & date (history)
- Eco transaction source (reporting)

---

## SQLite Specifics

```bash
# Enable foreign keys (per connection)
sqlite3 loopify.db
sqlite> PRAGMA foreign_keys = ON;

# Enable WAL mode for better concurrency
sqlite3 loopify.db "PRAGMA journal_mode=WAL;"

# Check size
ls -lh loopify.db

# Integrity check
sqlite3 loopify.db "PRAGMA integrity_check;"

# Analyze and optimize
sqlite3 loopify.db "ANALYZE;"
```

---

## Integration with Frontend

### JavaScript/Node.js

```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('loopify.db');

// Get user points
db.get(
  'SELECT eco_points FROM users WHERE user_id = ?',
  [userId],
  (err, row) => console.log(row.eco_points)
);

// Award points
db.run(
  'UPDATE users SET eco_points = eco_points + ? WHERE user_id = ?',
  [points, userId],
  () => console.log('Points awarded')
);
```

### Python

```python
import sqlite3

conn = sqlite3.connect('loopify.db')
cursor = conn.cursor()

# Get user
cursor.execute('SELECT * FROM users WHERE user_id = ?', (1,))
user = cursor.fetchone()

# Award points
cursor.execute('UPDATE users SET eco_points = eco_points + 50 WHERE user_id = 1')
conn.commit()

conn.close()
```

---

## Maintenance Checklist

- [ ] Run setup_database.sh
- [ ] Verify table count: 14 tables
- [ ] Check seed data loaded: 10 users
- [ ] Test constraints with example queries
- [ ] Backup database regularly
- [ ] Monitor for locked database errors
- [ ] Archive old transactions (>1M rows)
- [ ] Update platform_stats daily

---

## Next Steps

1. **Integrate with backend**: Use provided queries as API endpoints
2. **Add backend API**: Node.js/Python server to handle business logic
3. **Frontend integration**: Connect web app to database via API
4. **Real-time updates**: WebSocket for live auction timers
5. **Analytics dashboard**: Weekly/monthly reports using views
6. **Scale to PostgreSQL**: When >100K users

---

**Status**: ✅ Production Ready
**Scalable**: Yes (to PostgreSQL/Microservices)
**Documentation**: Complete
**Sample Data**: Included

For details, see `DATABASE_DOCUMENTATION.md`
