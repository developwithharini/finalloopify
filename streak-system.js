/**
 * Weekly Sustainability Streak System
 * Tracks consecutive weeks of returns/donations and awards bonus EcoPoints
 * 
 * Storage structure:
 * - streak_lastActionDate: ISO string of last recorded action
 * - streak_currentCount: number of consecutive weeks
 * - streak_lastWeekNumber: ISO week number when streak was last incremented
 * - streak_milestoneReached: highest milestone achieved (for preventing re-earn)
 * - streak_actionDates: array of ISO dates when actions occurred
 */

class StreakSystem {
  constructor() {
    this.storageKeyLastAction = 'streak_lastActionDate';
    this.storageKeyCurrentCount = 'streak_currentCount';
    this.storageKeyLastWeek = 'streak_lastWeekNumber';
    this.storageKeyMilestone = 'streak_milestoneReached';
    this.storageKeyActionDates = 'streak_actionDates';
    this.WEEKLY_STREAK_POINTS = 5;
    this.MILESTONE_WEEKS = 10;
    this.MILESTONE_BONUS_POINTS = 100;
  }

  /**
   * Get current ISO week number (1-53)
   * @param {Date} date - Date to get week for
   * @returns {number} ISO week number
   */
  getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Get week key (year-week) for unique week identification
   * @param {Date} date - Date to get week key for
   * @returns {string} Format: "2024-W05"
   */
  getWeekKey(date) {
    const year = date.getFullYear();
    const week = this.getISOWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  /**
   * Check if two dates are in the same week
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean}
   */
  isSameWeek(date1, date2) {
    return this.getWeekKey(date1) === this.getWeekKey(date2);
  }

  /**
   * Check if date2 is exactly the next week after date1
   * @param {Date} date1 - Previous date
   * @param {Date} date2 - Current date
   * @returns {boolean}
   */
  isNextWeek(date1, date2) {
    const week1 = this.getISOWeekNumber(date1);
    const week2 = this.getISOWeekNumber(date2);
    const year1 = date1.getFullYear();
    const year2 = date2.getFullYear();

    // Same year, next week
    if (year1 === year2) {
      return week2 === week1 + 1;
    }

    // Year boundary (week 52/53 to week 1)
    if (year2 === year1 + 1) {
      return week1 >= 51 && week2 === 1;
    }

    return false;
  }

  /**
   * Get current streak status
   * @returns {object} {count, weekKey, lastActionDate, milestonReached}
   */
  getStreakStatus() {
    const lastActionDateStr = localStorage.getItem(this.storageKeyLastAction);
    const currentCount = parseInt(localStorage.getItem(this.storageKeyCurrentCount) || '0');
    const milestoneReached = parseInt(localStorage.getItem(this.storageKeyMilestone) || '0');

    return {
      count: currentCount,
      lastActionDate: lastActionDateStr ? new Date(lastActionDateStr) : null,
      currentWeekKey: this.getWeekKey(new Date()),
      milestoneReached: milestoneReached
    };
  }

  /**
   * Main function: Update streak on action
   * Returns object with:
   * - streakIncremented: boolean (true if streak count increased)
   * - pointsAwarded: number (streak points + any milestone bonus)
   * - streakCount: number (current streak)
   * - milestoneReached: boolean (true if 10-week milestone just hit)
   * - message: string (user-facing message)
   */
  updateWeeklyStreak() {
    const status = this.getStreakStatus();
    const today = new Date();
    const currentWeekKey = this.getWeekKey(today);
    let pointsAwarded = 0;
    let streakIncremented = false;
    let milestoneReached = false;
    let message = '';

    // First action ever
    if (!status.lastActionDate) {
      localStorage.setItem(this.storageKeyLastAction, today.toISOString());
      localStorage.setItem(this.storageKeyCurrentCount, '1');
      localStorage.setItem(this.storageKeyLastWeek, currentWeekKey);
      pointsAwarded = this.WEEKLY_STREAK_POINTS;
      streakIncremented = true;
      message = `🎯 Streak started! You've completed week 1 of your sustainability journey. +${pointsAwarded} EcoPoints`;
      return {
        streakIncremented,
        pointsAwarded,
        streakCount: 1,
        milestoneReached: false,
        message
      };
    }

    // Check if action is in same week as last action
    if (this.isSameWeek(status.lastActionDate, today)) {
      // Same week - no streak increment
      message = `🔥 Keep it up! You're on a ${status.count}-week sustainability streak!`;
      return {
        streakIncremented: false,
        pointsAwarded: 0,
        streakCount: status.count,
        milestoneReached: false,
        message
      };
    }

    // Check if action is in next consecutive week
    if (this.isNextWeek(status.lastActionDate, today)) {
      // Next week - increment streak
      const newStreakCount = status.count + 1;
      localStorage.setItem(this.storageKeyLastAction, today.toISOString());
      localStorage.setItem(this.storageKeyCurrentCount, String(newStreakCount));
      localStorage.setItem(this.storageKeyLastWeek, currentWeekKey);

      pointsAwarded = this.WEEKLY_STREAK_POINTS;
      streakIncremented = true;

      // Check for milestone
      if (newStreakCount === this.MILESTONE_WEEKS && status.milestoneReached < this.MILESTONE_WEEKS) {
        pointsAwarded += this.MILESTONE_BONUS_POINTS;
        milestoneReached = true;
        localStorage.setItem(this.storageKeyMilestone, String(this.MILESTONE_WEEKS));
        message = `🎉 MILESTONE! You've completed ${this.MILESTONE_WEEKS} consecutive weeks! +${this.MILESTONE_BONUS_POINTS} bonus EcoPoints!\n🔥 Streak: ${newStreakCount} weeks`;
      } else {
        message = `🔥 Streak extended! You're on a ${newStreakCount}-week sustainability streak! +${this.WEEKLY_STREAK_POINTS} EcoPoints`;
      }

      return {
        streakIncremented,
        pointsAwarded,
        streakCount: newStreakCount,
        milestoneReached,
        message
      };
    }

    // Missed week(s) - streak resets
    localStorage.setItem(this.storageKeyLastAction, today.toISOString());
    localStorage.setItem(this.storageKeyCurrentCount, '1');
    localStorage.setItem(this.storageKeyLastWeek, currentWeekKey);
    pointsAwarded = this.WEEKLY_STREAK_POINTS;
    streakIncremented = true;

    message = `🌱 Streak reset. You're starting fresh! Complete actions every week to build your next streak. +${pointsAwarded} EcoPoints`;

    return {
      streakIncremented,
      pointsAwarded,
      streakCount: 1,
      milestoneReached: false,
      message
    };
  }

  /**
   * Check if user can reach milestone
   * @returns {object} {canReachMilestone, weeksRemaining, currentStreak}
   */
  checkStreakMilestone() {
    const status = this.getStreakStatus();
    const weeksRemaining = Math.max(0, this.MILESTONE_WEEKS - status.count);
    const alreadyReached = status.milestoneReached >= this.MILESTONE_WEEKS;

    return {
      canReachMilestone: !alreadyReached && status.count < this.MILESTONE_WEEKS,
      weeksRemaining,
      currentStreak: status.count,
      alreadyReached
    };
  }

  /**
   * Get formatted streak display
   * @returns {string} Human-readable streak message
   */
  getStreakDisplay() {
    const status = this.getStreakStatus();
    if (status.count === 0) {
      return '🌱 No active streak yet. Start by completing an action!';
    }

    const remaining = this.MILESTONE_WEEKS - status.count;
    if (status.milestoneReached >= this.MILESTONE_WEEKS) {
      return `🔥 ${status.count}-week streak! Milestone already reached. Keep going to reach week ${this.MILESTONE_WEEKS + 10}!`;
    }

    if (remaining <= 0) {
      return `🎉 ${status.count}-week streak achieved! Milestone unlocked!`;
    }

    return `🔥 ${status.count}-week streak! ${remaining} weeks to reach milestone.`;
  }

  /**
   * Reset streak (admin function or for testing)
   */
  resetStreak() {
    localStorage.removeItem(this.storageKeyLastAction);
    localStorage.removeItem(this.storageKeyCurrentCount);
    localStorage.removeItem(this.storageKeyLastWeek);
    localStorage.removeItem(this.storageKeyMilestone);
    localStorage.removeItem(this.storageKeyActionDates);
    console.log('Streak system reset');
  }

  /**
   * Get streak analytics (for dashboard/stats)
   * @returns {object} Detailed streak information
   */
  getStreakAnalytics() {
    const status = this.getStreakStatus();
    const milestone = this.checkStreakMilestone();

    return {
      currentStreak: status.count,
      lastActionDate: status.lastActionDate,
      currentWeek: status.currentWeekKey,
      totalPointsFromStreaks: status.count * this.WEEKLY_STREAK_POINTS + (status.milestoneReached >= this.MILESTONE_WEEKS ? this.MILESTONE_BONUS_POINTS : 0),
      milestone: {
        nextMilestone: this.MILESTONE_WEEKS,
        weeksRemaining: milestone.weeksRemaining,
        alreadyReached: milestone.alreadyReached
      }
    };
  }
}

// Global instance
const streakSystem = new StreakSystem();
