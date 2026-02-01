# ThriftLoop Quick Reference

## 🚀 Quick Start

### Access ThriftLoop
1. Open `app.html` in browser
2. Click **ThriftLoop** in sidebar under "REWARDS" section
3. Or navigate directly to `thriftloop.html`

### Earn EcoPoints
**Option A: ReturnBox (Level 3)**
- Return items → +10/20/30 points

**Option B: MaterialBank (Level 4)**
- List materials → +40 points
- Complete transaction → +50 points

### Redeem EcoPoints
1. Open ThriftLoop
2. Browse items (12 available)
3. Filter by category if desired
4. Click **"Redeem"** on item
5. Confirm in modal
6. Point deducted instantly
7. Track in "Redemption History"

---

## 💰 Item Inventory

| Category | Items | Price Range |
|----------|-------|------------|
| **Clothing** | Jackets, T-shirts, Sweaters, Bedsheets | 30-55 pts |
| **Home Decor** | Wall art, Macramé, Planters, Pillows | 32-50 pts |
| **Utility** | Tote bag, Utensils, Water bottle, Sunglasses | 25-40 pts |

---

## 🎯 Point Costs

**Minimum:** 25 points (Tote Bag)  
**Maximum:** 55 points (Linen Bedsheet Set)  
**Average:** ~38 points

---

## 📋 Item Details

### Clothing
- 👖 Vintage Denim Jacket (35 pts) - Excellent
- 👕 Organic Cotton T-Shirt Set (30 pts) - Like New
- 🧶 Sustainable Wool Sweater (45 pts) - Excellent
- 🛏️ Linen Bedsheet Set (55 pts) - Excellent

### Home Decor
- 🎨 Vintage Wooden Wall Art (50 pts) - Good
- ✨ Boho Macramé Wall Hanging (35 pts) - Excellent
- 🪴 Ceramic Planter Collection (42 pts) - Like New
- 🛋️ Vintage Throw Pillow (32 pts) - Excellent

### Daily Utility
- 👜 Retro Canvas Tote Bag (25 pts) - Like New
- 🥄 Bamboo Kitchen Utensil Set (40 pts) - New
- 🌊 Stainless Steel Water Bottle (28 pts) - Excellent
- 😎 Eco-Friendly Sunglasses (36 pts) - Like New

---

## 🎨 UI Elements

### Button States
| State | Appearance | Action |
|-------|-----------|--------|
| **Enabled** | Green button | Clickable |
| **Disabled** | Gray button | Shows tooltip |
| **Hover** | Darker green | Smooth animation |

### Modals
- **✅ Confirmation** - Item details + "Pick up from hub"
- **❌ Error** - Insufficient points + points needed

### Filters
- **All Items** - 12 items
- **👕 Clothing** - 4 items
- **🏠 Home Decor** - 4 items
- **🛠️ Daily Utility** - 4 items

---

## 💾 Data Storage

### localStorage Keys
```
ecopoints_balance           // Your current points
ecopoints_transactions      // All point transactions
ecopoints_processed         // Duplicate prevention
thriftloop_redemptions      // Redemption history
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Item filtering | ✅ |
| Real-time balance | ✅ |
| Point validation | ✅ |
| Insufficient points tooltip | ✅ |
| Confirmation modal | ✅ |
| Error handling | ✅ |
| Redemption history | ✅ |
| Cross-tab sync | ✅ |
| Mobile responsive | ✅ |
| Toast notifications | ✅ |

---

## 🔄 Workflows

### Flow 1: Successful Redemption
```
Balance Check ✓
  ↓
Show Confirmation Modal
  ↓
User Confirms
  ↓
Deduct Points
  ↓
Update Balance
  ↓
Show Success Toast
  ↓
Add to History
```

### Flow 2: Insufficient Balance
```
Balance Check ✗
  ↓
Button Disabled
  ↓
Show Tooltip
  ↓
Click Attempts
  ↓
Error Modal
  ↓
User Exits
```

---

## 🔧 Debug Commands

```javascript
// Check balance
ecoPoints.getBalance()

// View transactions
ecoPoints.getTransactions()

// View redemptions
JSON.parse(localStorage.getItem('thriftloop_redemptions'))

// Manual redemption
ecoPoints.deductPoints(30, 'test_redeem')

// Clear all data
localStorage.clear()
```

---

## 📱 Responsive Design

| Device | Layout |
|--------|--------|
| **Desktop (1400px+)** | 4-column grid |
| **Tablet (768-1399px)** | 3-column grid |
| **Mobile (<768px)** | 1-2 column grid |

---

## 🎯 Redemption Rules

✅ **Can redeem if:**
- Have sufficient points
- Item in stock (always available)
- Account in good standing

❌ **Cannot redeem if:**
- Balance < item cost
- Negative balance would result
- Item unavailable

---

## 📊 Status Indicators

### Balance Display
- **Low (<30 pts):** ⚠️ Limited options
- **Medium (30-60 pts):** 🎯 Most items available
- **High (>60 pts):** 🚀 All items available

### Redemption Success
- ✅ Green confirmation
- 🎉 Toast notification
- 📋 Added to history

### Redemption Failure
- ❌ Red error modal
- 💡 Helpful message
- 🔄 No points deducted

---

## 🌐 Integration

### Linked Modules
- **app.html** - Navigation access
- **EcoPoints System** - Balance management
- **Toast Manager** - Notifications

### Navigation
- Back button → Returns to `app.html`
- ThriftLoop link in sidebar → Loads `thriftloop.html`

---

## 🎓 Common Tasks

### Check if user can afford item
```javascript
const balance = ecoPoints.getBalance();
const canAfford = balance >= itemCost;
```

### Get redemption history
```javascript
const history = JSON.parse(
  localStorage.getItem('thriftloop_redemptions') || '[]'
);
```

### Calculate total redeemed
```javascript
const total = history.reduce((sum, r) => sum + r.cost, 0);
```

### Most redeemed item
```javascript
const counts = {};
history.forEach(r => counts[r.name] = (counts[r.name] || 0) + 1);
const most = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0];
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Balance not showing | Refresh page or check localStorage |
| Redeem button disabled | Earn more points in ReturnBox/MaterialBank |
| Modal won't close | Refresh page or close browser tab |
| History empty | No redemptions yet, or localStorage cleared |
| Items not visible | Ensure JavaScript enabled, check console |

---

## 📞 Help

**Need more points?**
- Complete item returns in ReturnBox
- List materials in MaterialBank

**Item pickup?**
- Check confirmation modal message
- Visit nearest community hub

**Technical issues?**
- Check browser console for errors
- Clear browser cache
- Try different browser

---

## 🎉 Sample Points Guide

**Earn Points:**
- ReturnBox: 10-30 points per return
- MaterialBank: 40-50 points per action

**Sample Earning Plan:**
- 3 small returns = 30 points → Tote Bag (25 pts) + extras
- 2 medium returns = 40 points → Utensils (40 pts)
- 1 community drive = 30 points + materials = Wallet Sweater (45 pts)

---

## ⭐ Premium Features

🎁 **Exclusive Rewards**
- Pre-loved curated items
- Pickup from community hubs
- Zero cost (points only)

💚 **Eco-Friendly**
- Promote circular economy
- Support local communities
- Reduce waste

🏆 **Recognition**
- Redemption history
- Public impact tracking
- Community leaderboards (coming soon)

---

**Last Updated:** January 31, 2026  
**Status:** ✅ Live

---

*Transform your sustainable actions into tangible rewards.*
