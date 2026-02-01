/**
 * ThriftLoop Inventory System
 * Manages shared thrift item catalog, hub locations, and redemption data
 * All data stored in localStorage
 */

class ThriftLoopSystem {
  constructor() {
    this.storageKey = 'thriftloop_inventory';
    this.hubsKey = 'thriftloop_hubs';
    this.redemptionsKey = 'thriftloop_redemptions';
    this.initializeData();
  }

  /**
   * Initialize data in localStorage if not exists
   */
  initializeData() {
    // Initialize hubs if not exists
    if (!localStorage.getItem(this.hubsKey)) {
      const defaultHubs = [
        {
          id: 'hub-downtown',
          name: 'Downtown Circular Hub',
          location: '123 Main Street, Downtown',
          collectionDay: 'Every Saturday',
          collectionTime: '10 AM - 4 PM',
          distanceKm: 2,
          capacity: 100,
          currentItems: 45
        },
        {
          id: 'hub-westside',
          name: 'West Side Eco Hub',
          location: '456 Park Avenue, West Side',
          collectionDay: 'Every Wednesday',
          collectionTime: '2 PM - 6 PM',
          distanceKm: 5,
          capacity: 80,
          currentItems: 32
        },
        {
          id: 'hub-central',
          name: 'Central Sustainability Hub',
          location: '789 Green Street, Central',
          collectionDay: 'Daily',
          collectionTime: '9 AM - 5 PM',
          distanceKm: 1.5,
          capacity: 150,
          currentItems: 78
        }
      ];
      localStorage.setItem(this.hubsKey, JSON.stringify(defaultHubs));
    }

    // Initialize inventory if not exists
    if (!localStorage.getItem(this.storageKey)) {
      this.setDefaultInventory();
    }

    // Initialize redemptions if not exists
    if (!localStorage.getItem(this.redemptionsKey)) {
      localStorage.setItem(this.redemptionsKey, JSON.stringify([]));
    }
  }

  /**
   * Set default inventory items
   */
  setDefaultInventory() {
    // Start with empty inventory - admin will add items
    const defaultItems = [];
    localStorage.setItem(this.storageKey, JSON.stringify(defaultItems));
  }

  /**
   * Get all hubs
   */
  getHubs() {
    return JSON.parse(localStorage.getItem(this.hubsKey) || '[]');
  }

  /**
   * Get hub by ID
   */
  getHub(hubId) {
    return this.getHubs().find(hub => hub.id === hubId);
  }

  /**
   * Get nearest hub (for demo, returns the closest one)
   */
  getNearestHub() {
    const hubs = this.getHubs();
    return hubs.reduce((nearest, hub) => 
      hub.distanceKm < nearest.distanceKm ? hub : nearest
    );
  }

  /**
   * Get all inventory items
   */
  getInventory() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category) {
    return this.getInventory().filter(item => item.category === category && item.available);
  }

  /**
   * Get items by hub
   */
  getItemsByHub(hubId) {
    return this.getInventory().filter(item => item.hubLocation === hubId && item.available);
  }

  /**
   * Get single item by ID
   */
  getItem(itemId) {
    return this.getInventory().find(item => item.id === itemId);
  }

  /**
   * Add new thrift item to inventory (Hub Admin only)
   */
  addItem(itemData) {
    // Validate points cost is within range
    if (itemData.pointsCost < 30 || itemData.pointsCost > 60) {
      return {
        success: false,
        message: 'EcoPoints cost must be between 30-60'
      };
    }

    // Validate required fields
    if (!itemData.name || !itemData.category || !itemData.hubLocation) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }

    const inventory = this.getInventory();
    const newItem = {
      id: `item-${Date.now()}`,
      name: itemData.name,
      category: itemData.category,
      pointsCost: itemData.pointsCost,
      condition: itemData.condition || 'Good',
      hubLocation: itemData.hubLocation,
      imageUrl: itemData.imageUrl || 'https://via.placeholder.com/300x300?text=Thrift+Item',
      addedBy: itemData.addedBy || 'hub-admin',
      addedDate: new Date().toISOString(),
      available: true,
      description: itemData.description || ''
    };

    inventory.push(newItem);
    localStorage.setItem(this.storageKey, JSON.stringify(inventory));

    return {
      success: true,
      message: 'Item added to inventory successfully',
      item: newItem
    };
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemId) {
    const inventory = this.getInventory();
    const filtered = inventory.filter(item => item.id !== itemId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return { success: true, message: 'Item removed' };
  }

  /**
   * Mark item as unavailable (already redeemed)
   */
  markItemUnavailable(itemId) {
    const inventory = this.getInventory();
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      item.available = false;
      localStorage.setItem(this.storageKey, JSON.stringify(inventory));
    }
  }

  /**
   * Record redemption
   */
  recordRedemption(itemId, pointsSpent) {
    const item = this.getItem(itemId);
    if (!item) {
      return {
        success: false,
        message: 'Item not found'
      };
    }

    const redemptions = JSON.parse(localStorage.getItem(this.redemptionsKey) || '[]');
    const redemptionRecord = {
      id: `redemption-${Date.now()}`,
      itemId: itemId,
      itemName: item.name,
      pointsSpent: pointsSpent,
      hubForPickup: item.hubLocation,
      redeemedDate: new Date().toISOString(),
      status: 'pending' // pending, picked-up, completed
    };

    redemptions.push(redemptionRecord);
    localStorage.setItem(this.redemptionsKey, JSON.stringify(redemptions));

    // Mark item as unavailable
    this.markItemUnavailable(itemId);

    return {
      success: true,
      message: 'Redemption recorded',
      redemption: redemptionRecord
    };
  }

  /**
   * Get all redemptions
   */
  getRedemptions() {
    return JSON.parse(localStorage.getItem(this.redemptionsKey) || '[]');
  }

  /**
   * Get redemptions by status
   */
  getRedemptionsByStatus(status) {
    return this.getRedemptions().filter(r => r.status === status);
  }

  /**
   * Update redemption status
   */
  updateRedemptionStatus(redemptionId, newStatus) {
    const redemptions = this.getRedemptions();
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (redemption) {
      redemption.status = newStatus;
      localStorage.setItem(this.redemptionsKey, JSON.stringify(redemptions));
      return { success: true, message: 'Status updated' };
    }
    return { success: false, message: 'Redemption not found' };
  }

  /**
   * Get available items for redemption
   */
  getAvailableItems() {
    return this.getInventory().filter(item => item.available);
  }

  /**
   * Get affordable items (user can redeem with current balance)
   */
  getAffordableItems(currentBalance) {
    return this.getAvailableItems().filter(item => item.pointsCost <= currentBalance);
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.hubsKey);
    localStorage.removeItem(this.redemptionsKey);
    this.initializeData();
  }
}

// Initialize globally
let thriftLoopSystem = new ThriftLoopSystem();
window.ThriftLoopSystem = ThriftLoopSystem;
window.thriftLoopSystem = thriftLoopSystem;
