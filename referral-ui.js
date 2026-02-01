/**
 * Loopify Referral UI Components
 * 
 * Handles all user interface elements for the referral system:
 * - Referral code display
 * - Referral code entry modal
 * - Reward notifications
 * - Referral dashboard
 */

class ReferralUI {
  constructor(referralSystem) {
    this.referralSystem = referralSystem;
    this.NOTIFICATION_DURATION = 5000;
  }

  /**
   * Initialize referral system for a user
   * Called on first app load or login
   * 
   * @param {string} userId - Current user ID
   * @param {boolean} isNewUser - Whether this appears to be a new user
   * @returns {object} User referral data
   */
  initializeUserReferral(userId, isNewUser = false) {
    console.log('[ReferralUI] Initializing user:', userId, 'isNew:', isNewUser);

    // Get or create user in referral system
    let referralCode = null;
    if (isNewUser) {
      // Show referral entry modal for new user
      this.showReferralEntryModal(userId, (enteredCode) => {
        const user = this.referralSystem.getOrCreateUser(userId, enteredCode);
        referralCode = user.referralCode;
        this.showNotification(
          'success',
          '✨ Your referral profile created!',
          `Share your code: ${user.referralCode}`
        );
      });
    } else {
      const user = this.referralSystem.getOrCreateUser(userId);
      referralCode = user.referralCode;
    }

    return {
      userId: userId,
      referralCode: referralCode,
      referralStats: this.referralSystem.getReferralStats(userId)
    };
  }

  /**
   * Show modal for entering referral code
   * Displayed to new users on first interaction
   * 
   * @param {string} userId - New user ID
   * @param {function} onCodeSubmit - Callback with entered code
   */
  showReferralEntryModal(userId, onCodeSubmit) {
    // Create modal HTML
    const modalHTML = `
      <div id="referral-entry-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in;
      ">
        <div style="
          background: linear-gradient(135deg, #000000 0%, #000000 100%);
          border: 1px solid #003300;
          border-radius: 16px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        ">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 40px; margin-bottom: 15px;">🌱</div>
            <h2 style="
              color: #6b9e83;
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 10px 0;
            ">Welcome to Loopify!</h2>
            <p style="
              color: #999;
              font-size: 14px;
              margin: 0;
              line-height: 1.6;
            ">
              Have a referral code from a friend? Enter it below to earn bonus EcoPoints!
            </p>
          </div>

          <!-- Input Section -->
          <div style="margin-bottom: 20px;">
            <label style="
              display: block;
              color: #f5f5f5;
              font-weight: 600;
              margin-bottom: 8px;
              font-size: 13px;
            ">Referral Code (optional)</label>
            <input 
              id="referral-code-input" 
              type="text" 
              placeholder="e.g., LOOP-7A3F"
              style="
                width: 100%;
                padding: 12px 16px;
                background: rgba(45, 52, 54, 0.5);
                border: 2px solid #003300;
                border-radius: 8px;
                color: #f5f5f5;
                font-size: 14px;
                font-family: monospace;
                transition: all 0.3s ease;
                box-sizing: border-box;
              "
              onkeypress="if(event.key==='Enter') document.getElementById('referral-submit-btn').click()"
              onfocus="this.style.borderColor='#6b9e83'; this.style.boxShadow='0 0 0 3px rgba(0, 255, 0, 0.1)'"
              onblur="this.style.borderColor='#003300'; this.style.boxShadow='none'"
            />
            <p style="
              color: #666;
              font-size: 12px;
              margin: 6px 0 0 0;
            ">You'll earn 30 bonus EcoPoints after your first return or donation!</p>
          </div>

          <!-- Benefits Box -->
          <div style="
            background: rgba(0, 255, 0, 0.1);
            border-left: 3px solid #6b9e83;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 4px;
          ">
            <div style="color: #6b9e83; font-weight: 600; margin-bottom: 8px; font-size: 13px;">
              ✨ Your Friend Earns Too!
            </div>
            <div style="color: #999; font-size: 12px; line-height: 1.6;">
              When your friend makes their first circular action, they get 30 bonus points and their referrer gets 10 points. Win-win! 🎉
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button 
              onclick="
                const code = document.getElementById('referral-code-input').value;
                const onSubmit = window._referralOnSubmit;
                document.getElementById('referral-entry-modal').remove();
                if (onSubmit) onSubmit(code);
              "
              id="referral-submit-btn"
              style="
                padding: 12px;
                background: #6b9e83;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
              "
              onmouseover="this.style.background='#5a8d72'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0, 255, 0, 0.3)'"
              onmouseout="this.style.background='#6b9e83'; this.style.transform='none'; this.style.boxShadow='none'"
            >
              <i class="fas fa-check"></i> Continue
            </button>
            <button 
              onclick="document.getElementById('referral-entry-modal').remove(); if(window._referralOnSubmit) window._referralOnSubmit(null);"
              style="
                padding: 12px;
                background: transparent;
                color: #999;
                border: 1px solid #003300;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
              "
              onmouseover="this.style.borderColor='#6b9e83'; this.style.color='#6b9e83'"
              onmouseout="this.style.borderColor='#003300'; this.style.color='#999'"
            >
              <i class="fas fa-times"></i> Skip
            </button>
          </div>

          <!-- Skip Link -->
          <p style="
            text-align: center;
            color: #666;
            font-size: 12px;
            margin: 12px 0 0 0;
          ">You can always enter a code later in your profile.</p>
        </div>

        <style>
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
        </style>
      </div>
    `;

    // Inject modal
    const container = document.body || document.documentElement;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    container.appendChild(tempDiv.firstElementChild);

    // Store callback globally so inline onclick can access it
    window._referralOnSubmit = onCodeSubmit;

    // Focus input
    setTimeout(() => {
      const input = document.getElementById('referral-code-input');
      if (input) input.focus();
    }, 100);
  }

  /**
   * Display referral code widget
   * Shows user their unique referral code with copy functionality
   * 
   * @param {string} userId - User ID
   * @param {string} containerId - ID of container element to insert into
   */
  displayReferralCodeWidget(userId, containerId = 'referral-widget-container') {
    const user = this.referralSystem.getUserById(userId);
    if (!user) {
      console.error('[ReferralUI] User not found:', userId);
      return;
    }

    const stats = this.referralSystem.getReferralStats(userId);

    const widgetHTML = `
      <div id="referral-code-widget" style="
        background: linear-gradient(135deg, rgba(0, 255, 0, 0.15) 0%, rgba(74, 122, 99, 0.1) 100%);
        border: 2px solid #6b9e83;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      ">
        <!-- Title -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">🎁</div>
            <h3 style="
              color: #6b9e83;
              font-size: 16px;
              font-weight: 700;
              margin: 0;
            ">Share Your Referral Code</h3>
          </div>
        </div>

        <!-- Code Display -->
        <div style="
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #003300;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Your Code</div>
            <div style="
              font-family: monospace;
              font-size: 24px;
              font-weight: 700;
              color: #6b9e83;
              letter-spacing: 2px;
            ">${user.referralCode}</div>
          </div>
          <button 
            onclick="
              const code = '${user.referralCode}';
              navigator.clipboard.writeText(code).then(() => {
                const btn = event.target;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class=\"fas fa-check\"></i> Copied!';
                btn.style.background = '#6b9e83';
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.style.background = 'transparent';
                }, 2000);
              });
            "
            style="
              background: transparent;
              border: 1px solid #6b9e83;
              color: #6b9e83;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 12px;
              transition: all 0.3s ease;
            "
            onmouseover="this.style.background='#6b9e83'; this.style.color='#000000'"
            onmouseout="this.style.background='transparent'; this.style.color='#6b9e83'"
          >
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>

        <!-- Message -->
        <p style="
          color: #999;
          font-size: 13px;
          margin: 0 0 12px 0;
          line-height: 1.6;
        ">
          Invite friends with your code. They'll earn 30 bonus EcoPoints on their first circular action, and you'll earn 10 points too! 🌱
        </p>

        <!-- Stats Row -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          border-top: 1px solid rgba(0, 255, 0, 0.2);
          padding-top: 12px;
        ">
          <div style="text-align: center;">
            <div style="color: #6b9e83; font-size: 20px; font-weight: 700;">${stats.totalReferrals}</div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Friends Invited</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #6b9e83; font-size: 20px; font-weight: 700;">${stats.totalRewarded}</div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Bonuses Earned</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #6b9e83; font-size: 20px; font-weight: 700;">+${stats.totalPointsEarned}</div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Total Points</div>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = widgetHTML;
    }
  }

  /**
   * Show reward notification
   * Animated notification for when user earns referral bonus
   * 
   * @param {string} userId - User who earned reward
   * @param {number} bonusPoints - Points earned
   * @param {string} type - 'referred' or 'referrer'
   */
  showRewardNotification(userId, bonusPoints, type = 'referred') {
    let message, emoji;

    if (type === 'referred') {
      message = `🌱 Welcome! You earned <strong>${bonusPoints} bonus EcoPoints</strong> for your first circular action!`;
      emoji = '🌱';
    } else {
      message = `🎉 You earned <strong>${bonusPoints} EcoPoints</strong> for inviting a friend!`;
      emoji = '🎉';
    }

    this.showNotification('success', message, null, 'large');
  }

  /**
   * Show generic notification
   * @param {string} type - 'success', 'error', 'warning', 'info'
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} size - 'small', 'medium', 'large'
   */
  showNotification(type = 'info', title = '', message = '', size = 'medium') {
    const colors = {
      success: { bg: 'rgba(0, 255, 0, 0.2)', border: '#6b9e83', text: '#6b9e83', icon: 'fa-check-circle' },
      error: { bg: 'rgba(220, 53, 69, 0.2)', border: '#dc3545', text: '#ff6b6b', icon: 'fa-exclamation-circle' },
      warning: { bg: 'rgba(255, 159, 64, 0.2)', border: '#ff9f40', text: '#ff9f40', icon: 'fa-exclamation-triangle' },
      info: { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#3b82f6', icon: 'fa-info-circle' }
    };

    const color = colors[type] || colors.info;
    const sizeStyles = {
      small: { padding: '12px 16px', fontSize: '12px' },
      medium: { padding: '16px 20px', fontSize: '14px' },
      large: { padding: '20px 24px', fontSize: '16px' }
    };
    const sizeSetting = sizeStyles[size] || sizeStyles.medium;

    const notificationHTML = `
      <div class="referral-notification" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${color.bg};
        border: 2px solid ${color.border};
        border-radius: 12px;
        padding: ${sizeSetting.padding};
        font-size: ${sizeSetting.fontSize};
        color: ${color.text};
        max-width: 400px;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.3s ease-out;
        display: flex;
        gap: 12px;
        align-items: flex-start;
      ">
        <i class="fas ${color.icon}" style="flex-shrink: 0; margin-top: 2px;"></i>
        <div>
          <strong>${title}</strong>
          ${message ? `<div style="opacity: 0.9; margin-top: 4px;">${message}</div>` : ''}
        </div>
        <button 
          onclick="this.closest('.referral-notification').remove()"
          style="
            background: transparent;
            border: none;
            color: ${color.text};
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            margin-left: 8px;
          "
        >
          ×
        </button>
      </div>

      <style>
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = notificationHTML;
    document.body.appendChild(tempDiv.firstElementChild);

    // Auto-dismiss after duration
    setTimeout(() => {
      const notification = document.querySelector('.referral-notification');
      if (notification) {
        notification.style.animation = 'slideOutDown 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
      }
    }, this.NOTIFICATION_DURATION);
  }

  /**
   * Display referral dashboard
   * Complete referral stats and history
   * 
   * @param {string} userId - User ID
   * @param {string} containerId - Container element ID
   */
  displayReferralDashboard(userId, containerId = 'referral-dashboard-container') {
    const stats = this.referralSystem.getReferralStats(userId);
    if (!stats) {
      console.error('[ReferralUI] Stats not found for user:', userId);
      return;
    }

    const dashboardHTML = `
      <div id="referral-dashboard" style="
        background: linear-gradient(135deg, #000000 0%, #000000 100%);
        border-radius: 12px;
        padding: 20px;
      ">
        <!-- Header -->
        <div style="margin-bottom: 20px;">
          <h2 style="
            color: #6b9e83;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 10px 0;
          ">Referral Dashboard</h2>
          <p style="color: #999; font-size: 13px; margin: 0;">
            Track your referrals and earnings
          </p>
        </div>

        <!-- Stats Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        ">
          <!-- Total Referrals Card -->
          <div style="
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid rgba(0, 255, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          ">
            <div style="font-size: 20px; margin-bottom: 5px;">👥</div>
            <div style="color: #6b9e83; font-size: 24px; font-weight: 700;">${stats.totalReferrals}</div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; margin-top: 4px;">Total Invites</div>
          </div>

          <!-- Rewarded Referrals Card -->
          <div style="
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          ">
            <div style="font-size: 20px; margin-bottom: 5px;">✅</div>
            <div style="color: #4caf50; font-size: 24px; font-weight: 700;">${stats.totalRewarded}</div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; margin-top: 4px;">Completed</div>
          </div>

          <!-- Points Earned Card -->
          <div style="
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          ">
            <div style="font-size: 20px; margin-bottom: 5px;">⭐</div>
            <div style="color: #ffc107; font-size: 24px; font-weight: 700;">+${stats.totalPointsEarned}</div>
            <div style="color: #999; font-size: 11px; text-transform: uppercase; margin-top: 4px;">Points Earned</div>
          </div>
        </div>

        <!-- Personal Bonus Info -->
        ${stats.bonusPointsReceived > 0 ? `
          <div style="
            background: rgba(0, 255, 0, 0.15);
            border-left: 3px solid #6b9e83;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
          ">
            <div style="color: #6b9e83; font-weight: 600; font-size: 13px; margin-bottom: 4px;">
              ✨ Your Sign-Up Bonus
            </div>
            <div style="color: #999; font-size: 12px;">
              You received <strong>${stats.bonusPointsReceived} bonus EcoPoints</strong> when you completed your first action!
            </div>
          </div>
        ` : ''}

        <!-- Referral Code Section -->
        <div style="
          background: rgba(45, 52, 54, 0.3);
          border: 1px solid #003300;
          border-radius: 8px;
          padding: 12px;
          font-family: monospace;
          text-align: center;
          margin-top: 15px;
        ">
          <div style="color: #999; font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">Your Referral Code</div>
          <div style="color: #6b9e83; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
            ${stats.referralCode}
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = dashboardHTML;
    }
  }
}

// Initialize global UI instance
const referralUI = new ReferralUI(referralSystem);
console.log('[ReferralUI] UI system ready');
