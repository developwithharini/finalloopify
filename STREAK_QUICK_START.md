# Weekly Streak System - Quick Start Guide

## What is It?

A gamification system that rewards users for consistent weekly sustainability actions. Users build consecutive week streaks and earn:
- **+5 EcoPoints** per completed week
- **+100 EcoPoints bonus** at the 10-week milestone (and again after reset)

---

## How It Works

### The Basics

1. **Week Definition**: Any calendar week (Monday-Sunday) counts if you complete at least ONE action
2. **Consecutive Weeks**: Complete actions in consecutive weeks to build your streak
3. **Reset**: Miss a full week and your streak resets to 0 (but you can restart!)

### Example Timeline

```
Week 1 (Jan 1-7):    Donate item → Streak = 1 ⭐ (+5 pts)
Week 2 (Jan 8-14):   Return item → Streak = 2 🔥 (+5 pts)
Week 3 (Jan 15-21):  No action → Streak broken ❌
Week 4 (Jan 22-28):  Donate item → Streak = 1 🌱 (+5 pts, restarted)
```

### Milestone Rewards

At **10 consecutive weeks**:
```
Week 1-9:   +5 points each
Week 10:    +5 + 100 BONUS = +105 points! 🎉
Week 11+:   +5 points each (until streak resets)
```

---

## For Users

### How to Earn

1. **Complete Actions**: Donate, return items, or redeem rewards through:
   - ReturnBox (material returns)
   - MaterialBank (donations)
   - ThriftLoop (redemptions)
   - Collection Drives (pickups/drop-offs)

2. **Stay Consistent**: One action per week keeps your streak alive

3. **Build Your Streak**: 
   - Keep going to reach the 10-week milestone
   - Earn +100 bonus at week 10
   - Start a new cycle after reset

### Where to See Your Streak

- **Streak Widget**: Top-right corner of all pages
  - Shows current week count 🔥
  - Progress bar to milestone
  - Countdown to next milestone

- **Confirmation Messages**: After each action
  - "🔥 You're on a 5-week sustainability streak!"
  - "🎉 MILESTONE! +100 bonus points awarded!"

- **Milestone Popup**: When reaching 10 weeks
  - Celebratory notification
  - Shows bonus points awarded

---

## For Developers

### Integration Checklist

- [x] `streak-system.js` - Core logic (handles calculations)
- [x] `streak-widget.js` - UI widget (displays status)
- [x] `fulfillment-modal.js` - Action tracking (calls streak system)
- [x] Script includes added to all pages
- [x] localStorage persistence working
- [x] Cross-tab sync implemented

### Main API Functions

```javascript
// Check current status
streakSystem.getStreakStatus()
// → { count: 5, lastActionDate: Date, currentWeekKey: "2024-W06", ... }

// Update streak (called on action)
streakSystem.updateWeeklyStreak()
// → { streakIncremented: true, pointsAwarded: 5, message: "..." }

// Check milestone progress
streakSystem.checkStreakMilestone()
// → { canReachMilestone: true, weeksRemaining: 5, ... }

// Get formatted display
streakSystem.getStreakDisplay()
// → "🔥 5-week streak! 5 weeks to reach milestone."
```

### Testing

**In browser console:**

```javascript
// Load tester
eval(fetch('/streak-system-tester.js').then(r => r.text()).then(t => t))

// Check status
StreakTester.status()

// Simulate an action
StreakTester.simulateAction()

// Test week logic
StreakTester.testWeekLogic()

// Get help
StreakTester.help()
```

---

## Storage (localStorage)

All data persists in localStorage:

```javascript
streak_lastActionDate      // ISO timestamp of last action
streak_currentCount        // Current streak (1-10+)
streak_lastWeekNumber      // "2024-W06" format
streak_milestoneReached    // 0 or 10 (if achieved)
```

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| First action ever | Streak = 1, +5 pts |
| Multiple actions same week | No additional points |
| Exactly 7 days later | Next week, +5 pts |
| 8+ days since last action | Streak resets to 1, +5 pts |
| Reached 10-week milestone | +100 bonus + 5 streak pts |
| Streak resets after miss | Milestone bonus available again |
| Clear localStorage | Streak lost (points preserved in EcoPoints) |

---

## Known Behavior

✓ **Same-week actions**: Don't award duplicate points  
✓ **ISO week logic**: Correctly handles month/year boundaries  
✓ **Timezone aware**: Uses local browser date  
✓ **Real-time widget**: Updates across browser tabs  
✓ **Milestone once per cycle**: Only earns +100 once until reset  
✓ **Offline capable**: All calculations client-side  

---

## Troubleshooting

### Widget Not Showing?
- Check browser console for errors
- Verify `streak-system.js` and `streak-widget.js` are loaded
- Try: `streakWidget.initialize()`

### Streak Not Incrementing?
- Verify `streakSystem` is defined: `typeof streakSystem`
- Check localStorage: `localStorage.getItem('streak_currentCount')`
- Ensure action was within current week

### Points Not Added?
- Check EcoPoints system: `typeof ecoPoints`
- Verify in console: `ecoPoints.getBalance()`
- Look for JS errors in console

### Reset for Testing?
- In console: `streakSystem.resetStreak()`
- Then refresh page
- Next action starts new streak at 1

---

## Quick Commands

```javascript
// Check everything
StreakTester.status()

// Simulate action and show result
StreakTester.simulateAction()

// View raw storage
StreakTester.checkStorage()

// Test week calculations
StreakTester.testWeekLogic()

// Reset system
StreakTester.reset()

// Help
StreakTester.help()
```

---

## Next Steps

1. **Test the system**: Run `StreakTester.status()` in console
2. **Simulate actions**: Use `StreakTester.simulateAction()` multiple times
3. **Monitor widget**: Watch streak display in top-right corner
4. **Check achievements**: Complete real actions and verify streak tracking
5. **Review analytics**: Use `streakSystem.getStreakAnalytics()`

---

## Files Changed

- ✅ `streak-system.js` - Created (core logic)
- ✅ `streak-widget.js` - Created (UI)
- ✅ `streak-system-tester.js` - Created (testing tool)
- ✅ `fulfillment-modal.js` - Updated (action tracking)
- ✅ `app.html` - Updated (includes scripts)
- ✅ `thriftloop.html` - Updated (includes scripts)
- ✅ `thriftloop-admin.html` - Updated (includes scripts)
- ✅ `STREAK_SYSTEM_DOCUMENTATION.md` - Created (full docs)

---

## Support

For detailed technical documentation, see: `STREAK_SYSTEM_DOCUMENTATION.md`

For testing, use: `streak-system-tester.js` (paste in console)

For quick reference commands, see: **Quick Commands** section above

