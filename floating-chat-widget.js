/**
 * Loopify Floating Chat Widget
 * Easy-to-access chatbot for entire platform
 */

// Test if script is loading
console.log('Floating chat widget script loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking if we should initialize widget');
  if (window.self === window.top) {
    console.log('On main page, will initialize widget');
  } else {
    console.log('In iframe, skipping widget');
  }
});

class FloatingChatWidget {
  constructor(options = {}) {
    this.chatbot = new EcoLoopChatbot();
    this.isOpen = false;
    this.position = options.position || 'bottom-right';
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
  }

  createWidget() {
    // Create widget container
    const widgetHTML = `
      <!-- Chat Widget Toggle Button -->
      <div id="chatWidgetToggle" class="chat-widget-toggle">
        <svg class="chat-toggle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Chat Widget Container -->
      <div id="chatWidget" class="chat-widget">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-content">
            <h3>♻️ Eco Loop Assistant</h3>
            <p>Ask me about our platform and sustainability</p>
          </div>
          <button id="chatClose" class="chat-close-btn">✕</button>
        </div>

        <!-- Messages Area -->
        <div class="chat-messages" id="chatMessages">
          <div class="chat-message bot-message">
            <div class="message-avatar">💬</div>
            <div class="message-content">
              <p>Hi! 👋 I'm your Eco Loop assistant. Ask me about our 5 levels, how to use them, our ethical approach, or anything about waste prevention and sustainability! ♻️</p>
            </div>
          </div>

          <div class="suggested-questions" id="suggestedQuestions">
            <p class="suggested-label">Quick questions:</p>
            <div class="questions-grid"></div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <input
            type="text"
            id="chatInput"
            class="chat-input"
            placeholder="Ask a question..."
            autocomplete="off"
          />
          <button id="chatSendBtn" class="chat-send-btn">Send</button>
        </div>
      </div>

      <style>
        /* Widget Container */
        #chatWidget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 380px;
          height: 600px;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          display: none;
          flex-direction: column;
          z-index: 10002;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        #chatWidget.open {
          display: flex;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Toggle Button */
        #chatWidgetToggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          background: #fff;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 255, 0, 0.25);
          transition: all 0.3s ease;
          z-index: 10001;
        }

        #chatWidgetToggle:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 16px rgba(0, 255, 0, 0.35);
        }

        #chatWidgetToggle.hidden {
          display: none;
        }

        .chat-toggle-icon {
          width: 24px;
          height: 24px;
          color: #6b9e83;
          flex-shrink: 0;
        }

        /* Header */
        .chat-header {
          background: linear-gradient(135deg, #6b9e83 0%, #5a8e72 100%);
          color: #fff;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-header-content h3 {
          font-size: 16px;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .chat-header-content p {
          font-size: 12px;
          opacity: 0.9;
        }

        .chat-close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .chat-close-btn:hover {
          transform: rotate(90deg);
        }

        /* Messages Area */
        #chatMessages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-message {
          display: flex;
          gap: 10px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-avatar {
          font-size: 20px;
          flex-shrink: 0;
        }

        .message-content {
          flex: 1;
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 12px;
          border-left: 3px solid #6b9e83;
        }

        .bot-message .message-content {
          background-color: #000000;
          border-left-color: #6b9e83;
        }

        .user-message .message-content {
          background-color: #1a3a2a;
          border-left-color: #8bb8a0;
          margin-left: auto;
          max-width: 85%;
        }

        .message-content p {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          color: #f5f5f5;
        }

        .message-content strong {
          color: #6b9e83;
          font-weight: 600;
        }

        .message-content a {
          color: #6b9e83;
          text-decoration: none;
        }

        .message-content a:hover {
          text-decoration: underline;
        }

        /* Suggested Questions */
        .suggested-questions {
          margin-top: 8px;
        }

        .suggested-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .questions-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .suggested-question-btn {
          background-color: #2a2a2a;
          border: 1px solid #333;
          color: #f5f5f5;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .suggested-question-btn:hover {
          border-color: #6b9e83;
          background-color: #000000;
          color: #6b9e83;
        }

        /* Input Area */
        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #333;
          background-color: #0d0d0d;
        }

        #chatInput {
          flex: 1;
          background-color: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 10px 12px;
          color: #f5f5f5;
          font-size: 13px;
          transition: border-color 0.3s ease;
        }

        #chatInput:focus {
          outline: none;
          border-color: #6b9e83;
          box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.1);
        }

        .chat-send-btn {
          background-color: #6b9e83;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 10px 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
        }

        .chat-send-btn:hover {
          background-color: #5a8e72;
          transform: translateY(-2px);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading State */
        .loading-dots {
          display: inline-flex;
          gap: 3px;
        }

        .loading-dots span {
          width: 4px;
          height: 4px;
          background-color: #6b9e83;
          border-radius: 50%;
          animation: blink 1.4s infinite;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        /* Scrollbar */
        #chatMessages::-webkit-scrollbar {
          width: 6px;
        }

        #chatMessages::-webkit-scrollbar-track {
          background: transparent;
        }

        #chatMessages::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }

        #chatMessages::-webkit-scrollbar-thumb:hover {
          background: #6b9e83;
        }

        /* Responsive */
        @media (max-width: 768px) {
          #chatWidget {
            width: calc(100vw - 40px);
            height: 70vh;
            bottom: 80px;
            right: 20px;
          }

          .questions-grid {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .suggested-question-btn {
            flex: 1;
            min-width: 100px;
          }
        }
      </style>
    `;

    // Insert into page
    const div = document.createElement('div');
    div.innerHTML = widgetHTML;
    document.body.appendChild(div);

    // Load suggested questions
    this.loadSuggestedQuestions();
  }

  loadSuggestedQuestions() {
    const grid = document.querySelector('.questions-grid');
    const questions = this.chatbot.getSuggestedQuestions();

    grid.innerHTML = questions
      .map(
        (q) =>
          `<button class="suggested-question-btn" data-question="${q}">${q}</button>`
      )
      .join('');

    // Attach click listeners
    grid.querySelectorAll('.suggested-question-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        document.getElementById('chatInput').value = question;
        this.sendMessage();
      });
    });
  }

  attachEventListeners() {
    const toggle = document.getElementById('chatWidgetToggle');
    const closeBtn = document.getElementById('chatClose');
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');

    toggle.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.closeChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    const widget = document.getElementById('chatWidget');
    const toggle = document.getElementById('chatWidgetToggle');

    if (this.isOpen) {
      this.closeChat();
    } else {
      widget.classList.add('open');
      toggle.classList.add('hidden');
      this.isOpen = true;
      document.getElementById('chatInput').focus();
    }
  }

  closeChat() {
    const widget = document.getElementById('chatWidget');
    const toggle = document.getElementById('chatWidgetToggle');

    widget.classList.remove('open');
    toggle.classList.remove('hidden');
    this.isOpen = false;
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const messagesDiv = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('chatSendBtn');
    const message = input.value.trim();

    if (!message) return;

    // Disable input
    input.value = '';
    sendBtn.disabled = true;

    // Add user message
    this.addMessage(message, 'user');

    // Get bot response
    const response = await this.chatbot.processQuery(message);

    // Add bot message
    this.addMessage(response, 'bot');

    // Re-enable input
    sendBtn.disabled = false;
    input.focus();
  }

  addMessage(content, role) {
    const messagesDiv = document.getElementById('chatMessages');
    const suggestedDiv = messagesDiv.querySelector('.suggested-questions');

    // Remove suggested questions on first user message
    if (role === 'user' && suggestedDiv) {
      suggestedDiv.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}-message`;

    const avatar = role === 'bot' ? '💬' : '👤';

    // Format content (handle markdown)
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br/>');

    messageEl.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <p>${formattedContent}</p>
      </div>
    `;

    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not in an iframe
    if (window.self === window.top) {
      console.log('Initializing chat widget on main page');
      window.loopifyChatWidget = new FloatingChatWidget();
    } else {
      console.log('Skipping chat widget initialization in iframe');
    }
  });
} else {
  // Only initialize if not in an iframe
  if (window.self === window.top) {
    console.log('Initializing chat widget on main page');
    window.loopifyChatWidget = new FloatingChatWidget();
  } else {
    console.log('Skipping chat widget initialization in iframe');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingChatWidget;
}
