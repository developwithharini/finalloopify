/**
 * Streak Display Widget
 * Floating icon button that shows streak status when clicked
 */

class StreakWidget {
  constructor() {
    this.widgetId = 'streak-icon-widget';
    this.isExpanded = false;
  }

  /**
   * Initialize floating icon widget
   */
  initialize() {
    if (document.getElementById(this.widgetId)) {
      return; // Already initialized
    }

    // Create floating icon button
    const button = document.createElement('div');
    button.id = this.widgetId;
    button.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6b9e83 0%, #5a8e72 100%);
      border: 2px solid #6b9e83;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      z-index: 999;
      box-shadow: 0 6px 20px rgba(0, 255, 0, 0.3);
      transition: all 0.3s ease;
      user-select: none;
    `;
    button.innerHTML = '🔥';
    button.onclick = () => this.toggleWidget();
    button.onmouseover = () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 8px 28px rgba(0, 255, 0, 0.5)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 6px 20px rgba(0, 255, 0, 0.3)';
    };

    document.body.appendChild(button);

    // Create expanded panel
    const panel = document.createElement('div');
    panel.id = `${this.widgetId}-panel`;
    panel.style.cssText = `
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 280px;
      background: rgba(0, 0, 0, 0.98);
      border: 2px solid #6b9e83;
      border-radius: 12px;
      padding: 16px;
      z-index: 998;
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: none;
      animation: slideUp 0.3s ease;
    `;
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(0, 255, 0, 0.2); padding-bottom: 8px;">
        <div style="font-size: 12px; font-weight: 600; color: #6b9e83; text-transform: uppercase; letter-spacing: 0.5px;">Streak Status</div>
        <button onclick="streakWidget.toggleWidget()" style="background: none; border: none; color: #999; cursor: pointer; font-size: 18px; padding: 0; transition: color 0.2s;">✕</button>
      </div>
      <div id="streak-panel-content" style="text-align: center; color: #999; font-size: 12px;">Loading...</div>
    `;

    document.body.appendChild(panel);

    // Add animations
    if (!document.getElementById('streak-animations')) {
      const style = document.createElement('style');
      style.id = 'streak-animations';
      style.textContent = `
        @keyframes slideUp {
          from {
            transform: translateY(20px) translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }

    // Update content
    this.updateWidget();

    // Listen for changes
    window.addEventListener('storage', () => {
      this.updateWidget();
    });
  }

  /**
   * Toggle panel visibility
   */
  toggleWidget() {
    const panel = document.getElementById(`${this.widgetId}-panel`);
    if (!panel) return;

    this.isExpanded = !this.isExpanded;
    panel.style.display = this.isExpanded ? 'block' : 'none';
  }


  /**
   * Update widget content
   */
  updateWidget() {
    const status = streakSystem.getStreakStatus();
    const milestone = streakSystem.checkStreakMilestone();
    const content = document.getElementById('streak-panel-content');
    const button = document.getElementById(this.widgetId);

    if (!content || !button) return;

    // Update button emoji based on streak
    if (status.count === 0) {
      button.innerHTML = '🌱';
    } else if (status.count >= 10) {
      button.innerHTML = '🎉';
    } else {
      button.innerHTML = '🔥';
    }

    // Update panel content
    let panelContent = '';

    if (status.count === 0) {
      panelContent = `
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">🌱</div>
          <div style="font-size: 12px; color: #999;">No active streak</div>
          <div style="font-size: 11px; color: #666; margin-top: 8px;">Complete an action to start!</div>
        </div>
      `;
    } else {
      const remaining = milestone.weeksRemaining;
      const isMilestone = status.count === 10;

      panelContent = `
        <div style="text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px; animation: pulse 2s infinite;">🔥</div>
          <div style="font-size: 28px; font-weight: 700; color: #6b9e83; margin-bottom: 4px;">
            ${status.count}
          </div>
          <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            Week Streak
          </div>

          ${isMilestone ? `
            <div style="background: rgba(0, 255, 0, 0.2); border: 1px solid #6b9e83; border-radius: 8px; padding: 10px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🎉</div>
              <div style="font-size: 11px; color: #6b9e83; font-weight: 600;">MILESTONE!</div>
            </div>
          ` : `
            <div style="font-size: 12px; color: #999; margin-bottom: 10px;">
              <strong style="color: #6b9e83;">${remaining} weeks</strong> to milestone
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); height: 5px; border-radius: 3px; overflow: hidden;">
              <div style="
                background: linear-gradient(90deg, #6b9e83, #5a8e72);
                height: 100%;
                width: ${Math.min((status.count / 10 * 100), 100)}%;
                transition: width 0.3s ease;
              "></div>
            </div>
          `}

          <div style="font-size: 11px; color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0, 255, 0, 0.15);">
            Keep it up! 💪
          </div>
        </div>
      `;
    }

    content.innerHTML = panelContent;
  }

  /**
   * Show milestone notification (corner toast)
   */
  showMilestonePopup() {
    const notification = document.createElement('div');
    notification.id = 'streak-milestone-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
      border: 2px solid #6b9e83;
      border-radius: 12px;
      padding: 20px;
      width: 320px;
      z-index: 9999;
      animation: slideInRight 0.4s ease;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <div style="font-size: 48px; animation: bounce 0.6s ease infinite;">🎉</div>
        <div>
          <div style="font-size: 18px; font-weight: 700; color: #6b9e83; margin-bottom: 8px;">
            Milestone Unlocked! 🔥
          </div>
          <div style="font-size: 13px; color: #999; line-height: 1.4; margin-bottom: 12px;">
            You've completed <strong style="color: #5a8e72;">10 consecutive weeks</strong> of sustainable actions!
          </div>
          <div style="background: rgba(0, 255, 0, 0.2); border-left: 3px solid #6b9e83; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Bonus Awarded</div>
            <div style="font-size: 20px; font-weight: 700; color: #6b9e83;">+100 EcoPoints</div>
          </div>
          <div style="font-size: 12px; color: #666;">Keep the momentum going! 💪</div>
        </div>
        <button style="
          background: transparent;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 20px;
          padding: 0;
          margin-top: 4px;
          transition: color 0.3s ease;
        " onclick="this.parentElement.parentElement.remove()" onmouseover="this.style.color='#6b9e83'" onmouseout="this.style.color='#999'">
          ✕
        </button>
      </div>
    `;

    // Add animations if not present
    if (!document.getElementById('streak-animations')) {
      const style = document.createElement('style');
      style.id = 'streak-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    } else {
      // Ensure animations exist
      const style = document.getElementById('streak-animations');
      if (!style.textContent.includes('slideInRight')) {
        style.textContent += `
          @keyframes slideInRight {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `;
      }
    }

    document.body.appendChild(notification);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.4s ease reverse';
      setTimeout(() => {
        notification.remove();
      }, 400);
    }, 6000);
  }
}

// Global instance
const streakWidget = new StreakWidget();

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if streak system is available
  if (typeof streakSystem !== 'undefined') {
    streakWidget.initialize();

    // Check for milestone on page load
    const milestone = streakSystem.checkStreakMilestone();
    if (milestone.alreadyReached && streakSystem.getStreakStatus().count === 10) {
      // Optionally show milestone notification
    }
  }
});
