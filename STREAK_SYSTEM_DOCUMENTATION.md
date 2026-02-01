# Weekly Sustainability Streak System

## Overview

The Weekly Sustainability Streak System rewards users for consistency in their sustainable actions. Users earn bonus EcoPoints for completing activities in consecutive weeks, with special milestone rewards at 10-week intervals.

---

## Core Features

### 1. **Streak Tracking**
- **What counts**: Any donation, return, or redemption within a calendar week
- **Definition of week**: ISO standard (Monday-Sunday, week 1-53 per year)
- **Consecutive requirement**: Users must complete at least ONE action per week to maintain streak
- **Automatic reset**: Streak resets to 0 if a full week is missed

### 2. **Point Rewards**
- **Weekly bonus**: +5 EcoPoints per completed week
- **Milestone bonus**: +100 EcoPoints when reaching 10-week streak
- **Milestone reset**: Bonus can be earned again after a streak reset

### 3. **Streak Display**
- Fixed widget shown on all pages (top-right corner)
- Shows current streak count, milestone progress, and countdown
- Real-time updates across browser tabs/windows
- Milestone achievement popup notification

---

## Technical Architecture

### Files

| File | Purpose |
|------|---------|
| `streak-system.js` | Core streak logic and calculations |
| `streak-widget.js` | UI widget for displaying streak info |
| `fulfillment-modal.js` | Integration point for action tracking |

### Data Storage (localStorage)

```javascript
{
  'streak_lastActionDate': '2024-02-01T10:30:00.000Z',      // ISO timestamp
  'streak_currentCount': 4,                                  // Current streak weeks
  'streak_lastWeekNumber': '2024-W05',                       // Week identifier
  'streak_milestoneReached': 0,                              // Highest milestone (0 or 10)
  'streak_actionDates': '[...]'                              // Array of dates (reserved)
}
```

---

## API Reference

### `streakSystem.updateWeeklyStreak()`

Main function called when user completes an action (donation/return/redemption).

**Returns:**
```javascript
{
  streakIncremented: boolean,        // True if streak count increased
  pointsAwarded: number,             // Total points to add (streak + milestone)
  streakCount: number,               // Current streak after update
  milestoneReached: boolean,         // True if 10-week milestone just hit
  message: string                    // User-facing message
}
```

**Example:**
```javascript
const result = streakSystem.updateWeeklyStreak();
if (result.pointsAwarded > 0) {
  ecoPoints.addPoints(result.pointsAwarded, `streak_bonus_${Date.now()}`);
}
console.log(result.message);
// Output: "🔥 Streak extended! You're on a 5-week sustainability streak! +5 EcoPoints"
```

### `streakSystem.getStreakStatus()`

Get current streak status without modifying.

**Returns:**
```javascript
{
  count: number,              // Current streak weeks
  lastActionDate: Date,       // When last action occurred
  currentWeekKey: string,     // Current week in format "2024-W05"
  milestoneReached: number    // Highest milestone (0 or 10)
}
```

### `streakSystem.checkStreakMilestone()`

Check if milestone is achievable.

**Returns:**
```javascript
{
  canReachMilestone: boolean,  // Can still reach next milestone
  weeksRemaining: number,      // Weeks until milestone
  currentStreak: number,       // Current streak
  alreadyReached: boolean      // Has reached milestone this cycle
}
```

### `streakSystem.getStreakDisplay()`

Get formatted, user-friendly streak message.

**Returns:** `string` - e.g., "🔥 5-week streak! 5 weeks to reach milestone."

### `streakSystem.getStreakAnalytics()`

Get detailed analytics for dashboard.

**Returns:**
```javascript
{
  currentStreak: number,
  lastActionDate: Date,
  currentWeek: string,
  totalPointsFromStreaks: number,
  milestone: {
    nextMilestone: 10,
    weeksRemaining: number,
    alreadyReached: boolean
  }
}
```

---

## Integration Points

### In `fulfillment-modal.js`

When user confirms a donation/return pickup or drop-off:

```javascript
confirmPickup() {
  // ... existing fulfillment logic ...
  
  // Update weekly streak
  const streakUpdate = streakSystem.updateWeeklyStreak();
  if (streakUpdate.pointsAwarded > 0) {
    ecoPoints.addPoints(streakUpdate.pointsAwarded, `streak_bonus_${Date.now()}`);
  }
  
  // Show streak message in confirmation
  if (streakUpdate.streakIncremented) {
    confirmMessage += `\n\n${streakUpdate.message}`;
  }
  
  // ... rest of logic ...
}
```

---

## Streak Rules & Examples

### Rule 1: Same Week (No Increment)
```
Week 1 (Jan 1-7):
- Monday: User donates item → Streak = 1
- Wednesday: User donates item → Streak = 1 (same week)
```

### Rule 2: Next Week (Increment)
```
Week 1 (Jan 1-7): User completes action → Streak = 1
Week 2 (Jan 8-14): User completes action → Streak = 2 ✓
```

### Rule 3: Missed Week (Reset)
```
Week 1 (Jan 1-7): User completes action → Streak = 1
Week 2 (Jan 8-14): User completes action → Streak = 2
Week 3 (Jan 15-21): NO action
Week 4 (Jan 22-28): User completes action → Streak = 1 (reset!) 🌱
```

### Rule 4: Milestone Achievement
```
Week 10 completion:
- Points awarded: +5 (streak) + +100 (milestone) = +105 total
- Milestone set to 10 (prevents double-earning)
- Message: "🎉 MILESTONE! You've completed 10 consecutive weeks!..."

Week 11 onwards:
- Regular +5 per week
- Milestone bonus available again after streak resets
```

---

## UI Components

### Streak Widget

Fixed widget displayed on all pages (top-right):
- Shows current streak count with 🔥 emoji
- Displays milestone progress bar
- Shows weeks remaining to next milestone
- Updates in real-time
- Mobile-responsive

**Position:** `top: 120px; right: 20px;`

### Milestone Popup

Modal notification shown when 10-week milestone achieved:
- Large celebration emoji 🎉
- Milestone message
- +100 points bonus display
- "Keep Going" button
- Auto-closes after 5 seconds

---

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| First ever action | Streak = 1, +5 points |
| Multiple actions in same week | Streak unchanged, no duplicate points |
| Exactly 7 days since last action | Different week, streak increments |
| More than 7 days since last action | Streak resets to 1 |
| 10-week milestone reached twice | Only awarded once per cycle |
| Month/year boundary crossing | ISO week system handles correctly |
| Timezone differences | Uses local date for week calculation |
| LocalStorage cleared | Streak lost, but point history preserved in EcoPoints |

---

## Testing

### Console Testing Commands

```javascript
// Check current status
streakSystem.getStreakStatus()

// Get full analytics
streakSystem.getStreakAnalytics()

// Simulate action (updates streak)
streakSystem.updateWeeklyStreak()

// Check milestone eligibility
streakSystem.checkStreakMilestone()

// Get display string
streakSystem.getStreakDisplay()

// Reset streak (admin/testing)
streakSystem.resetStreak()

// Update widget display
streakWidget.updateWidget()

// Show milestone popup
streakWidget.showMilestonePopup()
```

### Manual Testing Workflow

1. **Week 1 Test:**
   - Complete first action
   - Verify: Streak = 1, +5 points awarded
   - Check widget: Shows "🔥 1 Week Streak"

2. **Same Week Test:**
   - Complete second action in same week
   - Verify: Streak = 1, no additional points
   - Check widget: Still shows "🔥 1 Week Streak"

3. **Next Week Test:**
   - Set system date to next week (or wait)
   - Complete action
   - Verify: Streak = 2, +5 points awarded
   - Check widget: Shows "🔥 2 Week Streak"

4. **Milestone Test:**
   - Simulate 10 consecutive weeks (via console)
   - Complete 10th week action
   - Verify: Streak = 10, +105 points total (5+100)
   - Check popup: Milestone notification appears

5. **Reset Test:**
   - Create active streak
   - Skip a week (don't complete action)
   - Complete action in following week
   - Verify: Streak = 1 (reset), message shows "Streak reset"

---

## User Experience Flow

```
User completes action (donation/return/redemption)
        ↓
Fulfillment modal shows
        ↓
User confirms pickup/drop-off
        ↓
streakSystem.updateWeeklyStreak() called
        ↓
Calculates week progression:
  - Same week? → No increment, no new points
  - Next week? → Increment +1, award +5 pts (+100 if milestone)
  - Missed week? → Reset to 1, award +5 pts
        ↓
Points added to EcoPoints balance
        ↓
Confirmation modal shows:
  "Your item will be collected..."
  + 🔥 "Streak extended! You're on a 5-week sustainability streak!"
        ↓
Streak widget updates in top-right
        ↓
(If milestone reached) Popup notification shows
```

---

## Integration Checklist

- [x] `streak-system.js` created with core logic
- [x] `streak-widget.js` created with UI components
- [x] `fulfillment-modal.js` updated to track streaks
- [x] Scripts added to `app.html`
- [x] Scripts added to `thriftloop.html`
- [x] Scripts added to `thriftloop-admin.html`
- [x] localStorage keys documented
- [x] Edge cases handled
- [x] Testing commands provided
- [x] User messaging implemented

---

## Notes

- **Week Definition**: ISO 8601 standard (Mon-Sun)
- **Timezone**: Uses local browser time
- **Persistence**: Data survives browser restarts via localStorage
- **Cross-Tab Sync**: Widget updates via storage events
- **Performance**: All calculations client-side, O(1) complexity
- **No Backend**: Entirely client-side implementation

---

## Future Enhancements

- [ ] Social sharing of streak achievements
- [ ] Team/community streaks
- [ ] Streak badges/achievements
- [ ] Streak reminders (notifications)
- [ ] Leaderboard integration
- [ ] Monthly/yearly streak cycles
- [ ] Custom milestone intervals
- [ ] Streak insurance (skip 1 week without reset)

