/**
 * News API Integration Module
 * Fetches news from RSS feeds without requiring n8n
 */

class NewsAPIIntegration {
  constructor(options = {}) {
    this.rssFeeds = {
      bbcNews: 'https://feeds.bbci.co.uk/news/rss.xml',
      theVerge: 'https://www.theverge.com/rss/index.xml',
      hackerNews: 'https://hnrss.org/frontpage',
    };
    this.corsProxy = options.corsProxy || 'https://api.allorigins.win/raw?url=';
    this.cache = {};
    this.cacheTimeout = options.cacheTimeout || 3600000; // 1 hour
  }

  /**
   * Fetch and parse RSS feed
   */
  async fetchFeed(feedUrl, feedName) {
    const cacheKey = `${feedName}-${Date.now()}`;

    // Check cache
    if (this.cache[feedName] && this.cache[feedName].expires > Date.now()) {
      return this.cache[feedName].data;
    }

    try {
      const proxyUrl = `${this.corsProxy}${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');

      if (xmlDoc.getElementsByTagName('parsererror').length) {
        throw new Error('XML parsing error');
      }

      const items = xmlDoc.getElementsByTagName('item');
      const articles = Array.from(items)
        .slice(0, 5)
        .map((item) => ({
          title: item.getElementsByTagName('title')[0]?.textContent || 'No title',
          link: item.getElementsByTagName('link')[0]?.textContent || '#',
          description:
            item.getElementsByTagName('description')[0]?.textContent ||
            'No description',
          pubDate: item.getElementsByTagName('pubDate')[0]?.textContent || '',
          source: feedName,
        }));

      // Cache the results
      this.cache[feedName] = {
        data: articles,
        expires: Date.now() + this.cacheTimeout,
      };

      return articles;
    } catch (error) {
      console.error(`Error fetching ${feedName}:`, error);
      return [];
    }
  }

  /**
   * Search for news based on query
   */
  async searchNews(query) {
    try {
      const allFeeds = await Promise.all([
        this.fetchFeed(this.rssFeeds.bbcNews, 'BBC News'),
        this.fetchFeed(this.rssFeeds.theVerge, 'TheVerge'),
        this.fetchFeed(this.rssFeeds.hackerNews, 'Hacker News'),
      ]);

      const allArticles = allFeeds.flat();

      // Filter articles by query relevance
      const queryTerms = query.toLowerCase().split(/\s+/);
      const scored = allArticles.map((article) => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        const score = queryTerms.filter((term) => text.includes(term)).length;
        return { ...article, score };
      });

      const filtered = scored
        .filter((a) => a.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (filtered.length === 0) {
        return allArticles.slice(0, 5);
      }

      return filtered;
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  /**
   * Get sustainability-related news
   */
  async getSustainabilityNews() {
    return this.searchNews(
      'sustainability circular economy environmental waste recycling'
    );
  }

  /**
   * Get tech news
   */
  async getTechNews() {
    return this.searchNews('AI technology innovation artificial intelligence');
  }

  /**
   * Format articles for display
   */
  formatArticles(articles) {
    if (articles.length === 0) {
      return 'No articles found. Try a different search.';
    }

    return articles
      .map(
        (article, idx) =>
          `${idx + 1}. **${article.title}**\n   📌 ${article.source}\n   🔗 [Read more](${article.link})`
      )
      .join('\n\n');
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsAPIIntegration;
}

/**
 * Usage example:
 *
 * const newsAPI = new NewsAPIIntegration();
 * const results = await newsAPI.searchNews('circular economy');
 * const formatted = newsAPI.formatArticles(results);
 */
