/**
 * AI News Agent Component for Loopify
 * Works without n8n - uses RSS feeds directly
 */

class NewsAgentComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.newsAPI = new NewsAPIIntegration();
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="news-agent-container">
        <div class="news-agent-header">
          <h2>📰 Sustainability News Agent</h2>
          <p class="news-agent-subtitle">
            Real-time news from BBC, TheVerge, and Hacker News
          </p>
        </div>

        <div class="news-agent-chat">
          <div class="chat-messages" id="chatMessages">
            <div class="chat-message bot-message">
              <strong>News Agent:</strong>
              <p>
                Hi! 👋 I can search the latest news on sustainability, 
                technology, and circular economy. What would you like to know?
              </p>
            </div>
          </div>

          <div class="chat-input-area">
            <input
              type="text"
              id="newsQuery"
              class="chat-input"
              placeholder="Ask about news, sustainability, tech innovations..."
              autocomplete="off"
            />
            <button id="sendBtn" class="send-button">Send</button>
          </div>

          <div class="quick-actions">
            <button class="quick-action-btn" data-query="sustainability">
              🌱 Sustainability News
            </button>
            <button class="quick-action-btn" data-query="technology">
              💡 Tech Innovations
            </button>
            <button class="quick-action-btn" data-query="circular">
              ♻️ Circular Economy
            </button>
          </div>
        </div>

        <div class="news-agent-footer">
          <small>Powered by Real-time RSS Feeds | BBC, TheVerge, Hacker News</small>
        </div>
      </div>

      <style>
        .news-agent-container {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          margin: 24px auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .news-agent-header {
          margin-bottom: 24px;
          text-align: center;
          border-bottom: 1px solid #333;
          padding-bottom: 16px;
        }

        .news-agent-header h2 {
          color: #6b9e83;
          font-size: 20px;
          margin-bottom: 8px;
        }

        .news-agent-subtitle {
          color: #999;
          font-size: 13px;
        }

        .news-agent-chat {
          margin-bottom: 24px;
        }

        .chat-messages {
          background-color: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          height: 300px;
          overflow-y: auto;
          margin-bottom: 16px;
        }

        .chat-message {
          margin-bottom: 16px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bot-message {
          color: #6b9e83;
        }

        .user-message {
          color: #f5f5f5;
          text-align: right;
        }

        .chat-message strong {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .chat-message a {
          color: #6b9e83;
          text-decoration: none;
        }

        .chat-message a:hover {
          text-decoration: underline;
        }

        .chat-input-area {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .chat-input {
          flex: 1;
          background-color: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px 16px;
          color: #f5f5f5;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .chat-input:focus {
          outline: none;
          border-color: #6b9e83;
          box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.1);
        }

        .send-button {
          background-color: #6b9e83;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .send-button:hover {
          background-color: #5a8e72;
          transform: translateY(-2px);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6b9e83;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .quick-action-btn {
          background-color: #1a1a1a;
          border: 1px solid #333;
          color: #f5f5f5;
          border-radius: 8px;
          padding: 10px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-action-btn:hover {
          border-color: #6b9e83;
          color: #6b9e83;
        }

        .news-agent-footer {
          text-align: center;
          color: #666;
          font-size: 11px;
          border-top: 1px solid #333;
          padding-top: 16px;
        }

        /* Scrollbar styling */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #6b9e83;
        }
      </style>
    `;
  }

  attachEventListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const newsQuery = document.getElementById('newsQuery');
    const quickActions = document.querySelectorAll('.quick-action-btn');

    sendBtn.addEventListener('click', () => this.handleSendMessage());
    newsQuery.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });

    quickActions.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const query = e.target.dataset.query;
        this.handleQuickAction(query);
      });
    });
  }

  async handleSendMessage() {
    const input = document.getElementById('newsQuery');
    const message = input.value.trim();

    if (!message) return;

    this.addUserMessage(message);
    input.value = '';

    await this.sendQuery(message);
  }

  async handleQuickAction(actionType) {
    const queries = {
      sustainability:
        'Show me the latest sustainability and environmental tech news',
      technology: 'What are the trending tech innovations and announcements?',
      circular:
        'Tell me about circular economy, waste management, and recycling technologies',
    };

    const message = queries[actionType] || 'Tell me the latest news';
    this.addUserMessage(message);
    await this.sendQuery(message);
  }

  async sendQuery(message) {
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    try {
      this.addBotMessage(
        '<span class="loading-indicator"></span> Searching news feeds...'
      );

      const articles = await this.newsAPI.searchNews(message);
      const formattedResponse = this.newsAPI.formatArticles(articles);

      this.clearLoadingMessage();
      this.addBotMessage(formattedResponse);
    } catch (error) {
      this.clearLoadingMessage();
      this.addBotMessage(
        `⚠️ Error fetching news: ${error.message}. Please try again.`
      );
      console.error('Error:', error);
    } finally {
      sendBtn.disabled = false;
    }
  }

  addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message user-message';
    messageEl.innerHTML = `<strong>You:</strong><p>${this.escapeHtml(message)}</p>`;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    this.session = this.n8n.addMessageToSession(this.session, 'user', message);
  }

  addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message bot-message';

    // Convert markdown-style formatting to HTML
    const htmlContent = message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br/>');

    messageEl.innerHTML = `<strong>News Agent:</strong><p>${htmlContent}</p>`;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  clearLoadingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const loadingMsg = chatMessages.querySelector('.loading-indicator');
    if (loadingMsg) {
      loadingMsg.closest('.chat-message').remove();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsAgentComponent;
}

/**
 * Usage in your HTML:
 *
 * <div id="newsAgent"></div>
 *
 * <script src="news-api-integration.js"></script>
 * <script src="news-agent-component.js"></script>
 * <script>
 *   const newsAgent = new NewsAgentComponent('newsAgent');
 * </script>
 */
