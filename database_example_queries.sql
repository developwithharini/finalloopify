/**
 * LOOPIFY DATABASE - EXAMPLE QUERIES
 * 
 * Common operations and business logic queries
 * Ready-to-use SQL for:
 * - EcoPoints management
 * - Weekly streak calculations
 * - Auction operations
 * - User analytics
 * - Reporting
 */

-- ============================================================================
-- 1. ECOPOINTS MANAGEMENT
-- ============================================================================

-- Award EcoPoints to a user (with audit trail)
-- Example: User completes a return and earns 50 points
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, reference_id, reference_type, balance_after)
SELECT 
  1 as user_id,
  'earn' as transaction_type,
  'return' as source,
  50 as points_amount,
  'Item return - Level 3' as reason,
  1 as reference_id,
  'return' as reference_type,
  (SELECT eco_points FROM users WHERE user_id = 1) + 50 as balance_after;

UPDATE users SET eco_points = eco_points + 50 WHERE user_id = 1;

-- Deduct EcoPoints for redemption
-- Example: User redeems an item for 40 points
UPDATE users SET eco_points = eco_points - 40 WHERE user_id = 1 AND eco_points >= 40;
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, reference_id, reference_type, balance_after)
SELECT 
  1,
  'spend',
  'redemption',
  -40,
  'Redeemed vintage jacket',
  1,
  'redemption',
  (SELECT eco_points FROM users WHERE user_id = 1);

-- Get user's current EcoPoints balance
SELECT user_id, name, email, eco_points FROM users WHERE user_id = 1;

-- Get EcoPoints transaction history for a user
SELECT 
  transaction_id,
  transaction_type,
  source,
  points_amount,
  reason,
  created_at
FROM eco_transactions 
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 20;

-- Get total points earned by source
SELECT 
  source,
  SUM(CASE WHEN transaction_type = 'earn' THEN points_amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN transaction_type = 'spend' THEN ABS(points_amount) ELSE 0 END) as total_spent,
  COUNT(*) as transaction_count
FROM eco_transactions
WHERE user_id = 1
GROUP BY source;

-- ============================================================================
-- 2. REFERRAL MANAGEMENT
-- ============================================================================

-- Get referral info for a specific user
SELECT 
  u.user_id,
  u.name,
  u.referral_code,
  u.referred_by_user_id,
  referrer.name as referred_by_name,
  COUNT(rr.referred_user_id) as users_referred,
  SUM(CASE WHEN rr.referrer_reward_given = 1 THEN 30 ELSE 0 END) as referral_rewards_earned
FROM users u
LEFT JOIN users referrer ON u.referred_by_user_id = referrer.user_id
LEFT JOIN referral_relationships rr ON u.user_id = rr.referrer_user_id
WHERE u.user_id = 1
GROUP BY u.user_id;

-- Award referral bonuses (30 points to referrer, 10 points to referred)
-- Step 1: Create referral relationship
INSERT INTO referral_relationships (referrer_user_id, referred_user_id, referrer_reward_given, referred_reward_given)
VALUES (1, 10, 0, 0);

-- Step 2: Award referrer bonus
UPDATE users SET eco_points = eco_points + 30 WHERE user_id = 1;
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason)
VALUES (1, 'earn', 'referral', 30, 'Referral bonus - new user signup');

-- Step 3: Award referred user bonus
UPDATE users SET eco_points = eco_points + 10 WHERE user_id = 10;
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason)
VALUES (10, 'earn', 'referral', 10, 'First user referral bonus');

-- Step 4: Mark rewards as given
UPDATE referral_relationships 
SET referrer_reward_given = 1, referred_reward_given = 1 
WHERE referrer_user_id = 1 AND referred_user_id = 10;

-- Get all referrals by a user with reward status
SELECT 
  rr.referral_id,
  rr.referred_user_id,
  u.name as referred_user_name,
  u.email,
  rr.referral_date,
  rr.referrer_reward_given,
  rr.referred_reward_given,
  rr.reward_date
FROM referral_relationships rr
JOIN users u ON rr.referred_user_id = u.user_id
WHERE rr.referrer_user_id = 1
ORDER BY rr.referral_date DESC;

-- Get pending referral rewards to process
SELECT 
  rr.referral_id,
  rr.referrer_user_id,
  r.name as referrer_name,
  rr.referred_user_id,
  u.name as referred_name,
  rr.referrer_reward_given,
  rr.referred_reward_given
FROM referral_relationships rr
JOIN users r ON rr.referrer_user_id = r.user_id
JOIN users u ON rr.referred_user_id = u.user_id
WHERE (rr.referrer_reward_given = 0 OR rr.referred_reward_given = 0)
  AND DATE(rr.referral_date) <= DATE('now', '-1 day');

-- ============================================================================
-- 3. WEEKLY STREAK MANAGEMENT
-- ============================================================================

-- Check and update weekly streak for a user
-- Pseudocode: If user was active this week, increment streak. 
-- Otherwise, reset to 0 (but keep longest_streak).

-- Get current week in ISO format
-- In real app: SELECT strftime('%Y-W%W', 'now') as current_week;

-- Check if user was active this week (any transaction in current week)
SELECT 
  u.user_id,
  u.name,
  ws.current_streak,
  ws.longest_streak,
  ws.last_active_week,
  (SELECT MAX(created_at) FROM eco_transactions WHERE user_id = u.user_id) as last_transaction,
  CASE 
    WHEN strftime('%Y-W%W', ws.last_active_week || '-1') = strftime('%Y-W%W', 'now')
    THEN 'Active this week'
    ELSE 'Not active this week'
  END as streak_status
FROM users u
LEFT JOIN weekly_streaks ws ON u.user_id = ws.user_id
WHERE u.user_id = 1;

-- Update streak after user activity
UPDATE weekly_streaks 
SET current_streak = current_streak + 1,
    longest_streak = CASE 
                      WHEN current_streak + 1 > longest_streak 
                      THEN current_streak + 1 
                      ELSE longest_streak 
                    END,
    last_active_week = strftime('%Y-W%W', 'now'),
    milestone_earned = CASE 
                        WHEN (current_streak + 1) % 4 = 0 THEN 1
                        ELSE 0
                      END
WHERE user_id = 1 
  AND last_active_week != strftime('%Y-W%W', 'now');

-- Award milestone bonus (every 4 weeks)
-- After updating streak, check if milestone_earned and bonus not claimed
UPDATE users 
SET eco_points = eco_points + 50
WHERE user_id IN (
  SELECT user_id FROM weekly_streaks 
  WHERE milestone_earned = 1 
    AND milestone_bonus_claimed = 0
);

UPDATE weekly_streaks
SET milestone_bonus_claimed = 1
WHERE milestone_earned = 1 AND milestone_bonus_claimed = 0;

-- Get users on active streaks (to display leaderboard)
SELECT 
  u.user_id,
  u.name,
  u.email,
  ws.current_streak,
  ws.longest_streak,
  u.eco_points,
  RANK() OVER (ORDER BY ws.current_streak DESC) as streak_rank
FROM users u
LEFT JOIN weekly_streaks ws ON u.user_id = ws.user_id
WHERE ws.current_streak > 0
ORDER BY ws.current_streak DESC
LIMIT 10;

-- ============================================================================
-- 4. ITEM MANAGEMENT & THRIFT OPERATIONS
-- ============================================================================

-- Get available items for redemption
SELECT 
  item_id,
  item_name,
  category,
  description,
  eco_points_cost,
  condition,
  h.hub_name,
  quantity_available
FROM thrift_items ti
JOIN hubs h ON ti.hub_id = h.hub_id
WHERE availability_status = 'available'
  AND quantity_available > 0
ORDER BY category, item_name;

-- Get items by hub
SELECT 
  h.hub_name,
  COUNT(CASE WHEN ti.availability_status = 'available' THEN 1 END) as available_items,
  COUNT(CASE WHEN ti.availability_status = 'redeemed' THEN 1 END) as redeemed_items,
  COUNT(CASE WHEN ti.availability_status = 'auction_active' THEN 1 END) as auction_items
FROM hubs h
LEFT JOIN thrift_items ti ON h.hub_id = ti.hub_id
GROUP BY h.hub_id, h.hub_name;

-- Redeem an item (complete transaction)
-- Step 1: Check user has enough points
SELECT eco_points FROM users WHERE user_id = 1 AND eco_points >= 40;

-- Step 2: Update item as redeemed
UPDATE thrift_items 
SET redeemed = 1, 
    redeemed_by_user_id = 1, 
    redeemed_at = CURRENT_TIMESTAMP,
    availability_status = 'redeemed'
WHERE item_id = 1;

-- Step 3: Deduct points
UPDATE users SET eco_points = eco_points - 40 WHERE user_id = 1;

-- Step 4: Record redemption
INSERT INTO redemptions (item_id, user_id, eco_points_paid, fulfillment_type, fulfillment_hub_id)
VALUES (1, 1, 40, 'pickup', 1);

-- Step 5: Record transaction
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, reference_id, reference_type, balance_after)
SELECT 1, 'spend', 'redemption', -40, 'Redeemed vintage jacket', 1, 'redemption', eco_points
FROM users WHERE user_id = 1;

-- ============================================================================
-- 5. AUCTION OPERATIONS
-- ============================================================================

-- Move unredeemed items to auction after 30 days
-- This should run daily or weekly
INSERT INTO auctions (item_id, auction_start_date, auction_end_date, starting_bid, status)
SELECT 
  item_id,
  CURRENT_TIMESTAMP,
  datetime(CURRENT_TIMESTAMP, '+72 hours'),
  5,
  'active'
FROM thrift_items
WHERE availability_status = 'available'
  AND quantity_available > 0
  AND DATE(uploaded_date) <= DATE('now', '-30 days')
  AND item_id NOT IN (SELECT item_id FROM auctions WHERE status IN ('active', 'completed'));

-- Update thrift items status after auction creation
UPDATE thrift_items
SET availability_status = 'auction_active'
WHERE item_id IN (
  SELECT item_id FROM auctions WHERE status = 'active'
);

-- Place a bid on an auction
-- Step 1: Validate bid amount (higher than current highest)
SELECT auction_id, highest_bid, starting_bid 
FROM auctions 
WHERE auction_id = 1 AND status = 'active';

-- Step 2: Record the bid
INSERT INTO auction_bids (auction_id, user_id, bid_amount, is_winning_bid)
VALUES (1, 2, 55, 1);

-- Step 3: Update auction with new highest bid
UPDATE auctions 
SET highest_bid = 55, 
    highest_bidder_user_id = 2,
    total_bids = total_bids + 1,
    is_winning_bid = 1
WHERE auction_id = 1;

-- Step 4: Mark previous winning bid as not winning
UPDATE auction_bids 
SET is_winning_bid = 0 
WHERE auction_id = 1 AND user_id != 2 AND is_winning_bid = 1;

-- Get active auctions with bid info
SELECT 
  a.auction_id,
  ti.item_name,
  ti.category,
  a.starting_bid,
  a.highest_bid,
  u.name as highest_bidder,
  a.total_bids,
  a.auction_end_date,
  CAST((julianday(a.auction_end_date) - julianday('now')) AS INTEGER) as hours_remaining,
  h.hub_name
FROM auctions a
JOIN thrift_items ti ON a.item_id = ti.item_id
JOIN hubs h ON ti.hub_id = h.hub_id
LEFT JOIN users u ON a.highest_bidder_user_id = u.user_id
WHERE a.status = 'active'
  AND a.auction_end_date > datetime('now')
ORDER BY a.auction_end_date ASC;

-- Finalize expired auctions (run at end of auction time)
-- Step 1: Find expired active auctions
SELECT * FROM auctions 
WHERE status = 'active' 
  AND auction_end_date <= datetime('now');

-- Step 2: For each expired auction with bids, award to winner
UPDATE auctions 
SET status = 'completed',
    winner_user_id = highest_bidder_user_id,
    winner_points_paid = highest_bid,
    winner_announced_at = CURRENT_TIMESTAMP
WHERE auction_id = 1 
  AND highest_bidder_user_id IS NOT NULL;

-- Step 3: Deduct points from winner
UPDATE users 
SET eco_points = eco_points - (SELECT highest_bid FROM auctions WHERE auction_id = 1)
WHERE user_id = (SELECT highest_bidder_user_id FROM auctions WHERE auction_id = 1);

-- Step 4: Record transaction
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, reference_id, reference_type, balance_after)
SELECT 
  highest_bidder_user_id,
  'spend',
  'auction',
  -(SELECT highest_bid FROM auctions WHERE auction_id = 1),
  'Won auction: ' || (SELECT item_name FROM thrift_items WHERE item_id = (SELECT item_id FROM auctions WHERE auction_id = 1)),
  1,
  'auction',
  (SELECT eco_points FROM users WHERE user_id = (SELECT highest_bidder_user_id FROM auctions WHERE auction_id = 1))
FROM auctions
WHERE auction_id = 1;

-- Step 5: Mark item as auction_won
UPDATE thrift_items
SET availability_status = 'auction_won',
    redeemed_by_user_id = (SELECT winner_user_id FROM auctions WHERE auction_id = 1)
WHERE item_id = (SELECT item_id FROM auctions WHERE auction_id = 1);

-- Get auction with no bids (mark as no_winner)
UPDATE auctions 
SET status = 'no_winner'
WHERE status = 'active'
  AND auction_end_date <= datetime('now')
  AND highest_bidder_user_id IS NULL;

-- ============================================================================
-- 6. RETURNS & DONATIONS MANAGEMENT
-- ============================================================================

-- Record a return/donation
INSERT INTO returns (user_id, hub_id, level, return_type, fulfillment_type, quantity, items_list, estimated_points, status)
VALUES (1, 1, 3, 'return', 'self-drop', 1, 'Used clothes and shoes', 50, 'pending');

-- Update return status to received
UPDATE returns SET status = 'received', received_at = CURRENT_TIMESTAMP WHERE return_id = 1;

-- Verify return and award points
UPDATE returns 
SET status = 'completed', 
    actual_points_awarded = 50
WHERE return_id = 1;

UPDATE users SET eco_points = eco_points + 50 WHERE user_id = 1;

INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, reference_id, reference_type, balance_after)
SELECT 1, 'earn', 'return', 50, 'Item return verified', 1, 'return', eco_points
FROM users WHERE user_id = 1;

-- Get all returns by user
SELECT 
  r.return_id,
  r.return_type,
  r.fulfillment_type,
  h.hub_name,
  r.quantity,
  r.items_list,
  r.actual_points_awarded,
  r.status,
  r.created_at
FROM returns r
JOIN hubs h ON r.hub_id = h.hub_id
WHERE r.user_id = 1
ORDER BY r.created_at DESC;

-- Get pending returns (for hub staff)
SELECT 
  r.return_id,
  u.name as user_name,
  u.email,
  r.level,
  r.return_type,
  r.fulfillment_type,
  r.quantity,
  r.items_list,
  r.estimated_points,
  r.created_at
FROM returns r
JOIN users u ON r.user_id = u.user_id
WHERE r.status IN ('pending', 'received')
ORDER BY r.created_at ASC;

-- ============================================================================
-- 7. COLLECTION DRIVE OPERATIONS
-- ============================================================================

-- Get upcoming collection drives
SELECT 
  cd.drive_id,
  cd.drive_name,
  h.hub_name,
  cd.drive_date,
  cd.start_time,
  cd.end_time,
  cd.expected_items,
  cd.items_collected,
  cd.status
FROM collection_drives cd
JOIN hubs h ON cd.hub_id = h.hub_id
WHERE cd.drive_date >= DATE('now')
ORDER BY cd.drive_date ASC;

-- Get items collected at a drive
SELECT 
  r.return_id,
  u.name as user_name,
  r.quantity,
  r.items_list,
  r.created_at
FROM returns r
JOIN users u ON r.user_id = u.user_id
WHERE r.hub_id = 1
  AND DATE(r.created_at) = '2026-01-30'
ORDER BY r.created_at DESC;

-- ============================================================================
-- 8. ANALYTICS & REPORTING
-- ============================================================================

-- User engagement statistics
SELECT 
  u.user_id,
  u.name,
  u.email,
  u.eco_points,
  u.role,
  COUNT(DISTINCT r.return_id) as total_returns,
  COUNT(DISTINCT red.redemption_id) as total_redemptions,
  COUNT(DISTINCT ab.bid_id) as total_bids,
  COUNT(DISTINCT rr.referred_user_id) as users_referred,
  MAX(et.created_at) as last_activity
FROM users u
LEFT JOIN returns r ON u.user_id = r.user_id
LEFT JOIN redemptions red ON u.user_id = red.user_id
LEFT JOIN auction_bids ab ON u.user_id = ab.user_id
LEFT JOIN referral_relationships rr ON u.user_id = rr.referrer_user_id
LEFT JOIN eco_transactions et ON u.user_id = et.user_id
GROUP BY u.user_id
ORDER BY u.eco_points DESC;

-- Hub performance statistics
SELECT 
  h.hub_id,
  h.hub_name,
  h.location,
  COUNT(DISTINCT r.return_id) as total_returns,
  SUM(CASE WHEN r.status = 'completed' THEN r.actual_points_awarded ELSE 0 END) as total_points_awarded,
  COUNT(DISTINCT ti.item_id) as total_items_uploaded,
  COUNT(DISTINCT a.auction_id) as active_auctions,
  h.last_collection_date
FROM hubs h
LEFT JOIN returns r ON h.hub_id = r.hub_id
LEFT JOIN thrift_items ti ON h.hub_id = ti.hub_id
LEFT JOIN auctions a ON ti.item_id = a.item_id AND a.status = 'active'
GROUP BY h.hub_id
ORDER BY total_points_awarded DESC;

-- Platform summary statistics
SELECT 
  COUNT(DISTINCT u.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.user_id END) as active_users,
  SUM(u.eco_points) as total_points_in_circulation,
  COUNT(DISTINCT ti.item_id) as total_items,
  COUNT(DISTINCT r.return_id) as total_returns,
  COUNT(DISTINCT a.auction_id) as total_auctions,
  COUNT(DISTINCT ab.bid_id) as total_bids_placed,
  COUNT(DISTINCT rr.referral_id) as total_referrals
FROM users u
LEFT JOIN thrift_items ti ON 1=1
LEFT JOIN returns r ON 1=1
LEFT JOIN auctions a ON 1=1
LEFT JOIN auction_bids ab ON 1=1
LEFT JOIN referral_relationships rr ON 1=1;

-- ============================================================================
-- 9. MATERIAL BANK OPERATIONS
-- ============================================================================

-- Get available materials for collection
SELECT 
  m.material_id,
  u.name as contributor_name,
  u.email,
  m.item_name,
  m.material_type,
  m.quantity,
  m.unit,
  m.description,
  m.location,
  m.estimated_points,
  m.created_at
FROM material_bank m
JOIN users u ON m.user_id = u.user_id
WHERE m.status = 'available'
  AND m.available_for_collection = 1
ORDER BY m.created_at DESC;

-- Record material collection completion
UPDATE material_bank
SET status = 'collected',
    collected_at = CURRENT_TIMESTAMP,
    actual_points_awarded = 150
WHERE material_id = 1;

UPDATE users SET eco_points = eco_points + 150 WHERE user_id = 1;

-- ============================================================================
-- 10. ADMIN OPERATIONS
-- ============================================================================

-- Log admin action
INSERT INTO admin_logs (admin_user_id, action, target_type, target_id, details, ip_address)
VALUES (9, 'user_points_adjustment', 'user', 1, 'Bonus points for streak milestone', '192.168.1.1');

-- Get admin activity log
SELECT 
  al.log_id,
  u.name as admin_name,
  al.action,
  al.target_type,
  al.target_id,
  al.details,
  al.created_at
FROM admin_logs al
JOIN users u ON al.admin_user_id = u.user_id
ORDER BY al.created_at DESC
LIMIT 50;

-- Bulk points adjustment (e.g., bonus points for all users)
INSERT INTO eco_transactions (user_id, transaction_type, source, points_amount, reason, balance_after)
SELECT 
  u.user_id,
  'earn',
  'admin',
  20,
  'New Year bonus for all users',
  u.eco_points + 20
FROM users u
WHERE u.status = 'active';

UPDATE users 
SET eco_points = eco_points + 20 
WHERE status = 'active';

INSERT INTO admin_logs (admin_user_id, action, target_type, details)
VALUES (9, 'bulk_points_adjustment', 'users', 'Awarded 20 bonus points to all active users');
