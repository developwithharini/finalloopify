/**
 * n8n Integration Module
 * Handles communication between Loopify and n8n workflows
 */

class N8nIntegration {
  constructor(webhookUrl, options = {}) {
    this.webhookUrl = webhookUrl;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Send a chat message to the news agent workflow
   * @param {string} message - User message
   * @param {string} sessionId - Unique session identifier for conversation memory
   * @returns {Promise<string>} - Agent response
   */
  async sendNewsQuery(message, sessionId) {
    try {
      const payload = {
        message,
        sessionId,
        timestamp: new Date().toISOString(),
      };

      const response = await this._sendWithRetry(payload);
      return response.message || response.text || 'No response received';
    } catch (error) {
      console.error('Error sending news query:', error);
      throw new Error(`Failed to query news agent: ${error.message}`);
    }
  }

  /**
   * Internal method to send request with retry logic
   */
  async _sendWithRetry(payload, attempt = 0) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
        );
        return this._sendWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Query sustainability-related news
   */
  async querySustainabilityNews(sessionId) {
    const query =
      'Show me the latest sustainability, circular economy, and environmental tech news';
    return this.sendNewsQuery(query, sessionId);
  }

  /**
   * Query tech news relevant to Loopify features
   */
  async queryTechNews(sessionId) {
    const query =
      'What are the latest developments in AI, waste management technology, and food preservation tech?';
    return this.sendNewsQuery(query, sessionId);
  }

  /**
   * Create a persistent conversation session
   */
  createSession(userId) {
    return {
      sessionId: `${userId}-${Date.now()}`,
      createdAt: new Date(),
      messages: [],
    };
  }

  /**
   * Add message to session history
   */
  addMessageToSession(session, role, content) {
    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    return session;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = N8nIntegration;
}

/**
 * Helper function to initialize n8n integration
 * Usage in your app:
 *
 * const n8n = new N8nIntegration('https://your-n8n-instance.com/webhook/...');
 * const session = n8n.createSession('user123');
 * const response = await n8n.sendNewsQuery('Tell me about circular economy', session.sessionId);
 */
