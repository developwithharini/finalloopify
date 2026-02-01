# EcoPoints System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LOOPIFY PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐           │
│  │    Level 3       │         │    Level 4       │           │
│  │   ReturnBox      │         │  MaterialBank    │           │
│  │                  │         │                  │           │
│  │  Individual &    │         │  Industrial &    │           │
│  │  Community       │         │  B2B Material    │           │
│  └────────┬─────────┘         └────────┬─────────┘           │
│           │                            │                      │
│           └────────────────┬───────────┘                      │
│                            │                                 │
│              ┌─────────────┴──────────────┐                 │
│              │                            │                 │
│        ┌─────▼──────────┐        ┌──────▼───────┐          │
│        │  EcoPoints     │        │ Toast Manager│          │
│        │  System        │        │              │          │
│        │  (Utility)     │        │ (Notifications)         │
│        └────────────────┘        └──────────────┘          │
│              │                         │                   │
│              └────────────┬────────────┘                   │
│                           │                               │
│              ┌────────────▼────────────┐                  │
│              │  Browser localStorage   │                  │
│              │  (Data Persistence)     │                  │
│              └────────────────────────┘                  │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. EcoPoints System Module

**File:** `ecopoints-system.js`  
**Type:** Utility Class  
**Size:** ~180 lines  
**Dependencies:** None

```
EcoPointsSystem
├── Storage Management
│   ├── Initialize localStorage keys
│   ├── Read/Write balance
│   ├── Read/Write transactions
│   └── Track processed IDs (duplicate prevention)
│
├── Points Management
│   ├── addPoints(ruleKey, metadata)
│   ├── getBalance()
│   ├── getTransactions()
│   ├── getTransactionsByLevel(level)
│   └── getStats()
│
├── Validation
│   ├── Rule key validation
│   ├── Duplicate detection
│   └── Metadata verification
│
└── Configuration
    └── POINT_RULES (10, 20, 30, 40, 50 points)
```

**Global Instance:** `window.ecoPoints`

### 2. Toast Manager Module

**File:** `toast-notifications.js`  
**Type:** UI Component  
**Size:** ~150 lines  
**Dependencies:** Tailwind CSS (already loaded)

```
ToastManager
├── Container Management
│   ├── Create/inject DOM container
│   ├── Z-index management (9999)
│   └── Layout (fixed, top-right)
│
├── Toast Creation
│   ├── Element generation
│   ├── Styling (4 types: success/error/info/warning)
│   └── Animation (slide-in/out)
│
├── Display Management
│   ├── show(options)
│   ├── Auto-dismiss (configurable)
│   ├── Manual close button
│   └── Multiple toast stacking
│
└── Convenience Methods
    ├── success(message, duration)
    ├── error(message, duration)
    ├── info(message, duration)
    └── warning(message, duration)
```

**Global Instance:** `window.toastManager`

### 3. Level 3 Integration

**Files:** `level 3.html`, `level 3.js`

```
Level 3 Page Load
│
├── Script Loading
│   ├── ecopoints-system.js
│   ├── toast-notifications.js
│   └── level 3.js
│
├── DOM Initialization
│   ├── EcoPoints badge element
│   ├── Form inputs
│   └── Display areas
│
└── Event Listeners
    └── returnItemBtn click
        ├── Validate input
        ├── Log transaction
        ├── Determine points rule (10/20/30 based on quantity)
        ├── Call ecoPoints.addPoints()
        ├── Show toast notification
        └── Update display (balance & metrics)
```

**Point Awards Logic:**
```javascript
if (quantity === 1) {
  rule = 'LEVEL3_SMALL_RETURN'      // +10 points
} else if (quantity <= 5) {
  rule = 'LEVEL3_MEDIUM_RETURN'     // +20 points
} else {
  rule = 'LEVEL3_COMMUNITY_DRIVE'   // +30 points
}
```

### 4. Level 4 Integration

**Files:** `level 4.html`, `level 4.js`

```
Level 4 Page Load
│
├── Script Loading
│   ├── ecopoints-system.js
│   ├── toast-notifications.js
│   └── level 4.js
│
├── Producer Module (List Material)
│   ├── listingForm submit
│   ├── Create listing object
│   ├── Award +40 points (LEVEL4_MATERIAL_MATCH)
│   ├── Show toast
│   └── Update balance
│
└── Reuser Module (Request Material)
    ├── requestForm submit
    ├── Find matching materials
    ├── For each match:
    │   ├── Create transaction ID
    │   ├── Award +50 points (LEVEL4_TRANSACTION)
    │   └── Show toast
    ├── Update balance
    └── Display matches
```

---

## Data Flow Diagram

### Scenario: User Returns 1 Item in Level 3

```
User Input
│
└─► itemIdInput = "BOTTLE001"
    quantityInput = 1
    Click "Return Item"
    │
    └─► returnItemBtn.addEventListener('click', () => {
        │
        ├─► Validate inputs ✓
        │
        ├─► Create transactionId = "L3_BOTTLE001_1701234567890"
        │
        ├─► Determine rule: quantity === 1
        │   → rule = "LEVEL3_SMALL_RETURN"
        │
        ├─► ecoPoints.addPoints('LEVEL3_SMALL_RETURN', {
        │   transactionId,
        │   itemId: "BOTTLE001",
        │   quantity: 1
        │ })
        │   │
        │   └─► Inside addPoints():
        │       ├─► Lookup rule: 10 points
        │       ├─► Check if transactionId already processed: NO
        │       ├─► Update balance: 0 → 10
        │       ├─► Create transaction record
        │       ├─► Save to localStorage
        │       ├─► Mark transactionId as processed
        │       └─► Return { success: true, points: 10, message: "..." }
        │
        ├─► result.success === true
        │
        ├─► toastManager.success(result.message)
        │   → "+10 EcoPoints earned for small item return/donation 🌱"
        │   → Green toast appears (auto-dismiss 4s)
        │
        ├─► updateMetrics()
        │   ├─► Update total events display
        │   ├─► Update item counts
        │   └─► Update balance badge: 0 → 10
        │
        └─► updateLog()
            └─► Show transaction in log
```

---

## localStorage Schema

### Key 1: `ecopoints_balance`
```javascript
Type: String (JSON stringified number)
Value: "150"
Updates: Every addPoints() call
Example: localStorage.getItem('ecopoints_balance') // "150"
```

### Key 2: `ecopoints_transactions`
```javascript
Type: String (JSON stringified array)
Value: [
  {
    id: "L3_BOTTLE001_1701234567890",
    timestamp: "2025-01-31T10:30:00.000Z",
    ruleKey: "LEVEL3_SMALL_RETURN",
    pointsEarned: 10,
    label: "Small item return/donation",
    metadata: {
      itemId: "BOTTLE001",
      quantity: 1,
      category: ""
    }
  },
  // ... more transactions
]
Updates: Every addPoints() call
Example: localStorage.getItem('ecopoints_transactions') // "[{...}]"
```

### Key 3: `ecopoints_processed`
```javascript
Type: String (JSON stringified object)
Value: {
  "L3_BOTTLE001_1701234567890": true,
  "L4_MAT123_1701234567891": true,
  // ... more processed IDs
}
Updates: Every addPoints() call
Purpose: Duplicate prevention
Example: JSON.parse(localStorage.getItem('ecopoints_processed')) // {id: true, ...}
```

---

## Duplicate Prevention Mechanism

```
User submits transaction with ID: "L3_BOTTLE001_1234567890"
│
└─► ecoPoints.addPoints('LEVEL3_SMALL_RETURN', {
    transactionId: "L3_BOTTLE001_1234567890",
    itemId: "BOTTLE001",
    quantity: 1
  })
  │
  └─► Check processed transactions:
      if (processed["L3_BOTTLE001_1234567890"]) → EXISTS
      └─► Return { success: false, points: 0 }
      else → NOT FOUND
      └─► Award points AND save to processed
          processed["L3_BOTTLE001_1234567890"] = true
          localStorage.setItem('ecopoints_processed', JSON.stringify(processed))
```

---

## Point Rules Configuration

```javascript
POINT_RULES = {
  // Level 3
  LEVEL3_SMALL_RETURN: {
    points: 10,
    label: "Small item return/donation"
  },
  LEVEL3_MEDIUM_RETURN: {
    points: 20,
    label: "Medium bulk return"
  },
  LEVEL3_COMMUNITY_DRIVE: {
    points: 30,
    label: "Community drive participation"
  },
  
  // Level 4
  LEVEL4_MATERIAL_MATCH: {
    points: 40,
    label: "Industrial material listing matched"
  },
  LEVEL4_TRANSACTION: {
    points: 50,
    label: "Successful material reuse transaction"
  }
}
```

**To add new rules:**
1. Add entry to `POINT_RULES` object
2. Reference with `ecoPoints.addPoints('NEW_RULE_KEY', {...})`
3. Implement trigger in appropriate level JavaScript

---

## Transaction Lifecycle

```
1. USER ACTION (e.g., return item)
   │
   ├─ Generate unique transactionId: L3_ITEM_TIMESTAMP
   │
   ├─ Call ecoPoints.addPoints(ruleKey, metadata)
   │
   └─► 2. VALIDATION
       ├─ Rule exists? YES
       ├─ TransactionId processed before? NO
       │
       └─► 3. POINT AWARD
           ├─ Read current balance
           ├─ Add rule.points
           ├─ Write new balance
           │
           └─► 4. TRANSACTION LOGGING
               ├─ Create transaction record
               ├─ Append to transactions array
               ├─ Save to localStorage
               │
               └─► 5. DUPLICATE PREVENTION
                   ├─ Add transactionId to processed set
                   ├─ Save processed set
                   │
                   └─► 6. RETURN RESULT
                       ├─ { success: true, points: X, ... }
                       │
                       └─► 7. UI FEEDBACK
                           ├─ Show toast: "+X points earned!"
                           ├─ Update balance display
                           └─ Update transaction log
```

---

## Error Handling Flow

```
Try to award points
│
├─► Invalid rule key?
│   └─ Return { success: false, message: "Invalid rule key" }
│
├─► Duplicate transactionId?
│   └─ Return { success: false, message: "Transaction already rewarded" }
│
├─► Missing required metadata?
│   └─ Return { success: false, message: "Missing metadata" }
│
└─► localStorage unavailable?
    └─ Graceful degradation (try/catch wrapper)
```

---

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| addPoints() | O(1) | Constant time |
| getBalance() | O(1) | Direct read |
| getTransactions() | O(n) | Parse JSON array |
| getTransactionsByLevel() | O(n) | Filter array |
| getStats() | O(n) | Iterate once |

### Space Complexity

| Data | Size (approx) | Notes |
|------|---------------|-------|
| Balance | 3-4 bytes | Small number |
| Per Transaction | 200-300 bytes | Full metadata |
| Per Processed ID | 50-100 bytes | String key+value |
| **Total (100 txns)** | **~25-30 KB** | Well within limits |

### Browser Limits
- localStorage quota: **5-10 MB** per domain
- EcoPoints usage at 100 transactions: ~30 KB (0.3% of limit)
- Safe to store thousands of transactions

---

## Security Considerations

### ✅ Secure Design
1. **Client-side only**: No network transmission
2. **No authentication required**: Single user per browser
3. **No external APIs**: No external dependencies
4. **Input validation**: All metadata validated
5. **XSS prevention**: HTML properly escaped in toasts

### ⚠️ Limitations (by design)
1. **No server-side validation**: Could be manually edited in DevTools
   - Trade-off: Offline-first, instant feedback, no backend needed
2. **No user authentication**: Assumes single user per browser
   - Trade-off: Simplicity, no account management
3. **No data encryption**: localStorage readable in DevTools
   - Trade-off: Performance, no need for secrets in EcoPoints

### 🛡️ Recommendations for Production
- If multi-user: Add user ID to transaction metadata
- If server sync needed: Add backend validation layer
- If fraud prevention: Implement server-side point verification

---

## Extensibility Points

### Adding New Point Rules
```javascript
// In ecopoints-system.js POINT_RULES:
LEVEL5_ACTION: { points: 75, label: "Level 5 action description" }

// In your level 5 code:
ecoPoints.addPoints('LEVEL5_ACTION', {
  transactionId: `L5_${id}_${Date.now()}`,
  itemId: item,
  quantity: qty
});
```

### Customizing Toast Appearance
```javascript
// In toast-notifications.js _createToastElement():
// Modify colors array for different themes
```

### Adding Achievement Badges
```javascript
// Create ecopoints-achievements.js:
class AchievementSystem {
  constructor() {
    this.achievements = {
      bronze: { points: 50, badge: '🥉' },
      silver: { points: 150, badge: '🥈' },
      gold: { points: 300, badge: '🥇' }
    };
  }
  
  getAchievement(points) {
    // Return badge based on points
  }
}
```

### Connecting to Backend
```javascript
// Create sync-ecopoints.js:
async function syncToServer() {
  const data = ecoPoints.getStats();
  await fetch('/api/ecopoints/sync', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

---

## Testing Strategy

### Unit Tests
```javascript
// Test addPoints() logic
// Test getBalance() retrieval
// Test duplicate prevention
// Test rule validation
```

### Integration Tests
```javascript
// Test Level 3 return flow
// Test Level 4 listing flow
// Test Level 4 transaction flow
// Test toast appearance
```

### E2E Tests
```javascript
// Complete user journey through both levels
// Verify localStorage persistence
// Check point accumulation
// Validate transaction logging
```

---

## Deployment Checklist

- ✅ All files created and tested
- ✅ Scripts integrated into both levels
- ✅ No console errors
- ✅ localStorage working correctly
- ✅ Toasts displaying properly
- ✅ Balance badge updating
- ✅ Duplicate prevention working
- ✅ Documentation complete
- ✅ Testing guide provided
- ✅ Ready for production

---

## Future Enhancement Roadmap

### Phase 1 (Current)
- ✅ Point awards per action
- ✅ Balance tracking
- ✅ Toast notifications
- ✅ Transaction logging

### Phase 2
- [ ] User accounts (multi-user support)
- [ ] Achievement badges
- [ ] Leaderboards
- [ ] Export transaction report

### Phase 3
- [ ] Server sync (optional)
- [ ] Point redemption marketplace
- [ ] Seasonal campaigns with multipliers
- [ ] Carbon impact metrics per point

### Phase 4
- [ ] Gamification elements
- [ ] Social sharing
- [ ] Integration with external rewards
- [ ] API for third-party platforms

---

**Architecture Version:** 1.0  
**Last Updated:** January 31, 2025  
**Status:** ✅ Production Ready
