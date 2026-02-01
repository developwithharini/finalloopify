/**
 * Webhook Integration Module
 * Handles communication with custom webhooks for workflow automation
 * Replaces N8N with flexible webhook support
 */

class WebhookIntegration {
  constructor(options = {}) {
    this.webhookUrl = options.webhookUrl || null;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.apiKey = options.apiKey || null;
    this.headers = options.headers || {};
    this.eventLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * Set webhook URL dynamically
   */
  setWebhookUrl(url, apiKey = null) {
    this.webhookUrl = url;
    if (apiKey) this.apiKey = apiKey;
    console.log('✓ Webhook URL configured:', url);
  }

  /**
   * Send impact data to webhook
   */
  async sendImpactData(data) {
    if (!this.webhookUrl) {
      console.warn('⚠️  No webhook URL configured');
      return null;
    }

    try {
      const payload = {
        eventType: 'impact_data',
        timestamp: new Date().toISOString(),
        data: data,
      };

      return await this._sendWithRetry(payload);
    } catch (error) {
      console.error('❌ Error sending impact data:', error);
      this._logEvent('error', 'impact_data', error.message);
      throw error;
    }
  }

  /**
   * Send user activity to webhook
   */
  async sendUserActivity(userId, activityType, activityData) {
    if (!this.webhookUrl) {
      console.warn('⚠️  No webhook URL configured');
      return null;
    }

    try {
      const payload = {
        eventType: 'user_activity',
        userId: userId,
        activityType: activityType,
        timestamp: new Date().toISOString(),
        data: activityData,
      };

      return await this._sendWithRetry(payload);
    } catch (error) {
      console.error('❌ Error sending user activity:', error);
      this._logEvent('error', 'user_activity', error.message);
      throw error;
    }
  }

  /**
   * Send batch of events to webhook
   */
  async sendBatchEvents(events) {
    if (!this.webhookUrl) {
      console.warn('⚠️  No webhook URL configured');
      return null;
    }

    try {
      const payload = {
        eventType: 'batch_events',
        timestamp: new Date().toISOString(),
        events: events,
        batchSize: events.length,
      };

      return await this._sendWithRetry(payload);
    } catch (error) {
      console.error('❌ Error sending batch events:', error);
      this._logEvent('error', 'batch_events', error.message);
      throw error;
    }
  }

  /**
   * Send aggregated insights to webhook
   */
  async sendInsights(insights) {
    if (!this.webhookUrl) {
      console.warn('⚠️  No webhook URL configured');
      return null;
    }

    try {
      const payload = {
        eventType: 'insights',
        timestamp: new Date().toISOString(),
        insights: insights,
      };

      return await this._sendWithRetry(payload);
    } catch (error) {
      console.error('❌ Error sending insights:', error);
      this._logEvent('error', 'insights', error.message);
      throw error;
    }
  }

  /**
   * Internal method to send request with retry logic
   */
  async _sendWithRetry(payload, attempt = 0) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...this.headers,
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this._logEvent('success', payload.eventType, `Response received`);
      return result;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt);
        console.log(`⏱️  Retrying in ${delay}ms... (attempt ${attempt + 1}/${this.retryAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this._sendWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Log events internally
   */
  _logEvent(status, eventType, message) {
    const event = {
      timestamp: new Date().toISOString(),
      status,
      eventType,
      message,
    };
    
    this.eventLog.push(event);
    
    // Keep log size manageable
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }
  }

  /**
   * Get event log
   */
  getEventLog(limit = 50) {
    return this.eventLog.slice(-limit);
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Get webhook status
   */
  getStatus() {
    return {
      configured: !!this.webhookUrl,
      webhookUrl: this.webhookUrl ? this.webhookUrl.substring(0, 50) + '...' : 'Not configured',
      hasApiKey: !!this.apiKey,
      eventLogSize: this.eventLog.length,
      lastEvent: this.eventLog.length > 0 ? this.eventLog[this.eventLog.length - 1] : null,
    };
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebhookIntegration;
}

// Create global instance
if (typeof window !== 'undefined') {
  window.webhookIntegration = new WebhookIntegration();
}
