#!/usr/bin/env node

/**
 * Streak System Testing Dashboard
 * Browser console testing tool
 * 
 * Usage:
 * 1. Paste this entire file into browser console
 * 2. Run test functions or check status
 */

class StreakTester {
  /**
   * Print formatted log
   */
  static log(title, data) {
    console.log(`%c${title}`, 'color: #6b9e83; font-size: 14px; font-weight: bold;', data);
  }

  /**
   * Get current status
   */
  static status() {
    const status = streakSystem.getStreakStatus();
    const milestone = streakSystem.checkStreakMilestone();
    const analytics = streakSystem.getStreakAnalytics();

    this.log('📊 STREAK STATUS', {});
    console.table({
      'Current Streak': status.count + ' weeks',
      'Last Action': status.lastActionDate ? status.lastActionDate.toLocaleDateString() : 'Never',
      'Current Week': status.currentWeekKey,
      'Milestone Reached': status.milestoneReached > 0 ? `Yes (${status.milestoneReached}-week)` : 'No',
    });

    this.log('🎯 MILESTONE PROGRESS', {});
    console.table({
      'Can Reach Milestone': milestone.canReachMilestone ? 'Yes' : 'No',
      'Weeks Remaining': milestone.weeksRemaining + ' weeks',
      'Already Reached': milestone.alreadyReached ? 'Yes' : 'No',
    });

    this.log('💎 ANALYTICS', {});
    console.table({
      'Total Streak Points': analytics.totalPointsFromStreaks + ' points',
      'Last Action Date': analytics.lastActionDate?.toLocaleDateString() || 'Never',
      'Current Week': analytics.currentWeek,
    });

    console.log('%cStreak Display: ' + streakSystem.getStreakDisplay(), 'color: #6b9e83; font-size: 13px;');
  }

  /**
   * Simulate an action
   */
  static simulateAction() {
    console.log('%cSimulating action...', 'color: #6b9e83; font-weight: bold;');
    const result = streakSystem.updateWeeklyStreak();

    this.log('✅ ACTION RESULT', {});
    console.table({
      'Streak Incremented': result.streakIncremented ? 'Yes' : 'No',
      'Points Awarded': result.pointsAwarded + ' pts',
      'Streak Count': result.streakCount + ' weeks',
      'Milestone Reached': result.milestoneReached ? 'Yes! 🎉' : 'No',
      'Message': result.message,
    });

    if (result.pointsAwarded > 0) {
      if (typeof ecoPoints !== 'undefined') {
        ecoPoints.addPoints(result.pointsAwarded, `streak_test_${Date.now()}`);
        console.log(`%c✓ Added ${result.pointsAwarded} EcoPoints`, 'color: #6b9e83;');
      }
    }

    return result;
  }

  /**
   * Check storage
   */
  static checkStorage() {
    this.log('💾 STORAGE DATA', {});
    const keys = [
      'streak_lastActionDate',
      'streak_currentCount',
      'streak_lastWeekNumber',
      'streak_milestoneReached',
    ];

    const data = {};
    keys.forEach(key => {
      data[key] = localStorage.getItem(key) || '(not set)';
    });
    console.table(data);
  }

  /**
   * Reset streak
   */
  static reset() {
    if (confirm('Are you sure you want to reset the streak system? This cannot be undone.')) {
      streakSystem.resetStreak();
      console.log('%c✓ Streak system reset', 'color: #6b9e83; font-weight: bold;');
      this.status();
    }
  }

  /**
   * Test week logic
   */
  static testWeekLogic() {
    this.log('🗓️ WEEK LOGIC TEST', {});

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    console.table({
      'Today\'s Week': streakSystem.getWeekKey(today),
      'Yesterday\'s Week': streakSystem.getWeekKey(yesterday),
      'Last Week\'s Week': streakSystem.getWeekKey(lastWeek),
      'Same Week (today vs yesterday)': streakSystem.isSameWeek(today, yesterday) ? 'Yes' : 'No',
      'Next Week (yesterday to today)': streakSystem.isNextWeek(yesterday, today) ? 'Yes' : 'No',
      'Next Week (last week to today)': streakSystem.isNextWeek(lastWeek, today) ? 'Yes' : 'No',
    });
  }

  /**
   * Get all help commands
   */
  static help() {
    console.log(`%c📚 STREAK SYSTEM TESTING GUIDE`, 'color: #6b9e83; font-size: 16px; font-weight: bold;');
    console.log(`
Available Commands:

Core Functions:
  StreakTester.status()           - Show current streak status
  StreakTester.simulateAction()   - Simulate a donation/return action
  StreakTester.testWeekLogic()    - Test week calculation logic
  StreakTester.checkStorage()     - View localStorage data
  StreakTester.reset()            - Reset streak system (confirmation required)

Direct API (if needed):
  streakSystem.getStreakStatus()        - Get current status object
  streakSystem.getStreakAnalytics()     - Get detailed analytics
  streakSystem.checkStreakMilestone()   - Check milestone eligibility
  streakSystem.getStreakDisplay()       - Get formatted display string
  streakSystem.updateWeeklyStreak()     - Update streak (simulates action)

Widget Functions:
  streakWidget.updateWidget()     - Refresh streak widget
  streakWidget.showMilestonePopup() - Show milestone notification

Examples:

1. Check status:
   StreakTester.status()

2. Simulate first action:
   StreakTester.simulateAction()
   // Should show: Streak = 1, +5 points

3. Simulate second action (same week):
   StreakTester.simulateAction()
   // Should show: Streak = 1, 0 points (same week)

4. Check week logic:
   StreakTester.testWeekLogic()

5. View storage:
   StreakTester.checkStorage()
    `);
  }
}

// Print help on load
console.log('%c✅ Streak System Tester Loaded!', 'color: #6b9e83; font-size: 14px; font-weight: bold;');
console.log('%cRun StreakTester.help() for commands', 'color: #999; font-size: 12px;');
