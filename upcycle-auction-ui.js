/**
 * Upcycle Auction UI Manager
 * Handles rendering, bidding interface, and user interactions
 */

class UpcycleAuctionUI {
  constructor(auctionSystem) {
    this.auction = auctionSystem;
    this.currentUserId = localStorage.getItem('userId') || `user_${Date.now()}`;
    this.ecoPoints = this.getEcoPointsReference();
    this.init();
  }

  /**
   * Get EcoPoints reference
   */
  getEcoPointsReference() {
    if (window.parent && window.parent !== window && window.parent.ecoPoints) {
      return window.parent.ecoPoints;
    }
    return typeof ecoPoints !== 'undefined' ? ecoPoints : null;
  }

  /**
   * Initialize UI
   */
  init() {
    this.setupEventListeners();
    this.startAutoRefresh();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh auctions every 10 seconds
    document.addEventListener('DOMContentLoaded', () => {
      this.renderAuctions();
    });
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    setInterval(() => {
      this.renderAuctions();
      this.updateTimers();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Render all active auctions
   */
  renderAuctions() {
    const container = document.getElementById('upcycle-auctions-container');
    if (!container) return;

    const activeAuctions = this.auction.getActiveAuctions();

    if (activeAuctions.length === 0) {
      container.innerHTML = `
        <div class="no-auctions">
          <i class="fas fa-inbox" style="font-size: 48px; color: #666; margin-bottom: 16px;"></i>
          <p style="color: #999; font-size: 16px;">No active auctions at the moment</p>
          <p style="color: #666; font-size: 13px;">Check back soon for upcycled items!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeAuctions.map(auction => 
      this.renderAuctionCard(auction)
    ).join('');

    // Attach event listeners to bid buttons
    document.querySelectorAll('.place-bid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.handleBidClick(itemId);
      });
    });
  }

  /**
   * Render single auction card
   */
  renderAuctionCard(auction) {
    const balance = this.ecoPoints ? this.ecoPoints.getBalance() : 0;
    const userBid = this.auction.getUserBid(auction.itemId, this.currentUserId);
    const isUserHighestBidder = auction.highestBidderId === this.currentUserId;
    
    const canBid = balance > auction.currentBid;
    const minBid = auction.currentBid + this.auction.MIN_BID_INCREMENT;
    
    const hoursRemaining = auction.hoursRemaining;
    const progressPercent = Math.max(0, Math.min(100, (hoursRemaining / 72) * 100));
    
    return `
      <div class="auction-card" data-item-id="${auction.itemId}">
        <!-- Item Image -->
        <div class="auction-image-wrapper">
          <img src="${auction.imageUrl || 'https://via.placeholder.com/300x300?text=Item'}" 
               alt="${auction.itemName}" 
               class="auction-image">
          <div class="auction-time-badge">
            <i class="fas fa-hourglass-end"></i> ${auction.timeRemaining}
          </div>
        </div>

        <!-- Item Info -->
        <div class="auction-info">
          <h3 class="auction-title">${auction.itemName}</h3>
          <p class="auction-category">
            <i class="fas fa-tag"></i> ${auction.category || 'Item'}
          </p>

          <!-- Bid Progress -->
          <div class="bid-section">
            <div class="bid-header">
              <span class="bid-label">Current Bid</span>
              <span class="bid-amount">${auction.currentBid} EcoPoints</span>
            </div>
            
            <div class="bid-progress-bar">
              <div class="bid-progress-fill" style="width: ${progressPercent}%"></div>
            </div>

            <!-- Highest Bidder Info -->
            <div class="bidder-info">
              ${isUserHighestBidder ? 
                `<span class="you-leading">
                  <i class="fas fa-star"></i> You're leading!
                </span>` 
                : auction.highestBidderId ? 
                `<span class="highest-bidder">
                  Highest: <strong>${auction.highestBidderName}</strong>
                </span>` 
                : 
                `<span class="open-bid">
                  <i class="fas fa-gavel"></i> Open for bids
                </span>`
              }
            </div>

            ${userBid && !isUserHighestBidder ? 
              `<div class="your-bid-notice">
                Your bid: ${userBid} EcoPoints
              </div>` 
              : ''}
          </div>

          <!-- Bid Input Section -->
          <div class="bid-input-section">
            <div class="bid-input-group">
              <input type="number" 
                     class="bid-input" 
                     min="${minBid}" 
                     placeholder="${minBid}" 
                     value="${minBid}"
                     data-item-id="${auction.itemId}"
                     ${!canBid ? 'disabled' : ''}>
              <span class="bid-unit">pts</span>
            </div>

            <button class="place-bid-btn" 
                    data-item-id="${auction.itemId}"
                    ${!canBid ? 'disabled' : ''}
                    title="${!canBid ? 'Insufficient EcoPoints' : 'Place your bid'}">
              <i class="fas fa-gavel"></i> Bid
            </button>
          </div>

          ${!canBid ? 
            `<div class="insufficient-points">
              <i class="fas fa-alert-circle"></i> Need ${minBid} EcoPoints to bid
            </div>` 
            : ''}

          <!-- Hub Info -->
          <div class="hub-pickup">
            <i class="fas fa-location-dot"></i>
            <span>Pickup at ${auction.hubName || 'Hub'}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle bid button click
   */
  handleBidClick(itemId) {
    const bidInput = document.querySelector(`.bid-input[data-item-id="${itemId}"]`);
    if (!bidInput) return;

    const bidAmount = parseInt(bidInput.value);
    
    if (!bidAmount || bidAmount < this.auction.MIN_STARTING_BID) {
      this.showNotification(`Minimum bid is ${this.auction.MIN_STARTING_BID} EcoPoints`, 'error');
      return;
    }

    const result = this.auction.placeBid(
      itemId,
      this.currentUserId,
      `User ${this.currentUserId.substring(0, 8)}`,
      bidAmount
    );

    if (result.success) {
      this.showNotification(result.message, 'success');
      bidInput.value = (bidAmount + this.auction.MIN_BID_INCREMENT).toString();
      this.renderAuctions();
    } else {
      this.showNotification(result.message, 'error');
    }
  }

  /**
   * Update timers
   */
  updateTimers() {
    document.querySelectorAll('[data-item-id]').forEach(card => {
      const itemId = card.dataset.itemId;
      const auction = this.auction.getAuction(itemId);
      
      if (auction) {
        const timeBadge = card.querySelector('.auction-time-badge');
        if (timeBadge) {
          timeBadge.textContent = this.auction.calculateTimeRemaining(new Date(auction.auctionEndDate));
        }

        // Update progress bar
        const hours = this.auction.calculateHoursRemaining(new Date(auction.auctionEndDate));
        const progressPercent = Math.max(0, Math.min(100, (hours / 72) * 100));
        const progressFill = card.querySelector('.bid-progress-fill');
        if (progressFill) {
          progressFill.style.width = `${progressPercent}%`;
        }
      }
    });
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `auction-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        ${message}
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Show auction stats
   */
  showStats() {
    const stats = this.auction.getStats();
    console.log('📊 Upcycle Auction Statistics:', stats);
    return stats;
  }
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof upcycleAuction !== 'undefined') {
    const auctionUI = new UpcycleAuctionUI(upcycleAuction);
    window.auctionUI = auctionUI;
  }
});
