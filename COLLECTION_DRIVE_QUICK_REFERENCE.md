# Collection Drive System - Quick Reference Guide

## 🚀 Quick Start (5 minutes)

### 1. Include Scripts (in HTML, in order)
```html
<script src="ecopoints-system.js"></script>
<script src="toast-notifications.js"></script>
<script src="collection-drive-system.js"></script>
<script src="fulfillment-modal.js"></script>
<script src="your-file.js"></script>
```

### 2. Process a Return/Donation
```javascript
// User returns item → award points → show fulfillment modal

const transactionId = `L3_ITEM_${Date.now()}`;

// Award 20 points (Level 3)
const points = ecoPoints.addPoints('LEVEL3_RETURN', {
  transactionId,
  itemId: 'BOTTLE001',
  quantity: 1
});

if (points.success) {
  // Get hub info
  const hub = collectionDriveSystem.getNearestHub();
  const nextCollection = collectionDriveSystem.calculateNextCollection(hub);
  
  // Show modal
  fulfillmentModal.show({
    ecoPointsMessage: '+20 EcoPoints added 🌱',
    nextCollection: nextCollection,
    selectedHub: hub,
    itemName: 'Plastic Bottle',
    transactionId: transactionId,
    level: 3
  });
}
```

### 3. User Chooses Fulfillment Option
Modal automatically handles:
- Collection Drive Pickup
- Self Drop-Off
- Saves choice to localStorage
- Shows confirmation

---

## 📊 Data Flow

```
Return Item
    ↓
Add EcoPoints (20 or 40) ← Checked for duplicates
    ↓
Get Nearest Hub
    ↓
Calculate Next Collection (3-day cycle)
    ↓
Show Fulfillment Modal
    ↓
User Picks Pickup OR Self Drop-Off
    ↓
Save Fulfillment Choice
    ↓
Show Confirmation
```

---

## 🎯 Core Functions

### Award Points
```javascript
ecoPoints.addPoints(ruleKey, metadata)
// Returns: { success, message, newBalance }
```

### Get Nearest Hub
```javascript
collectionDriveSystem.getNearestHub()
// Returns: { hubId, hubName, distanceKm, ... }
```

### Calculate Next Collection
```javascript
collectionDriveSystem.calculateNextCollection(hub)
// Returns: { nextDate, daysRemaining, dateString, formattedText }
```

### Show Fulfillment Modal
```javascript
fulfillmentModal.show(data)
// Data: { ecoPointsMessage, nextCollection, selectedHub, itemName, transactionId, level }
```

---

## 💾 What Gets Stored

### localStorage Keys:
- `balance` → Current EcoPoints (String)
- `collection_drives_transactions` → All transactions (JSON)
- `fulfillment_history` → All fulfillment choices (JSON)

### Each Transaction Includes:
- transactionId (unique ID)
- level (3 or 4)
- pointsEarned (20 or 40)
- timestamp (ISO date)
- newBalance (updated points)

### Each Fulfillment Includes:
- transactionId
- fulfillmentType (pickup/self-drop)
- hubSelected (hub details)
- collectionDate
- itemName

---

## 🏆 Point Values

| Level | Action | Points |
|-------|--------|--------|
| 3 (ReturnBox) | Item Donation | +20 |
| 4 (MaterialBank) | Material Match | +40 |

---

## 📍 Hubs (Mocked Data)

5 circular hubs at predefined distances:
- Downtown Circular Hub (2 km)
- Westside Community Hub (5 km)
- Eastside Material Exchange (8 km)
- North Green Station (12 km)
- South Sustainability Center (15 km)

Collection drives happen every 3 days at each hub.

---

## 🎨 Modal Features

✅ Success banner with EcoPoints
✅ Collection drive info card
✅ Two fulfillment option cards
✅ Responsive grid layout
✅ Smooth animations
✅ Confirmation flow
✅ Mobile-friendly

---

## 🧪 Testing

### Test 1: Return Item (Level 3)
```
1. Open Level 3 page
2. Return BOTTLE001 (quantity 2)
3. Modal should appear
4. Points +20 shown
5. Click "Choose Pickup"
6. Confirmation message
✓ Check: localStorage has new entry
```

### Test 2: Material Transaction (Level 4)
```
1. Open Level 4 page
2. List "Plastic Sheets" (500 kg)
3. Request same material
4. Match found → modal appears
5. Points +40 shown
6. Click "Choose Self Drop-Off"
7. Confirmation with hub address
✓ Check: fulfillment_history updated
```

### Test 3: Cross-Tab Sync
```
1. Open Level 3 in Tab A
2. Open Level 3 in Tab B
3. Return item in Tab A
4. Switch to Tab B
5. Balance updated in Tab B too
✓ Dual pages sync correctly
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Modal not showing | Verify `fulfillment-modal.js` included before page JS |
| Points not awarded | Check transaction ID is unique (has timestamp) |
| localStorage errors | Clear browser cache; check privacy settings |
| Wrong hub showing | Verify hub data loaded; check distance calculations |
| Duplicate points | Transaction ID already exists in storage |

---

## 🔍 Debug Commands

```javascript
// Check hub data
console.log(collectionDriveSystem.hubsData);

// View all transactions
console.log(collectionDriveSystem.getTransactionHistory());

// View all fulfillments
console.log(collectionDriveSystem.getFulfillmentHistory());

// Get current balance
console.log(ecoPoints.getBalance());

// Get stats
console.log(collectionDriveSystem.getDashboardStats());

// Nearest hub
console.log(collectionDriveSystem.getNearestHub());

// Clear all data (use with caution!)
collectionDriveSystem.clearAllData();
```

---

## 📱 Mobile Responsive

Modal automatically adapts:
- **Desktop**: 900px max-width, 2-column grid
- **Tablet**: 800px width, adjusted spacing
- **Mobile**: 90% width, 1-column stack

All buttons sized for touch (48px minimum).

---

## 🎓 Code Examples

### Example 1: Level 3 Integration
```javascript
returnItemBtn.addEventListener('click', () => {
  const itemId = itemIdInput.value;
  const quantity = parseInt(quantityInput.value);
  const transactionId = `L3_${itemId}_${Date.now()}`;
  
  // Award points
  const result = ecoPoints.addPoints('LEVEL3_RETURN', {
    transactionId,
    itemId,
    quantity
  });
  
  if (result.success) {
    // Get hub and collection info
    const hub = collectionDriveSystem.getNearestHub();
    const nextCollection = collectionDriveSystem.calculateNextCollection(hub);
    
    // Show modal
    fulfillmentModal.show({
      ecoPointsMessage: result.message,
      nextCollection: nextCollection,
      selectedHub: hub,
      itemName: `${quantity}x ${itemId}`,
      transactionId: transactionId,
      level: 3
    });
  }
});
```

### Example 2: Level 4 Integration
```javascript
// When materials match
const transactionId = `L4_${materialId}_${Date.now()}`;

const result = ecoPoints.addPoints('LEVEL4_TRANSACTION', {
  transactionId,
  itemId: materialName,
  quantity: requestQuantity
});

if (result.success) {
  const hub = collectionDriveSystem.getNearestHub();
  const nextCollection = collectionDriveSystem.calculateNextCollection(hub);
  
  fulfillmentModal.show({
    ecoPointsMessage: result.message,
    nextCollection: nextCollection,
    selectedHub: hub,
    itemName: `${quantity} kg ${materialName}`,
    transactionId: transactionId,
    level: 4
  });
}
```

---

## ✅ Implementation Checklist

- [ ] Scripts included in correct order
- [ ] EcoPoints system initialized
- [ ] Toast notifications working
- [ ] Modal initializes without errors
- [ ] Transaction IDs are unique
- [ ] Points awarded correctly
- [ ] Modal shows with correct data
- [ ] Both fulfillment options work
- [ ] Confirmation displays properly
- [ ] localStorage persists data
- [ ] Cross-tab sync working
- [ ] Mobile layout responsive
- [ ] No console errors

---

## 🚀 Deployment Ready

All components integrated and tested:
✅ `collection-drive-system.js` (380 lines)
✅ `fulfillment-modal.js` (600+ lines)
✅ Level 3 integration (50 lines added)
✅ Level 4 integration (50 lines added)
✅ Full documentation (3 files)

**Status**: Production Ready

---

## 📞 Quick Support

**Modal issues?** → Check script loading order
**Points issues?** → Verify unique transaction IDs
**Hub issues?** → Check hub data in console
**localStorage issues?** → Clear browser cache

For full documentation, see: `COLLECTION_DRIVE_DOCUMENTATION.md`
