/**
 * EcoPoints Reward System
 * Centralized client-side utility for managing sustainability rewards
 * 
 * Storage Schema:
 * - ecopoints_balance: Current total points
 * - ecopoints_transactions: Array of transaction logs
 * - ecopoints_processed: Set of processed transaction IDs (prevents duplicates)
 */

class EcoPointsSystem {
  constructor() {
    this.STORAGE_KEYS = {
      BALANCE: 'ecopoints_balance',
      TRANSACTIONS: 'ecopoints_transactions',
      PROCESSED: 'ecopoints_processed'
    };

    this.POINT_RULES = {
      // Level 3 (ReturnBox)
      LEVEL3_SMALL_RETURN: { points: 10, label: 'Small item return/donation' },
      LEVEL3_MEDIUM_RETURN: { points: 20, label: 'Medium bulk return' },
      LEVEL3_COMMUNITY_DRIVE: { points: 30, label: 'Community drive participation' },

      // Level 4 (MaterialBank)
      LEVEL4_MATERIAL_MATCH: { points: 40, label: 'Industrial material listing matched' },
      LEVEL4_TRANSACTION: { points: 50, label: 'Successful material reuse transaction' }
    };

    // Initialize storage if needed
    this._initializeStorage();
  }

  /**
   * Initialize localStorage with default values if not present
   */
  _initializeStorage() {
    if (!localStorage.getItem(this.STORAGE_KEYS.BALANCE)) {
      localStorage.setItem(this.STORAGE_KEYS.BALANCE, '0');
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.PROCESSED)) {
      localStorage.setItem(this.STORAGE_KEYS.PROCESSED, JSON.stringify({}));
    }
  }

  /**
   * Add points for a completed action
   * @param {string} ruleKey - Key from POINT_RULES (e.g., 'LEVEL3_SMALL_RETURN')
   * @param {Object} metadata - Transaction metadata
   * @param {string} metadata.transactionId - Unique ID to prevent duplicates
   * @param {string} metadata.itemId - Item/material identifier
   * @param {number} [metadata.quantity] - Quantity involved
   * @param {string} [metadata.category] - Category (for MaterialBank)
   * @returns {Object} - {success: boolean, points: number, message: string}
   */
  addPoints(ruleKey, metadata = {}) {
    const rule = this.POINT_RULES[ruleKey];
    if (!rule) {
      return {
        success: false,
        points: 0,
        message: `Invalid rule key: ${ruleKey}`
      };
    }

    // Prevent duplicate rewards
    const processed = this._getProcessedTransactions();
    if (processed[metadata.transactionId]) {
      return {
        success: false,
        points: 0,
        message: 'Transaction already rewarded'
      };
    }

    // Add points
    const currentBalance = this.getBalance();
    const newBalance = currentBalance + rule.points;
    localStorage.setItem(this.STORAGE_KEYS.BALANCE, newBalance.toString());

    // Log transaction
    const transaction = {
      id: metadata.transactionId,
      timestamp: new Date().toISOString(),
      ruleKey: ruleKey,
      pointsEarned: rule.points,
      label: rule.label,
      metadata: {
        itemId: metadata.itemId,
        quantity: metadata.quantity || 1,
        category: metadata.category || ''
      }
    };

    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Mark as processed
    processed[metadata.transactionId] = true;
    localStorage.setItem(this.STORAGE_KEYS.PROCESSED, JSON.stringify(processed));

    return {
      success: true,
      points: rule.points,
      newBalance: newBalance,
      message: `+${rule.points} EcoPoints earned for ${rule.label} 🌱`
    };
  }

  /**
   * Deduct points for redemption
   * @param {number} points - Points to deduct
   * @param {string} ruleKey - Redemption rule key (e.g., 'thriftloop_redeem_1')
   * @param {Object} metadata - Redemption metadata
   * @returns {Object} - {success: boolean, newBalance: number, message: string}
   */
  deductPoints(points, ruleKey, metadata = {}) {
    const currentBalance = this.getBalance();
    
    if (currentBalance < points) {
      return {
        success: false,
        newBalance: currentBalance,
        message: `Insufficient points. Need ${points}, have ${currentBalance}`
      };
    }

    const newBalance = currentBalance - points;
    localStorage.setItem(this.STORAGE_KEYS.BALANCE, newBalance.toString());

    // Log transaction
    const transaction = {
      id: `${ruleKey}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ruleKey: ruleKey,
      pointsDeducted: points,
      type: 'redemption',
      label: metadata.label || 'EcoPoints Redemption',
      metadata: metadata
    };

    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    return {
      success: true,
      points: points,
      newBalance: newBalance,
      message: `-${points} EcoPoints redeemed ✨`
    };
  }

  /**
   * Get current EcoPoints balance
   * @returns {number} Current balance
   */
  getBalance() {
    return parseInt(localStorage.getItem(this.STORAGE_KEYS.BALANCE) || '0');
  }

  /**
   * Get all transactions (transaction log)
   * @returns {Array} Array of transaction objects
   */
  getTransactions() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS) || '[]');
  }

  /**
   * Get transactions for a specific level
   * @param {number} level - Level number (3 or 4)
   * @returns {Array} Filtered transactions
   */
  getTransactionsByLevel(level) {
    const allTransactions = this.getTransactions();
    const levelPrefix = `LEVEL${level}`;
    return allTransactions.filter(t => t.ruleKey.startsWith(levelPrefix));
  }

  /**
   * Get processed transaction IDs (for duplicate prevention)
   * @private
   * @returns {Object} Map of transaction IDs
   */
  _getProcessedTransactions() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PROCESSED) || '{}');
  }

  /**
   * Reset all EcoPoints data (for testing)
   * @param {string} confirmationCode - Pass 'RESET_CONFIRMED' to reset
   */
  resetAll(confirmationCode) {
    if (confirmationCode === 'RESET_CONFIRMED') {
      localStorage.setItem(this.STORAGE_KEYS.BALANCE, '0');
      localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(this.STORAGE_KEYS.PROCESSED, JSON.stringify({}));
      return { success: true, message: 'EcoPoints data reset' };
    }
    return { success: false, message: 'Reset confirmation code required' };
  }

  /**
   * Get summary stats
   * @returns {Object} Summary information
   */
  getStats() {
    const transactions = this.getTransactions();
    const balance = this.getBalance();
    const level3Transactions = this.getTransactionsByLevel(3).length;
    const level4Transactions = this.getTransactionsByLevel(4).length;

    return {
      totalBalance: balance,
      totalTransactions: transactions.length,
      level3Actions: level3Transactions,
      level4Actions: level4Transactions,
      lastTransaction: transactions.length > 0 ? transactions[transactions.length - 1] : null
    };
  }
}

// Global instance
const ecoPoints = new EcoPointsSystem();
