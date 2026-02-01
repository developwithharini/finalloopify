# LOOPIFY BACKEND API

> **Full-featured REST API connecting the Loopify frontend to SQLite database**

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database (if not done)
```bash
bash setup_database.sh
```

### 3. Start API Server
```bash
npm start
```

**Server running at**: `http://localhost:3000`

### 4. Access Frontend
```
http://localhost:3000/static/app.html
http://localhost:3000/static/thriftloop.html
```

---

## Architecture

```
┌─────────────────────────────────────┐
│   Frontend (HTML/JS in /static)     │
│   - app.html                        │
│   - thriftloop.html                 │
│   - etc.                            │
└────────────┬────────────────────────┘
             │ (HTTP Requests)
             ↓
┌─────────────────────────────────────┐
│   Express.js API Server             │
│   - server.js (PORT 3000)           │
│   - 40+ REST endpoints              │
│   - CORS enabled                    │
└────────────┬────────────────────────┘
             │ (Database Queries)
             ↓
┌─────────────────────────────────────┐
│   SQLite Database                   │
│   - loopify.db                      │
│   - 14 normalized tables            │
│   - Foreign keys enforced           │
└─────────────────────────────────────┘
```

---

## API Endpoints

### Health & Status
```
GET /api/health
  Returns: { status, timestamp, database }
```

### Users
```
GET    /api/users                          - List all users (paginated)
GET    /api/users/:userId                  - Get user by ID
GET    /api/users/email/:email             - Get user by email
GET    /api/users/:userId/balance          - Get EcoPoints balance
GET    /api/users/:userId/transactions     - Get transaction history
POST   /api/users                          - Create new user
PATCH  /api/users/:userId/points           - Award/deduct points
```

### Items & Redemption
```
GET    /api/items                          - Get available items (filter by hub, category)
GET    /api/items/:itemId                  - Get item details
POST   /api/items/:itemId/redeem           - Redeem item with EcoPoints
```

### Auctions
```
GET    /api/auctions                       - Get active auctions
GET    /api/auctions/:auctionId            - Get auction with bids
POST   /api/auctions/:auctionId/bid        - Place bid on auction
```

### Hubs
```
GET    /api/hubs                           - Get all active hubs
GET    /api/hubs/:hubId                    - Get hub details with stats
```

### Returns & Donations
```
GET    /api/users/:userId/returns          - Get user's returns
POST   /api/returns                        - Create new return/donation
```

### Referrals
```
GET    /api/users/:userId/referrals        - Get referral info
```

### Streaks
```
GET    /api/users/:userId/streak           - Get weekly streak info
```

### Analytics
```
GET    /api/stats                          - Platform statistics
GET    /api/leaderboard                    - Top users by EcoPoints
```

---

## Integration Guide

### In HTML Files

**1. Include the API client**:
```html
<script src="loopify-api-client.js"></script>
```

**2. Replace localStorage calls with API calls**:

**Before (localStorage)**:
```javascript
const balance = localStorage.getItem('eco_points');
```

**After (API)**:
```javascript
const user = await LoopifyAPI.getBalance(userId);
const balance = user.eco_points;
```

### Examples

**Get user profile**:
```javascript
const user = await LoopifyAPI.getUser(1);
console.log(user.name, user.eco_points);
```

**Award points**:
```javascript
await LoopifyAPI.awardPoints(1, 50, 'Item returned');
```

**Get available items**:
```javascript
const items = await LoopifyAPI.getItems(hubId = 1, category = 'Electronics');
items.forEach(item => console.log(item.item_name, item.eco_points_cost));
```

**Redeem item**:
```javascript
await LoopifyAPI.redeemItem(itemId = 5, userId = 1, fulfillmentType = 'pickup');
```

**Get active auctions**:
```javascript
const auctions = await LoopifyAPI.getAuctions();
auctions.forEach(a => console.log(a.item_name, a.highest_bid, a.auction_end_date));
```

**Place bid**:
```javascript
await LoopifyAPI.placeBid(auctionId = 1, userId = 2, bidAmount = 55);
```

**Get leaderboard**:
```javascript
const topUsers = await LoopifyAPI.getLeaderboard(limit = 10);
topUsers.forEach(u => console.log(`${u.rank}. ${u.name} - ${u.eco_points}`));
```

---

## Database Connection

The API automatically:
1. ✅ Connects to `loopify.db` (or env var `DB_FILE`)
2. ✅ Enables foreign key constraints
3. ✅ Enforces data integrity
4. ✅ Logs all queries

**Check connection**:
```bash
curl http://localhost:3000/api/health
```

---

## Environment Variables

Create `.env` file to customize:

```env
PORT=3000              # Server port
DB_FILE=./loopify.db   # Database path
NODE_ENV=development   # development or production
```

---

## Package Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `sqlite3` | Database driver |
| `cors` | Cross-origin requests |
| `body-parser` | JSON parsing |
| `uuid` | ID generation |

Install: `npm install`

---

## Common Tasks

### Backup Database
```bash
cp loopify.db loopify.db.backup.$(date +%s)
```

### Run Example Queries
```bash
sqlite3 loopify.db < database_example_queries.sql
```

### Check API Status
```bash
curl http://localhost:3000/api/health
```

### Get User Stats
```bash
curl http://localhost:3000/api/stats
```

### View Leaderboard
```bash
curl http://localhost:3000/api/leaderboard?limit=5
```

---

## Advanced Usage

### Raw SQL Queries

For complex operations, run queries directly:

```bash
sqlite3 loopify.db
sqlite> SELECT * FROM users WHERE eco_points > 100;
sqlite> .quit
```

### Batch Operations

Script example:
```bash
#!/bin/bash
for user in {1..10}; do
  curl -X PATCH http://localhost:3000/api/users/$user/points \
    -H "Content-Type: application/json" \
    -d '{"points": 50, "reason": "Monthly bonus"}'
done
```

---

## Troubleshooting

### "Database locked" error
```bash
# Enable WAL mode
sqlite3 loopify.db "PRAGMA journal_mode=WAL;"
```

### API not responding
```bash
# Check if server is running
lsof -i :3000

# Check for errors
npm start
```

### CORS errors
The API has CORS enabled by default. If issues persist:
```javascript
// In server.js, update CORS options:
app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true
}));
```

### Foreign key constraint errors
```bash
# Verify data integrity
sqlite3 loopify.db "PRAGMA integrity_check;"
```

---

## Production Deployment

### Using PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "loopify-api"
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Using Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name api.loopify.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

---

## Performance Tips

1. **Indexes**: Database uses optimized indexes
2. **Caching**: Add Redis for hot data (optional)
3. **Connection pooling**: sqlite3 handles this automatically
4. **Query optimization**: Use provided example queries
5. **Pagination**: Always paginate large result sets

---

## Security Notes

⚠️ **For Production**:
- [ ] Use password hashing (bcrypt) for user passwords
- [ ] Add authentication tokens (JWT)
- [ ] Validate all inputs
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Add request validation middleware

Example JWT middleware:
```javascript
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  // Verify token
  next();
};

app.use('/api/', verifyToken);
```

---

## Files

| File | Purpose |
|------|---------|
| `server.js` | Main API server |
| `loopify-api-client.js` | Frontend integration helper |
| `package.json` | Dependencies |
| `loopify.db` | SQLite database |
| `database_schema.sql` | Database schema |
| `database_seed_data.sql` | Sample data |

---

## Next Steps

1. ✅ Start API server: `npm start`
2. ✅ Test endpoints: `curl http://localhost:3000/api/health`
3. ✅ Integrate frontend: Add `<script src="loopify-api-client.js"></script>`
4. ✅ Replace localStorage with API calls
5. ✅ Deploy to production

---

**API Version**: 1.0
**Status**: Production Ready ✓
**Last Updated**: January 31, 2026
