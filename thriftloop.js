/**
 * ThriftLoop - EcoPoints Redemption System
 * Manages item catalog, redemption logic, and user feedback
 * Integrates with ThriftLoopSystem for dynamic inventory
 */

class ThriftLoop {
  constructor() {
    this.currentFilter = 'all';
    this.items = [];
    this.ecoPoints = this.getEcoPointsReference();
    this.init();
  }

  /**
   * Get EcoPoints reference (from parent window if in iframe, otherwise local)
   */
  getEcoPointsReference() {
    // Check if we're in an iframe and parent has ecoPoints
    if (window.parent && window.parent !== window && window.parent.ecoPoints) {
      return window.parent.ecoPoints;
    }
    // Otherwise use local ecoPoints
    return typeof ecoPoints !== 'undefined' ? ecoPoints : null;
  }

  /**
   * Load items from inventory system
   */
  loadItems() {
    if (!window.thriftLoopSystem) {
      console.warn('ThriftLoopSystem not available, using fallback items');
      return this.getFallbackItems();
    }
    return thriftLoopSystem.getAvailableItems();
  }

  /**
   * Fallback items if inventory system unavailable
   */
  getFallbackItems() {
    return [];
  }

  /**
   * Initialize page on load
   */
  init() {
    this.items = this.loadItems();
    this.updateBalance();
    this.renderItems();
    this.setupEventListeners();
    this.loadRedemptionHistory();
  }

  /**
   * Update current balance from localStorage
   */
  updateBalance() {
    if (!this.ecoPoints) {
      console.warn('EcoPoints system not available');
      return;
    }
    const balance = this.ecoPoints.getBalance();
    document.getElementById('current-balance').textContent = balance;
    if (document.getElementById('hero-balance')) {
      document.getElementById('hero-balance').textContent = balance;
    }
  }

  /**
   * Setup event listeners for filter tabs
   */
  setupEventListeners() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderItems();
      });
    });
  }

  /**
   * Render items based on current filter
   */
  renderItems() {
    const container = document.getElementById('items-container');
    const emptyState = document.getElementById('empty-state');

    // Reload items from inventory system for real-time updates
    this.items = this.loadItems();

    const filteredItems = this.currentFilter === 'all'
      ? this.items
      : this.items.filter(item => item.category === this.currentFilter);

    if (filteredItems.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';
    container.innerHTML = filteredItems.map(item => this.createItemCard(item)).join('');
  }

  /**
   * Create item card HTML
   */
  createItemCard(item) {
    if (!this.ecoPoints) {
      console.warn('EcoPoints system not available');
      return '';
    }
    const balance = this.ecoPoints.getBalance();
    // Use pointsCost if available (from inventory system), otherwise fallback to cost
    const cost = item.pointsCost || item.cost;
    const hasEnoughPoints = balance >= cost;
    const buttonClass = hasEnoughPoints ? '' : 'disabled';
    const tooltipText = hasEnoughPoints ? '' : `Need ${cost - balance} more points`;

    const categoryIcons = {
      clothing: '👕',
      decor: '🏠',
      utility: '🛠️'
    };

    const categoryLabel = {
      clothing: 'Pre-loved Clothing',
      decor: 'Home Decor',
      utility: 'Daily Utility'
    };

    const hasImage = item.imageUrl && item.imageUrl.trim();
    const imageContent = hasImage 
      ? `<img src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.classList.add('no-image')">`
      : `<span>${item.icon || categoryIcons[item.category] || '📦'}</span>`;

    return `
      <div class="item-card">
        <div class="item-image ${!hasImage ? 'no-image' : ''}">${imageContent}</div>
        <div class="item-content">
          <div class="item-category">${categoryLabel[item.category]}</div>
          <h3 class="item-name">${item.name}</h3>
          <p class="item-description">${item.description}</p>
          <div class="item-footer">
            <div class="item-cost">
              <span class="item-cost-label">Cost</span>
              <span class="item-cost-amount">${cost}</span>
            </div>
            <div class="tooltip-wrapper">
              <button 
                class="redeem-btn ${buttonClass}" 
                onclick="thriftLoop.handleRedeem('${item.id}')"
                ${!hasEnoughPoints ? 'disabled' : ''}
              >
                Redeem
              </button>
              ${!hasEnoughPoints ? `<div class="tooltip">${tooltipText}</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle redemption click
   */
  handleRedeem(itemId) {
    if (!this.ecoPoints) {
      this.showErrorModal(null, 0, 'System unavailable');
      return;
    }
    
    // Find item in loaded items
    let item = this.items.find(i => String(i.id) === String(itemId));
    
    // If not found in loaded items, try to get from inventory system
    if (!item && window.thriftLoopSystem) {
      item = thriftLoopSystem.getItem(itemId);
    }

    if (!item) {
      this.showErrorModal(null, 0, 'Item not found');
      return;
    }

    const cost = item.pointsCost || item.cost;
    const balance = this.ecoPoints.getBalance();

    // Validate sufficient points
    if (balance < cost) {
      this.showErrorModal(item, balance, null);
      return;
    }

    // Show confirmation modal
    this.showConfirmationModal(item);
  }

  /**
   * Show confirmation modal
   */
  showConfirmationModal(item) {
    const cost = item.pointsCost || item.cost;
    const modal = document.getElementById('confirmation-modal');
    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-cost').textContent = `${cost} EcoPoints`;
    document.getElementById('modal-text').textContent = `Your redemption for "${item.name}" has been confirmed!`;
    
    // Store item for confirmation
    this.pendingRedemption = item;
    
    // Override confirm button
    const confirmBtn = modal.querySelector('.modal-btn-confirm');
    confirmBtn.onclick = () => this.confirmRedemption();
    
    modal.classList.add('show');
  }

  /**
   * Confirm and process redemption
   */
  confirmRedemption() {
    const item = this.pendingRedemption;
    if (!item || !this.ecoPoints) return;

    const cost = item.pointsCost || item.cost;

    // Deduct points
    const ruleKey = `thriftloop_redeem_${item.id}`;
    this.ecoPoints.deductPoints(cost, ruleKey);

    // Log redemption in inventory system if available
    if (window.thriftLoopSystem) {
      thriftLoopSystem.recordRedemption(item.id, cost);
    }

    // Log redemption
    this.logRedemption(item, cost);

    // Update UI
    this.updateBalance();
    this.renderItems();
    this.loadRedemptionHistory();

    // Show success toast
    if (toastManager) {
      toastManager.success({
        title: 'Redemption Successful!',
        message: `You've redeemed ${item.name} for ${cost} EcoPoints`
      });
    }

    // Close modal
    this.closeModal();
  }

  /**
   * Show error modal for insufficient points
   */
  showErrorModal(item, currentBalance, errorMessage) {
    const modal = document.getElementById('error-modal');
    const errorMsg = document.getElementById('error-message');
    
    if (errorMessage) {
      // Custom error message
      errorMsg.textContent = errorMessage;
    } else if (item) {
      const cost = item.pointsCost || item.cost;
      const needed = cost - currentBalance;
      errorMsg.innerHTML = `
        You need <strong>${needed} more EcoPoints</strong> to redeem this item.<br>
        <span style="color: #6b9e83;">Earn more points through ReturnBox or MaterialBank!</span>
      `;
    } else {
      errorMsg.textContent = 'An error occurred. Please try again.';
    }
    
    modal.classList.add('show');
  }

  /**
   * Log redemption to localStorage
   */
  logRedemption(item, cost) {
    const redemptions = JSON.parse(localStorage.getItem('thriftloop_redemptions') || '[]');
    redemptions.push({
      id: item.id,
      name: item.name,
      cost: cost || item.pointsCost || item.cost,
      timestamp: new Date().toLocaleString(),
      date: new Date().toISOString()
    });
    localStorage.setItem('thriftloop_redemptions', JSON.stringify(redemptions));
  }

  /**
   * Load and display redemption history
   */
  loadRedemptionHistory() {
    const redemptions = JSON.parse(localStorage.getItem('thriftloop_redemptions') || '[]');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');

    if (redemptions.length === 0) {
      historySection.style.display = 'none';
      return;
    }

    historySection.style.display = 'block';
    historyList.innerHTML = redemptions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10) // Show last 10
      .map(redemption => `
        <div class="history-item">
          <div class="history-item-info">
            <h4>${redemption.name}</h4>
            <p>${redemption.timestamp}</p>
          </div>
          <div class="history-item-cost">-${redemption.cost} pts</div>
        </div>
      `).join('');
  }

  /**
   * Close confirmation modal
   */
  closeModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.remove('show');
    this.pendingRedemption = null;
  }
}

/**
 * Global helper functions
 */
function closeModal() {
  const modal = document.getElementById('confirmation-modal');
  modal.classList.remove('show');
  thriftLoop.pendingRedemption = null;
}

function closeErrorModal() {
  const modal = document.getElementById('error-modal');
  modal.classList.remove('show');
}

// Initialize on page load
let thriftLoop;
document.addEventListener('DOMContentLoaded', () => {
  thriftLoop = new ThriftLoop();
  
  // Show admin link if user is hub-admin
  const role = localStorage.getItem('role');
  const adminLink = document.getElementById('admin-link');
  if (adminLink && role === 'hub-admin') {
    adminLink.style.display = 'inline-flex';
  }
  
  
  // Real-time balance synchronization every 500ms
  setInterval(() => {
    if (thriftLoop) {
      thriftLoop.updateBalance();
    }
  }, 500);
  
  // Also trigger from main app changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'eco_points_balance' || e.key === 'balance' || e.key === 'transactions') {
      if (thriftLoop) {
        thriftLoop.updateBalance();
        thriftLoop.renderItems();
      }
    }
  });
});

// Additional sync in case of cross-tab updates
window.addEventListener('storage', (e) => {
  if (e.key === 'eco_points_balance' || e.key === 'balance') {
    if (thriftLoop) {
      thriftLoop.updateBalance();
      thriftLoop.renderItems();
    }
  }
});
