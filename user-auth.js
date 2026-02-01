/**
 * User Authentication System
 * Manages user login, tracking, and per-user data
 */

class UserAuth {
  constructor() {
    this.userStorageKey = 'loopify_users';
    this.currentUserKey = 'loopify_current_user';
    this.initializeUsers();
  }

  /**
   * Initialize users database
   */
  initializeUsers() {
    if (!localStorage.getItem(this.userStorageKey)) {
      localStorage.setItem(this.userStorageKey, JSON.stringify({}));
    }
  }

  /**
   * Create new user account
   */
  createUser(username, password) {
    if (!username || !password) {
      return { success: false, message: 'Username and password required' };
    }

    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    
    if (users[username]) {
      return { success: false, message: 'User already exists' };
    }

    users[username] = {
      password: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      ecoPoints: 0,
      streakData: {
        currentCount: 0,
        lastActionDate: null,
        lastWeekNumber: null,
        milestoneReached: false,
        totalPointsEarned: 0
      }
    };

    localStorage.setItem(this.userStorageKey, JSON.stringify(users));
    return { success: true, message: 'User created successfully' };
  }

  /**
   * Login user
   */
  loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    
    if (!users[username]) {
      return { success: false, message: 'User not found' };
    }

    if (users[username].password !== this.hashPassword(password)) {
      return { success: false, message: 'Incorrect password' };
    }

    localStorage.setItem(this.currentUserKey, username);
    return { success: true, message: 'Login successful', user: username };
  }

  /**
   * Logout user
   */
  logoutUser() {
    localStorage.removeItem(this.currentUserKey);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return localStorage.getItem(this.currentUserKey);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!localStorage.getItem(this.currentUserKey);
  }

  /**
   * Get user data
   */
  getUserData(username) {
    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    return users[username] || null;
  }

  /**
   * Update user eco points
   */
  updateUserPoints(username, points) {
    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    if (users[username]) {
      users[username].ecoPoints = (users[username].ecoPoints || 0) + points;
      localStorage.setItem(this.userStorageKey, JSON.stringify(users));
      return true;
    }
    return false;
  }

  /**
   * Get user eco points
   */
  getUserPoints(username) {
    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    return users[username]?.ecoPoints || 0;
  }

  /**
   * Update user streak
   */
  updateUserStreak(username, streakData) {
    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    if (users[username]) {
      users[username].streakData = { ...users[username].streakData, ...streakData };
      localStorage.setItem(this.userStorageKey, JSON.stringify(users));
      return true;
    }
    return false;
  }

  /**
   * Get user streak
   */
  getUserStreak(username) {
    const users = JSON.parse(localStorage.getItem(this.userStorageKey) || '{}');
    return users[username]?.streakData || null;
  }

  /**
   * Simple password hashing (for demo - use proper hashing in production)
   */
  hashPassword(password) {
    // Simple base64 encoding for demo purposes
    // In production, use bcrypt or similar
    return btoa(password);
  }
}

// Global instance
const userAuth = new UserAuth();
