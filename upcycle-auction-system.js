/**
 * Upcycle Auction System
 * Manages items eligible for auction (30+ days old, unredeemed)
 * Handles bidding, auction timers, and winner determination
 */

class UpcycleAuctionSystem {
  constructor() {
    this.AUCTION_DURATION = 3 * 24 * 60 * 60 * 1000; // 72 hours in ms
    this.MIN_STARTING_BID = 5;
    this.MIN_BID_INCREMENT = 1;
    this.ITEM_ELIGIBILITY_DAYS = 30;
    
    this.auctions = this.loadAuctions();
    this.ecoPoints = this.getEcoPointsReference();
    this.init();
  }

  /**
   * Get EcoPoints reference from parent or local
   */
  getEcoPointsReference() {
    if (window.parent && window.parent !== window && window.parent.ecoPoints) {
      return window.parent.ecoPoints;
    }
    return typeof ecoPoints !== 'undefined' ? ecoPoints : null;
  }

  /**
   * Initialize auction system
   */
  init() {
    this.checkAndMoveExpiredItems();
    this.finalizeExpiredAuctions();
    console.log('✅ Upcycle Auction System initialized');
  }

  /**
   * Load auctions from localStorage
   */
  loadAuctions() {
    return JSON.parse(localStorage.getItem('upcycle_auctions') || '{}');
  }

  /**
   * Save auctions to localStorage
   */
  saveAuctions() {
    localStorage.setItem('upcycle_auctions', JSON.stringify(this.auctions));
  }

  /**
   * Check for items 30+ days old and move to auction
   */
  checkAndMoveExpiredItems() {
    const thriftItems = JSON.parse(localStorage.getItem('thriftloop_items') || '[]');
    const now = new Date();

    thriftItems.forEach(item => {
      if (item.availabilityStatus !== 'redeemed' && 
          item.uploadedDate && 
          !this.auctions[item.itemId]) {
        
        const uploadedDate = new Date(item.uploadedDate);
        const daysOld = Math.floor((now - uploadedDate) / (1000 * 60 * 60 * 24));

        if (daysOld >= this.ITEM_ELIGIBILITY_DAYS) {
          // Create auction for this item
          this.createAuction(item);
        }
      }
    });

    this.saveAuctions();
  }

  /**
   * Create new auction for an item
   */
  createAuction(item) {
    const auctionStartDate = new Date();
    const auctionEndDate = new Date(auctionStartDate.getTime() + this.AUCTION_DURATION);

    this.auctions[item.itemId] = {
      itemId: item.itemId,
      itemName: item.itemName,
      category: item.category,
      imageUrl: item.imageUrl,
      uploadedDate: item.uploadedDate,
      auctionStartDate: auctionStartDate.toISOString(),
      auctionEndDate: auctionEndDate.toISOString(),
      startingBid: this.MIN_STARTING_BID,
      currentBid: this.MIN_STARTING_BID,
      highestBidderId: null,
      highestBidderName: 'Open Bid',
      bidHistory: [],
      status: 'active',
      hubId: item.hubId,
      hubName: item.hubName
    };

    console.log(`🎯 Auction created for item: ${item.itemName}`);
  }

  /**
   * Get all active auctions
   */
  getActiveAuctions() {
    const now = new Date();
    const active = [];

    for (const itemId in this.auctions) {
      const auction = this.auctions[itemId];
      const endDate = new Date(auction.auctionEndDate);

      if (endDate > now && auction.status === 'active') {
        active.push({
          ...auction,
          timeRemaining: this.calculateTimeRemaining(endDate),
          hoursRemaining: this.calculateHoursRemaining(endDate)
        });
      }
    }

    return active.sort((a, b) => new Date(a.auctionEndDate) - new Date(b.auctionEndDate));
  }

  /**
   * Get expired auctions that haven't been finalized
   */
  getExpiredAuctions() {
    const now = new Date();
    const expired = [];

    for (const itemId in this.auctions) {
      const auction = this.auctions[itemId];
      const endDate = new Date(auction.auctionEndDate);

      if (endDate <= now && auction.status === 'active') {
        expired.push(auction);
      }
    }

    return expired;
  }

  /**
   * Calculate time remaining in human-readable format
   */
  calculateTimeRemaining(endDate) {
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) return '⏱️ Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }

  /**
   * Calculate just hours remaining (for progress indicator)
   */
  calculateHoursRemaining(endDate) {
    const now = new Date();
    const diff = endDate - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }

  /**
   * Place a bid on an auction
   */
  placeBid(itemId, userId, userName, bidAmount) {
    const auction = this.auctions[itemId];
    
    if (!auction) {
      return { success: false, message: 'Auction not found' };
    }

    // Check if auction is still active
    const now = new Date();
    const endDate = new Date(auction.auctionEndDate);
    if (endDate <= now) {
      return { success: false, message: '⏱️ Auction has ended' };
    }

    // Validate bid amount
    const minBid = auction.currentBid + this.MIN_BID_INCREMENT;
    if (bidAmount < minBid) {
      return { 
        success: false, 
        message: `Bid must be at least ${minBid} EcoPoints (current: ${auction.currentBid})` 
      };
    }

    // Check user balance
    if (!this.ecoPoints) {
      return { success: false, message: 'EcoPoints system unavailable' };
    }

    const balance = this.ecoPoints.getBalance();
    if (balance < bidAmount) {
      return { 
        success: false, 
        message: `Insufficient EcoPoints (You have: ${balance}, Needed: ${bidAmount})` 
      };
    }

    // Record bid in history
    auction.bidHistory.push({
      bidAmount: bidAmount,
      bidderId: userId,
      bidderName: userName,
      timestamp: new Date().toISOString()
    });

    // Update highest bid
    auction.highestBidderId = userId;
    auction.highestBidderName = userName;
    auction.currentBid = bidAmount;

    this.saveAuctions();

    return {
      success: true,
      message: `✨ Bid placed! ${bidAmount} EcoPoints`,
      auction: auction
    };
  }

  /**
   * Get user's current bid on an auction (if any)
   */
  getUserBid(itemId, userId) {
    const auction = this.auctions[itemId];
    if (!auction) return null;

    const userBids = auction.bidHistory.filter(bid => bid.bidderId === userId);
    return userBids.length > 0 ? userBids[userBids.length - 1].bidAmount : null;
  }

  /**
   * Finalize expired auctions
   */
  finalizeExpiredAuctions() {
    const expired = this.getExpiredAuctions();

    expired.forEach(auction => {
      if (auction.highestBidderId && auction.status === 'active') {
        // Award item to winner
        this.awardAuction(auction.itemId, auction.highestBidderId, auction.currentBid);
      } else if (auction.status === 'active') {
        // No bids - auction failed
        auction.status = 'no_winner';
        console.log(`❌ Auction ended with no bids: ${auction.itemName}`);
      }
    });

    this.saveAuctions();
  }

  /**
   * Award auction to winner
   */
  awardAuction(itemId, winnerId, finalBid) {
    const auction = this.auctions[itemId];
    if (!auction) return;

    // Deduct points from winner
    if (this.ecoPoints) {
      this.ecoPoints.addPoints('AUCTION_WIN', {
        transactionId: `AUCTION_${itemId}_${Date.now()}`,
        itemId: itemId,
        auctionWon: true,
        bidAmount: finalBid
      }, -finalBid); // Negative to deduct
    }

    // Mark auction as complete
    auction.status = 'winner_determined';
    auction.winnerId = winnerId;
    auction.finalBid = finalBid;
    auction.completedDate = new Date().toISOString();

    // Update thrift item status
    const thriftItems = JSON.parse(localStorage.getItem('thriftloop_items') || '[]');
    const itemIndex = thriftItems.findIndex(i => i.itemId === itemId);
    if (itemIndex !== -1) {
      thriftItems[itemIndex].availabilityStatus = 'auction_won';
      thriftItems[itemIndex].auctionWinnerId = winnerId;
      localStorage.setItem('thriftloop_items', JSON.stringify(thriftItems));
    }

    this.saveAuctions();

    console.log(`🎉 Auction won! Item: ${auction.itemName}, Winner: ${winnerId}, Bid: ${finalBid}`);
  }

  /**
   * Get auction by item ID
   */
  getAuction(itemId) {
    return this.auctions[itemId] || null;
  }

  /**
   * Get auctions won by user
   */
  getUserWins(userId) {
    const wins = [];

    for (const itemId in this.auctions) {
      const auction = this.auctions[itemId];
      if (auction.winnerId === userId && auction.status === 'winner_determined') {
        wins.push(auction);
      }
    }

    return wins;
  }

  /**
   * Get user's bid history for an item
   */
  getUserBidHistory(itemId, userId) {
    const auction = this.auctions[itemId];
    if (!auction) return [];

    return auction.bidHistory.filter(bid => bid.bidderId === userId);
  }

  /**
   * Format time for display
   */
  formatTimeRemaining(endDate) {
    return this.calculateTimeRemaining(new Date(endDate));
  }

  /**
   * Get auction statistics
   */
  getStats() {
    const stats = {
      totalAuctions: Object.keys(this.auctions).length,
      activeAuctions: this.getActiveAuctions().length,
      completedAuctions: Object.values(this.auctions).filter(a => a.status === 'winner_determined').length,
      totalBidsPlaced: Object.values(this.auctions).reduce((sum, a) => sum + a.bidHistory.length, 0),
      totalPointsAuctioned: Object.values(this.auctions).reduce((sum, a) => {
        if (a.status === 'winner_determined') {
          return sum + a.finalBid;
        }
        return sum;
      }, 0)
    };

    return stats;
  }
}

// Initialize on page load
const upcycleAuction = new UpcycleAuctionSystem();
