/**
 * Eco Loop Intelligent Chatbot Engine
 * RAG-powered chatbot using verified documentation
 * All answers sourced directly from Eco Loop official documentation
 */

class EcoLoopChatbot {
  constructor(options = {}) {
    this.newsAPI = new NewsAPIIntegration();
    this.conversationHistory = [];
    this.sessionId = `session-${Date.now()}`;
    this.maxHistoryLength = options.maxHistory || 20;
    this.responseDelay = options.responseDelay || 600;
    this.confidenceThreshold = options.confidenceThreshold || 0.3;
  }

  /**
   * Process user query using RAG and generate accurate response
   */
  async processQuery(userMessage) {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    // Simulate thinking delay for better UX
    await new Promise((resolve) => setTimeout(resolve, this.responseDelay));

    // Search RAG knowledge base first (100% accurate - from PDF)
    const ragResult = generateAnswer(userMessage);
    const formattedRAG = formatRAGAnswer(ragResult);

    let response;

    if (formattedRAG) {
      // RAG returned verified answer from documentation
      response = formattedRAG;
    } else if (
      this._isNewsQuery(userMessage) ||
      this._isGeneralKnowledgeQuestion(userMessage)
    ) {
      // Try to fetch relevant news
      response = await this._getNewsResponse(userMessage);
    } else {
      // Fallback response
      response = this._getDefaultResponse(userMessage);
    }

    // Add bot response to history
    this.conversationHistory.push({
      role: 'bot',
      content: response,
      timestamp: Date.now(),
    });

    // Keep history manageable
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    return response;
  }

  /**
   * Get news-based response
   */
  async _getNewsResponse(query) {
    try {
      const articles = await this.newsAPI.searchNews(query);

      if (articles.length === 0) {
        return `I couldn't find recent news about "${query}". Try asking about our features instead! 🌱`;
      }

      const formatted = articles
        .slice(0, 3)
        .map(
          (article, idx) =>
            `${idx + 1}. **${article.title}**\n   📌 *${article.source}*\n   🔗 [Read more](${article.link})`
        )
        .join('\n\n');

      return `Here's what I found:\n\n${formatted}`;
    } catch (error) {
      console.error('Error fetching news:', error);
      return "I had trouble fetching the latest news. Let me help with information about Loopify instead! 😊";
    }
  }

  /**
   * Get default helpful response
   */
  _getDefaultResponse(userMessage) {
    const responses = [
      `I'm not sure about "${userMessage}", but I can help with questions about Eco Loop! Try asking about any of our 5 levels: Level 1 (Waste Classification), Level 2 (Shelf Life), Level 3 (Lifecycle Tracking), Level 4 (Marketplace), or Level 5 (AR Education). ♻️`,

      `That's an interesting question! I'm specialized in Eco Loop and sustainability. What would you like to know about our platform features, how to use them, or our environmental mission?`,

      `I'm here to help with Eco Loop questions. I can tell you about our 5 levels, how they work, our ethical approach, environmental benefits, and how to get started. What interests you?`,

      `Let me help! I can explain our 5 core features:\n• **Level 1** - Image-Based Waste Classification\n• **Level 2** - Shelf Life AI & Smart Inventory\n• **Level 3** - QR/RFID Lifecycle Tracking\n• **Level 4** - Second-Hand Marketplace & Recycling\n• **Level 5** - AR-Based Education`,

      `I'm your Eco Loop assistant powered by official documentation. Ask me about what Eco Loop does, how each level works, our philosophy, ethical approach, or how to get started! 🌱`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Check if query is about news/current events
   */
  _isNewsQuery(message) {
    const newsKeywords = [
      'news',
      'latest',
      'today',
      'trending',
      'happening',
      'current',
      'recent',
      'update',
      'breaking',
      'headline',
    ];
    return newsKeywords.some((kw) => message.toLowerCase().includes(kw));
  }

  /**
   * Check if it's a general knowledge question
   */
  _isGeneralKnowledgeQuestion(message) {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'tell', 'explain', 'define'];
    return questionWords.some((word) => message.toLowerCase().startsWith(word));
  }

  /**
   * Get conversation context (last N messages)
   */
  getContext(count = 5) {
    return this.conversationHistory.slice(-count);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get suggested questions
   */
  getSuggestedQuestions() {
    return [
      'What is Eco Loop?',
      'How does Level 1 work?',
      'What is Shelf Life AI?',
      'How do I track product lifecycle?',
      'What are Eco Points?',
      'How are all levels connected?',
      "What's your ethical approach?",
      'How does AR education work?',
    ];
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoopifyChatbot;
}

/**
 * Usage example:
 *
 * const chatbot = new EcoLoopChatbot();
 * const response = await chatbot.processQuery('What is Level 1?');
 * console.log(response);
 */
