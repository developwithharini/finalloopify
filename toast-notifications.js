/**
 * Toast Notification System
 * Lightweight, client-side toast notifications without external dependencies
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toastCount = 0;
    this._initializeContainer();
  }

  /**
   * Create and inject toast container into the DOM
   * @private
   */
  _initializeContainer() {
    if (document.getElementById('toast-container')) {
      this.container = document.getElementById('toast-container');
      return;
    }

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} [options.type='info'] - Type: 'success', 'error', 'info', 'warning'
   * @param {number} [options.duration=4000] - Display duration in ms (0 = persistent)
   * @param {Function} [options.onClose] - Callback when toast closes
   * @returns {string} Toast ID
   */
  show(options = {}) {
    const {
      message = 'Notification',
      type = 'info',
      duration = 4000,
      onClose = null
    } = options;

    const toastId = `toast-${this.toastCount++}`;
    const toast = this._createToastElement(toastId, message, type);

    // Determine colors based on type
    const colors = {
      success: {
        bg: 'bg-green-500',
        bgDark: 'dark:bg-green-600',
        icon: '✓'
      },
      error: {
        bg: 'bg-red-500',
        bgDark: 'dark:bg-red-600',
        icon: '✕'
      },
      warning: {
        bg: 'bg-yellow-500',
        bgDark: 'dark:bg-yellow-600',
        icon: '⚠'
      },
      info: {
        bg: 'bg-blue-500',
        bgDark: 'dark:bg-blue-600',
        icon: 'ℹ'
      }
    };

    const colorSet = colors[type] || colors.info;

    // Create toast content
    const messageEl = document.createElement('div');
    messageEl.className = `
      ${colorSet.bg} ${colorSet.bgDark}
      text-white px-4 py-3 rounded-lg shadow-lg
      backdrop-filter backdrop-blur-sm bg-opacity-90
      flex items-center gap-3 min-w-max max-w-sm
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    `;
    messageEl.innerHTML = `
      <span class="text-lg flex-shrink-0">${colorSet.icon}</span>
      <span class="flex-1 text-sm font-medium">${this._escapeHtml(message)}</span>
      <button class="ml-2 text-lg leading-none hover:opacity-75 transition-opacity flex-shrink-0">×</button>
    `;

    // Close button functionality
    const closeBtn = messageEl.querySelector('button');
    closeBtn.addEventListener('click', () => this._removeToast(toastId, onClose));

    // Add animation styles if not already present
    if (!document.getElementById('toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
        .toast-exit {
          animation: slideOut 0.3s ease-out forwards;
        }
      `;
      document.head.appendChild(styles);
    }

    this.container.appendChild(messageEl);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this._removeToast(toastId, onClose), duration);
    }

    return toastId;
  }

  /**
   * Create toast element (reserved for future enhancements)
   * @private
   */
  _createToastElement(id, message, type) {
    const el = document.createElement('div');
    el.id = id;
    return el;
  }

  /**
   * Remove a toast
   * @private
   */
  _removeToast(toastId, onClose) {
    const toastElements = this.container.querySelectorAll('div');
    let removed = false;

    toastElements.forEach(el => {
      if (el.id === toastId || toastElements.indexOf(el) === toastElements.length - 1) {
        el.classList.add('toast-exit');
        setTimeout(() => {
          if (el.parentNode) {
            el.remove();
            removed = true;
            if (onClose) onClose();
          }
        }, 300);
      }
    });

    if (!removed && onClose) onClose();
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Convenience methods
   */
  success(message, duration = 4000) {
    return this.show({ message, type: 'success', duration });
  }

  error(message, duration = 4000) {
    return this.show({ message, type: 'error', duration });
  }

  info(message, duration = 4000) {
    return this.show({ message, type: 'info', duration });
  }

  warning(message, duration = 4000) {
    return this.show({ message, type: 'warning', duration });
  }
}

// Global instance
const toastManager = new ToastManager();
