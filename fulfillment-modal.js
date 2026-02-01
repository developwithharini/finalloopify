/**
 * Fulfillment Modal UI Component
 * Presents users with collection pickup vs self drop-off options
 * Premium style UI with smooth interactions
 */

class FulfillmentModal {
  constructor() {
    this.modalId = 'fulfillment-modal';
    this.isVisible = false;
    this.currentData = null;
  }

  /**
   * Create and inject modal HTML into page
   * Call this once during page initialization
   */
  initialize() {
    if (document.getElementById(this.modalId)) {
      return; // Already initialized
    }

    const modalHTML = `
      <div id="${this.modalId}" class="modal-overlay">
        <div class="modal-content fulfillment-modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Choose Your Fulfillment Option</h2>
            <button class="modal-close" onclick="fulfillmentModal.close()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Confirmation Message -->
            <div class="success-banner">
              <div class="success-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="success-text" id="ecopoints-message">
                +20 EcoPoints added for your circular contribution 🌱
              </div>
            </div>

            <!-- Collection Drive Info -->
            <div class="collection-info-card">
              <div class="info-header">
                <i class="fas fa-calendar-check" style="color: #6b9e83;"></i>
                <h3>Next Collection Drive</h3>
              </div>
              <div class="info-content">
                <p class="hub-name" id="hub-name">Downtown Circular Hub</p>
                <p class="collection-schedule">
                  <strong id="days-remaining">3 days</strong> from today
                </p>
                <p class="collection-date">
                  Collection on <strong id="collection-date">Feb 3, 2025</strong>
                </p>
                <p class="distance">📍 <span id="distance-text">2 km away</span></p>
              </div>
            </div>

            <!-- Options Container -->
            <div class="fulfillment-options">
              <!-- Option 1: Collection Pickup -->
              <div class="option-card" onclick="fulfillmentModal.selectOption('pickup')">
                <div class="option-header">
                  <div class="option-icon pickup">
                    <i class="fas fa-truck"></i>
                  </div>
                  <h3 class="option-title">Collection Drive Pickup</h3>
                </div>
                <div class="option-body">
                  <p class="option-description">
                    We'll collect your item during the next drive at the hub.
                  </p>
                  <div class="option-details">
                    <div class="detail-item">
                      <i class="fas fa-check" style="color: #6b9e83;"></i>
                      <span>No need to leave home</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-check" style="color: #6b9e83;"></i>
                      <span>Scheduled pickup on <span id="pickup-date-text">Feb 3</span></span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-check" style="color: #6b9e83;"></i>
                      <span>Free collection service</span>
                    </div>
                  </div>
                </div>
                <button class="option-btn pickup-btn" onclick="event.stopPropagation(); fulfillmentModal.confirmPickup()">
                  Choose Pickup
                </button>
              </div>

              <!-- Option 2: Self Drop-Off -->
              <div class="option-card" onclick="fulfillmentModal.selectOption('self-drop')">
                <div class="option-header">
                  <div class="option-icon self-drop">
                    <i class="fas fa-location-dot"></i>
                  </div>
                  <h3 class="option-title">Self Drop-Off</h3>
                </div>
                <div class="option-body">
                  <p class="option-description">
                    Drop your item anytime at the nearest hub.
                  </p>
                  <div class="option-details">
                    <div class="detail-item">
                      <i class="fas fa-check" style="color: #6b9e83;"></i>
                      <span>Drop anytime at your convenience</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-check" style="color: #6b9e83;"></i>
                      <span>Nearest hub is <span id="nearest-distance">2 km</span> away</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-check" style="color: #6b9e83;"></i>
                      <span>Operating hours <span id="hub-hours">10 AM - 6 PM</span></span>
                    </div>
                  </div>
                </div>
                <button class="option-btn self-drop-btn" onclick="event.stopPropagation(); fulfillmentModal.confirmSelfDrop()">
                  Choose Self Drop-Off
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Info -->
          <div class="modal-footer">
            <p class="footer-text">
              ✨ Either way, you're making a difference! Your contribution helps build a circular economy.
            </p>
          </div>
        </div>
      </div>

      <style>
        #${this.modalId} {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        #${this.modalId}.visible {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fulfillment-modal-content {
          background: linear-gradient(135deg, #000000 0%, #000000 100%);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 32px 32px 16px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #6b9e83;
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #999;
          font-size: 24px;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .modal-close:hover {
          color: #f5f5f5;
        }

        .modal-body {
          padding: 32px;
        }

        /* Success Banner */
        .success-banner {
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #6b9e83;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .success-icon {
          font-size: 32px;
          color: #6b9e83;
          flex-shrink: 0;
        }

        .success-text {
          font-size: 16px;
          font-weight: 600;
          color: #a8d5ba;
          margin: 0;
        }

        /* Collection Info Card */
        .collection-info-card {
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid rgba(0, 255, 0, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .info-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #f5f5f5;
        }

        .info-content p {
          margin: 8px 0;
          color: #999;
          font-size: 14px;
        }

        .hub-name {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #a8d5ba !important;
        }

        .collection-schedule {
          font-size: 15px !important;
          color: #6b9e83 !important;
        }

        .collection-date,
        .distance {
          color: #999;
        }

        /* Fulfillment Options */
        .fulfillment-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .fulfillment-options {
            grid-template-columns: 1fr;
          }
        }

        .option-card {
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(0, 255, 0, 0.2);
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .option-card:hover {
          border-color: #6b9e83;
          background: rgba(0, 255, 0, 0.05);
          transform: translateY(-4px);
        }

        .option-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .option-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .option-icon.pickup {
          background: rgba(0, 255, 0, 0.2);
          color: #6b9e83;
        }

        .option-icon.self-drop {
          background: rgba(0, 255, 0, 0.2);
          color: #6b9e83;
        }

        .option-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #f5f5f5;
        }

        .option-description {
          font-size: 14px;
          color: #999;
          margin: 0 0 16px 0;
        }

        .option-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
          flex: 1;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #999;
        }

        .detail-item i {
          flex-shrink: 0;
        }

        .option-btn {
          background: #6b9e83;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .option-btn:hover {
          background: #5a8e72;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 255, 0, 0.25);
        }

        .pickup-btn,
        .self-drop-btn {
          background: #6b9e83;
        }

        /* Modal Footer */
        .modal-footer {
          padding: 20px 32px;
          border-top: 1px solid rgba(0, 255, 0, 0.2);
          text-align: center;
        }

        .footer-text {
          margin: 0;
          font-size: 13px;
          color: #999;
          font-style: italic;
        }

        /* Scrollbar styling for modal */
        .fulfillment-modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .fulfillment-modal-content::-webkit-scrollbar-track {
          background: rgba(0, 255, 0, 0.1);
          border-radius: 10px;
        }

        .fulfillment-modal-content::-webkit-scrollbar-thumb {
          background: #6b9e83;
          border-radius: 10px;
        }

        .fulfillment-modal-content::-webkit-scrollbar-thumb:hover {
          background: #5a8e72;
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  /**
   * Show modal with data
   * @param {Object} data - { ecoPointsMessage, nextCollection, selectedHub, itemName, transactionId }
   */
  show(data) {
    this.currentData = data;

    // Update UI elements
    this.updateModalContent(data);

    // Show modal
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.add('visible');
      this.isVisible = true;

      // Auto-close after 3 seconds
      if (this.autoCloseTimeout) {
        clearTimeout(this.autoCloseTimeout);
      }
      this.autoCloseTimeout = setTimeout(() => {
        this.close();
      }, 3000);
    }
  }

  /**
   * Update modal content with data
   */
  updateModalContent(data) {
    // EcoPoints message
    const ecoMsg = document.getElementById('ecopoints-message');
    if (ecoMsg && data.ecoPointsMessage) {
      ecoMsg.textContent = data.ecoPointsMessage;
    }

    // Hub information
    const hubName = document.getElementById('hub-name');
    if (hubName && data.selectedHub) {
      hubName.textContent = data.selectedHub.hubName;
    }

    const distanceText = document.getElementById('distance-text');
    if (distanceText && data.selectedHub) {
      distanceText.textContent = `${data.selectedHub.distanceKm} km away`;
    }

    const nearestDistance = document.getElementById('nearest-distance');
    if (nearestDistance && data.selectedHub) {
      nearestDistance.textContent = `${data.selectedHub.distanceKm} km`;
    }

    const hubHours = document.getElementById('hub-hours');
    if (hubHours && data.selectedHub) {
      hubHours.textContent = data.selectedHub.collectionTime;
    }

    // Collection drive dates
    if (data.nextCollection) {
      const daysRemaining = document.getElementById('days-remaining');
      if (daysRemaining) {
        daysRemaining.textContent = data.nextCollection.formattedText;
      }

      const collectionDate = document.getElementById('collection-date');
      if (collectionDate) {
        collectionDate.textContent = data.nextCollection.dateString;
      }

      const pickupDateText = document.getElementById('pickup-date-text');
      if (pickupDateText) {
        pickupDateText.textContent = data.nextCollection.dateString;
      }
    }
  }

  /**
   * Select option (visual feedback)
   */
  selectOption(type) {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach((card) => {
      card.style.borderColor = 'rgba(0, 255, 0, 0.2)';
      card.style.background = 'rgba(0, 0, 0, 0.5)';
    });

    // Highlight selected (you can add more visual feedback here)
  }

  /**
   * Confirm collection pickup
   */
  confirmPickup() {
    if (!this.currentData) return;

    const fulfillmentData = {
      transactionId: this.currentData.transactionId,
      level: this.currentData.level,
      fulfillmentType: 'pickup',
      hubSelected: this.currentData.selectedHub,
      collectionDate: this.currentData.nextCollection.dateString,
      itemName: this.currentData.itemName,
    };

    // Complete fulfillment
    if (window.collectionDriveSystem) {
      window.collectionDriveSystem.completeFulfillment(fulfillmentData);
    }

    // Update weekly streak
    const streakUpdate = streakSystem.updateWeeklyStreak();
    if (streakUpdate.pointsAwarded > 0) {
      ecoPoints.addPoints(streakUpdate.pointsAwarded, `streak_bonus_${Date.now()}`);
    }

    // Prepare confirmation message with streak info
    let confirmMessage = `Your item will be collected on ${this.currentData.nextCollection.dateString} from ${this.currentData.selectedHub.hubName}`;
    if (streakUpdate.streakIncremented) {
      confirmMessage += `\n\n${streakUpdate.message}`;
    }

    // Show confirmation
    this.showConfirmation(
      confirmMessage,
      'pickup'
    );
  }

  /**
   * Confirm self drop-off
   */
  confirmSelfDrop() {
    if (!this.currentData) return;

    const fulfillmentData = {
      transactionId: this.currentData.transactionId,
      level: this.currentData.level,
      fulfillmentType: 'self-drop',
      hubSelected: this.currentData.selectedHub,
      collectionDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      itemName: this.currentData.itemName,
    };

    // Complete fulfillment
    if (window.collectionDriveSystem) {
      window.collectionDriveSystem.completeFulfillment(fulfillmentData);
    }

    // Update weekly streak
    const streakUpdate = streakSystem.updateWeeklyStreak();
    if (streakUpdate.pointsAwarded > 0) {
      ecoPoints.addPoints(streakUpdate.pointsAwarded, `streak_bonus_${Date.now()}`);
    }

    // Prepare confirmation message with streak info
    let confirmMessage = `You can drop off your item at ${this.currentData.selectedHub.hubName} (${this.currentData.selectedHub.distanceKm} km away)`;
    if (streakUpdate.streakIncremented) {
      confirmMessage += `\n\n${streakUpdate.message}`;
    }

    // Show confirmation
    this.showConfirmation(
      confirmMessage,
      'self-drop'
    );
  }

  /**
   * Show confirmation message
   */
  showConfirmation(message, type) {
    // Close current modal
    this.close();

    // Create confirmation modal
    const confirmId = 'fulfillment-confirmation';
    if (document.getElementById(confirmId)) {
      document.getElementById(confirmId).remove();
    }

    const confirmHTML = `
      <div id="${confirmId}" class="confirmation-overlay">
        <div class="confirmation-content">
          <div class="confirmation-icon" style="color: #6b9e83; font-size: 48px; margin-bottom: 16px;">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2 style="color: #6b9e83; margin: 0 0 12px 0; font-size: 22px;">✨ Perfect!</h2>
          <p style="color: #999; text-align: center; margin: 0 0 24px 0; line-height: 1.6;">
            ${message}
          </p>
          <button class="confirmation-btn" onclick="document.getElementById('${confirmId}').remove()">
            Got it!
          </button>
        </div>
      </div>

      <style>
        .confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .confirmation-content {
          background: linear-gradient(135deg, #000000 0%, #000000 100%);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
          animation: slideUp 0.4s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .confirmation-btn {
          background: #6b9e83;
          color: #fff;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .confirmation-btn:hover {
          background: #5a8e72;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 255, 0, 0.25);
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmHTML);
  }

  /**
   * Close modal
   */
  close() {
    // Clear any pending auto-close timeout
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }

    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('visible');
      this.isVisible = false;
    }
  }
}

// Initialize globally
let fulfillmentModal = new FulfillmentModal();

// Make available globally
window.FulfillmentModal = FulfillmentModal;
window.fulfillmentModal = fulfillmentModal;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  fulfillmentModal.initialize();
});
