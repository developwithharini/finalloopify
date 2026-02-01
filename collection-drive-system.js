/**
 * Collection Drive System for Loopify
 * Manages circular hubs, collection drives, and fulfillment options
 * Integrates with EcoPoints system
 */

class CollectionDriveSystem {
  constructor() {
    this.hubsData = this.initializeHubs();
    this.storageKey = 'collection_drives_transactions';
    this.hubStorageKey = 'collection_hubs_data';
  }

  /**
   * Initialize mock circular hubs every 10 km
   * In production, this would connect to a real API
   */
  initializeHubs() {
    return [
      {
        hubId: 'hub-001',
        hubName: 'Downtown Circular Hub',
        distanceKm: 2,
        address: '123 Green Street, City Center',
        lastCollectionDate: new Date(2025, 0, 28), // January 28, 2025
        collectionTime: '10:00 AM - 6:00 PM',
        capacity: 500,
      },
      {
        hubId: 'hub-002',
        hubName: 'Westside Community Hub',
        distanceKm: 5,
        address: '456 Eco Avenue, West District',
        lastCollectionDate: new Date(2025, 0, 27),
        collectionTime: '9:00 AM - 5:00 PM',
        capacity: 350,
      },
      {
        hubId: 'hub-003',
        hubName: 'Eastside Material Exchange',
        distanceKm: 8,
        address: '789 Sustainability Drive, East Zone',
        lastCollectionDate: new Date(2025, 0, 26),
        collectionTime: '11:00 AM - 7:00 PM',
        capacity: 600,
      },
      {
        hubId: 'hub-004',
        hubName: 'North Green Station',
        distanceKm: 12,
        address: '321 Circular Way, North Sector',
        lastCollectionDate: new Date(2025, 0, 29),
        collectionTime: '8:00 AM - 4:00 PM',
        capacity: 400,
      },
      {
        hubId: 'hub-005',
        hubName: 'South Sustainability Center',
        distanceKm: 15,
        address: '654 Eco Path, South Region',
        lastCollectionDate: new Date(2025, 0, 25),
        collectionTime: '10:00 AM - 6:00 PM',
        capacity: 450,
      },
    ];
  }

  /**
   * Get nearest hub based on distance
   * @returns {Object} Nearest hub object
   */
  getNearestHub() {
    if (!this.hubsData || this.hubsData.length === 0) {
      console.error('No hubs available');
      return null;
    }
    return this.hubsData.reduce((nearest, hub) => {
      return hub.distanceKm < nearest.distanceKm ? hub : nearest;
    });
  }

  /**
   * Get all hubs sorted by distance
   * @returns {Array} Hubs sorted by distance (nearest first)
   */
  getAllHubsSorted() {
    return [...this.hubsData].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Calculate next collection drive date
   * Collection drives happen every 3 days
   * @param {Object} hub - Hub object
   * @returns {Object} { nextDate, daysRemaining, dateString }
   */
  calculateNextCollection(hub) {
    if (!hub || !hub.lastCollectionDate) {
      console.error('Invalid hub data');
      return null;
    }

    // Parse date if string
    const lastDate =
      typeof hub.lastCollectionDate === 'string'
        ? new Date(hub.lastCollectionDate)
        : hub.lastCollectionDate;

    // Next collection is 3 days after last collection
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 3);

    // Calculate days remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    const daysRemaining = Math.max(
      0,
      Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24))
    );

    return {
      nextDate: nextDate,
      daysRemaining: daysRemaining,
      dateString: this.formatDate(nextDate),
      formattedText: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} from today`,
    };
  }

  /**
   * Format date to readable string (e.g., "Feb 3, 2025")
   * @param {Date} date
   * @returns {String} Formatted date
   */
  formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Add EcoPoints for transaction
   * Prevents duplicate transactions with same ID
   * @param {Number} points - Points to add
   * @param {String} transactionId - Unique transaction ID
   * @param {Number} level - Level (3 or 4)
   * @returns {Object} { success, message, newBalance, transactionId }
   */
  addEcoPoints(points, transactionId, level) {
    try {
      // Check for duplicates
      if (this.isDuplicateTransaction(transactionId)) {
        return {
          success: false,
          message: 'Transaction already processed',
          isDuplicate: true,
        };
      }

      // Get current balance
      const currentBalance = this.getEcoPointsBalance();
      const newBalance = currentBalance + points;

      // Store updated balance
      localStorage.setItem('balance', newBalance.toString());

      // Record transaction
      this.recordTransaction({
        transactionId,
        level,
        pointsEarned: points,
        timestamp: new Date().toISOString(),
        newBalance,
      });

      return {
        success: true,
        message: `+${points} EcoPoints added for your circular contribution 🌱`,
        pointsEarned: points,
        newBalance: newBalance,
        transactionId: transactionId,
      };
    } catch (error) {
      console.error('Error adding EcoPoints:', error);
      return {
        success: false,
        message: 'Error processing EcoPoints',
        error: error.message,
      };
    }
  }

  /**
   * Get current EcoPoints balance
   * @returns {Number} Current balance
   */
  getEcoPointsBalance() {
    const balance = localStorage.getItem('balance');
    return balance ? parseInt(balance, 10) : 0;
  }

  /**
   * Check if transaction already processed
   * @param {String} transactionId
   * @returns {Boolean}
   */
  isDuplicateTransaction(transactionId) {
    const transactions = this.getTransactionHistory();
    return transactions.some((t) => t.transactionId === transactionId);
  }

  /**
   * Record transaction in localStorage
   * @param {Object} transaction
   */
  recordTransaction(transaction) {
    const transactions = this.getTransactionHistory();
    transactions.push(transaction);
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(transactions)
    );
  }

  /**
   * Get all transactions from localStorage
   * @returns {Array}
   */
  getTransactionHistory() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Store fulfillment choice in localStorage
   * @param {Object} fulfillmentData
   */
  storeFulfillmentChoice(fulfillmentData) {
    try {
      const allFulfillments = this.getFulfillmentHistory();
      allFulfillments.push({
        ...fulfillmentData,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('fulfillment_history', JSON.stringify(allFulfillments));
      return true;
    } catch (error) {
      console.error('Error storing fulfillment choice:', error);
      return false;
    }
  }

  /**
   * Get fulfillment history
   * @returns {Array}
   */
  getFulfillmentHistory() {
    const data = localStorage.getItem('fulfillment_history');
    return data ? JSON.parse(data) : [];
  }

  /**
   * Process item return/donation with all logic
   * @param {Object} params - { itemId, itemName, level, itemValue, nearestHub }
   * @returns {Object} { success, ecoPointsResult, nextCollection, transactionId }
   */
  processItemReturn(params) {
    const {
      itemId,
      itemName,
      level,
      itemValue,
      selectedHub,
    } = params;

    // Validate inputs
    if (!itemId || !level || !selectedHub) {
      return {
        success: false,
        message: 'Missing required parameters',
      };
    }

    // Generate transaction ID
    const transactionId = `txn-${Date.now()}-${itemId}`;

    // Determine points based on level
    const pointsToAdd = level === 3 ? 20 : level === 4 ? 40 : 0;

    if (pointsToAdd === 0) {
      return {
        success: false,
        message: 'Invalid level',
      };
    }

    // Add EcoPoints
    const ecoPointsResult = this.addEcoPoints(
      pointsToAdd,
      transactionId,
      level
    );

    if (!ecoPointsResult.success) {
      return {
        success: false,
        message: ecoPointsResult.message,
      };
    }

    // Calculate next collection
    const nextCollection = this.calculateNextCollection(selectedHub);

    return {
      success: true,
      transactionId: transactionId,
      ecoPointsResult: ecoPointsResult,
      nextCollection: nextCollection,
      selectedHub: selectedHub,
      itemName: itemName,
      level: level,
    };
  }

  /**
   * Complete fulfillment choice (final step)
   * @param {Object} params
   */
  completeFulfillment(params) {
    const {
      transactionId,
      level,
      fulfillmentType, // 'pickup' or 'self-drop'
      hubSelected,
      collectionDate,
      itemName,
    } = params;

    const fulfillmentData = {
      transactionId,
      level,
      fulfillmentType,
      hubSelected: hubSelected.hubId,
      hubName: hubSelected.hubName,
      collectionDate: collectionDate,
      itemName: itemName,
      address: hubSelected.address,
      distanceKm: hubSelected.distanceKm,
    };

    this.storeFulfillmentChoice(fulfillmentData);

    return {
      success: true,
      message: `Fulfillment option saved: ${fulfillmentType}`,
      data: fulfillmentData,
    };
  }

  /**
   * Clear all data (for testing/reset)
   */
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('fulfillment_history');
    localStorage.removeItem('balance');
  }

  /**
   * Get dashboard stats
   * @returns {Object}
   */
  getDashboardStats() {
    const transactions = this.getTransactionHistory();
    const fulfillments = this.getFulfillmentHistory();
    const balance = this.getEcoPointsBalance();

    return {
      totalPoints: balance,
      totalTransactions: transactions.length,
      totalReturnsDonations: fulfillments.length,
      pickupCount: fulfillments.filter((f) => f.fulfillmentType === 'pickup')
        .length,
      selfDropCount: fulfillments.filter((f) => f.fulfillmentType === 'self-drop')
        .length,
      recentTransactions: transactions.slice(-5),
      recentFulfillments: fulfillments.slice(-5),
    };
  }
}

// Initialize globally
let collectionDriveSystem = new CollectionDriveSystem();

// Make available globally
window.CollectionDriveSystem = CollectionDriveSystem;
window.collectionDriveSystem = collectionDriveSystem;
