/**
 * LOOPIFY API CLIENT
 * 
 * Frontend integration helper to replace localStorage with API calls
 * 
 * Usage in HTML:
 * <script src="loopify-api-client.js"></script>
 * 
 * Then use: LoopifyAPI.getUser(userId), LoopifyAPI.awardPoints(), etc.
 */

class LoopifyAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.userId = null;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  /**
   * USERS - Get user profile
   */
  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async getUserByEmail(email) {
    return this.request(`/users/email/${email}`);
  }

  async getAllUsers(limit = 20, offset = 0) {
    return this.request(`/users?limit=${limit}&offset=${offset}`);
  }

  /**
   * USERS - Create new user
   */
  async createUser(name, email, password) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password_hash: password }),
    });
  }

  /**
   * ECOPOINTS - Get user balance
   */
  async getBalance(userId) {
    return this.request(`/users/${userId}/balance`);
  }

  /**
   * ECOPOINTS - Award points
   */
  async awardPoints(userId, points, reason = 'Manual adjustment') {
    return this.request(`/users/${userId}/points`, {
      method: 'PATCH',
      body: JSON.stringify({ points, reason }),
    });
  }

  /**
   * ECOPOINTS - Get transaction history
   */
  async getTransactionHistory(userId, limit = 50) {
    return this.request(`/users/${userId}/transactions?limit=${limit}`);
  }

  /**
   * ITEMS - Get available items
   */
  async getItems(hubId = null, category = null) {
    let endpoint = '/items';
    const params = [];
    if (hubId) params.push(`hub_id=${hubId}`);
    if (category) params.push(`category=${category}`);
    if (params.length) endpoint += '?' + params.join('&');
    return this.request(endpoint);
  }

  /**
   * ITEMS - Get item by ID
   */
  async getItem(itemId) {
    return this.request(`/items/${itemId}`);
  }

  /**
   * ITEMS - Redeem item
   */
  async redeemItem(itemId, userId, fulfillmentType = 'pickup') {
    return this.request(`/items/${itemId}/redeem`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, fulfillment_type: fulfillmentType }),
    });
  }

  /**
   * AUCTIONS - Get active auctions
   */
  async getAuctions() {
    return this.request('/auctions');
  }

  /**
   * AUCTIONS - Get auction by ID
   */
  async getAuction(auctionId) {
    return this.request(`/auctions/${auctionId}`);
  }

  /**
   * AUCTIONS - Place bid
   */
  async placeBid(auctionId, userId, bidAmount) {
    return this.request(`/auctions/${auctionId}/bid`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, bid_amount: bidAmount }),
    });
  }

  /**
   * HUBS - Get all hubs
   */
  async getHubs() {
    return this.request('/hubs');
  }

  /**
   * HUBS - Get hub details with stats
   */
  async getHub(hubId) {
    return this.request(`/hubs/${hubId}`);
  }

  /**
   * RETURNS - Get user's returns
   */
  async getUserReturns(userId) {
    return this.request(`/users/${userId}/returns`);
  }

  /**
   * RETURNS - Create return/donation
   */
  async createReturn(userId, hubId, level, returnType = 'return', fulfillmentType = 'self-drop', itemsList = '') {
    return this.request('/returns', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        hub_id: hubId,
        level,
        return_type: returnType,
        fulfillment_type: fulfillmentType,
        items_list: itemsList,
      }),
    });
  }

  /**
   * REFERRALS - Get user's referral info
   */
  async getReferralInfo(userId) {
    return this.request(`/users/${userId}/referrals`);
  }

  /**
   * STREAKS - Get user's weekly streak
   */
  async getStreak(userId) {
    return this.request(`/users/${userId}/streak`);
  }

  /**
   * ANALYTICS - Get platform stats
   */
  async getPlatformStats() {
    return this.request('/stats');
  }

  /**
   * ANALYTICS - Get leaderboard
   */
  async getLeaderboard(limit = 10) {
    return this.request(`/leaderboard?limit=${limit}`);
  }

  /**
   * HEALTH - Check API is running
   */
  async health() {
    return this.request('/health');
  }
}

// Global instance
const LoopifyAPI = new LoopifyAPI();

// Export for Node.js/modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoopifyAPI;
}
