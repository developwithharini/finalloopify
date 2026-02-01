/**
 * Impact Analytics & Insights Engine
 * Collects and analyzes data from all Loopify modules
 * Generates conclusions and recommendations based on user behavior
 */

class ImpactAnalytics {
  constructor() {
    this.userId = null;
    this.sessionData = {};
    this.insights = [];
    this.metrics = this._initializeMetrics();
    this.webhookIntegration = window.webhookIntegration || null;
  }

  /**
   * Initialize all metrics from different modules
   */
  _initializeMetrics() {
    return {
      // Level 1: WasteLens
      level1: {
        itemsClassified: 0,
        foodItemsDetected: 0,
        itemsByCategory: {},
        confidenceScores: [],
      },

      // Level 2: ShelfLife AI
      level2: {
        foodItemsTracked: 0,
        expiringItems: 0,
        foodSaved: 0,
        foodWasted: 0,
        categoryBreakdown: {},
      },

      // Level 3: Reuse Loop
      level3: {
        itemsMatched: 0,
        itemsReused: 0,
        materialTypes: {},
        matchSuccessRate: 0,
      },

      // Level 4: Material Bank
      level4: {
        materialsRecorded: 0,
        inventoryValue: 0,
        activeListings: 0,
        viewsPerListing: 0,
      },

      // Level 5: Return Box
      level5: {
        returnsProcessed: 0,
        packagingRecycled: 0,
        refundsIssued: 0,
        customerSatisfaction: 0,
      },

      // EcoPoints & Collections
      ecoPoints: {
        totalPoints: 0,
        pointsByActivity: {},
        redeemed: 0,
      },

      // Collections & Hubs
      collections: {
        itemsDropped: 0,
        hubsVisited: 0,
        frequencyPerHub: {},
      },

      // Environment Impact
      environmental: {
        wasteDiverteKg: 0,
        co2Prevented: 0,
        resourcesSaved: 0,
        landfillSpaceSaved: 0,
      },

      // User engagement
      engagement: {
        lastActive: null,
        sessionCount: 0,
        totalTimeSpent: 0,
        activeModules: [],
      },
    };
  }

  /**
   * Set current user
   */
  setUser(userId) {
    this.userId = userId;
  }

  /**
   * Update metrics from Level 1 (WasteLens)
   */
  updateLevel1Data(data) {
    this.metrics.level1 = {
      ...this.metrics.level1,
      itemsClassified: (this.metrics.level1.itemsClassified || 0) + (data.count || 0),
      foodItemsDetected: (this.metrics.level1.foodItemsDetected || 0) + (data.foodItems || 0),
      itemsByCategory: { ...this.metrics.level1.itemsByCategory, ...data.categories },
      confidenceScores: [...this.metrics.level1.confidenceScores, ...(data.scores || [])],
    };
    this.metrics.engagement.activeModules = [...new Set([...this.metrics.engagement.activeModules, 'level1'])];
    this._generateLevel1Insights();
  }

  /**
   * Update metrics from Level 2 (ShelfLife AI)
   */
  updateLevel2Data(data) {
    this.metrics.level2 = {
      ...this.metrics.level2,
      foodItemsTracked: (this.metrics.level2.foodItemsTracked || 0) + (data.count || 0),
      expiringItems: data.expiringCount || 0,
      foodSaved: (this.metrics.level2.foodSaved || 0) + (data.saved || 0),
      foodWasted: (this.metrics.level2.foodWasted || 0) + (data.wasted || 0),
      categoryBreakdown: { ...this.metrics.level2.categoryBreakdown, ...data.categories },
    };
    this.metrics.engagement.activeModules = [...new Set([...this.metrics.engagement.activeModules, 'level2'])];
    this._generateLevel2Insights();
  }

  /**
   * Update metrics from Level 3 (Reuse Loop)
   */
  updateLevel3Data(data) {
    this.metrics.level3 = {
      ...this.metrics.level3,
      itemsMatched: (this.metrics.level3.itemsMatched || 0) + (data.matched || 0),
      itemsReused: (this.metrics.level3.itemsReused || 0) + (data.reused || 0),
      materialTypes: { ...this.metrics.level3.materialTypes, ...data.materials },
      matchSuccessRate: data.successRate || 0,
    };
    this.metrics.engagement.activeModules = [...new Set([...this.metrics.engagement.activeModules, 'level3'])];
    this._generateLevel3Insights();
  }

  /**
   * Update metrics from Level 4 (Material Bank)
   */
  updateLevel4Data(data) {
    this.metrics.level4 = {
      ...this.metrics.level4,
      materialsRecorded: (this.metrics.level4.materialsRecorded || 0) + (data.count || 0),
      inventoryValue: (this.metrics.level4.inventoryValue || 0) + (data.value || 0),
      activeListings: data.listings || 0,
      viewsPerListing: data.viewsPerListing || 0,
    };
    this.metrics.engagement.activeModules = [...new Set([...this.metrics.engagement.activeModules, 'level4'])];
    this._generateLevel4Insights();
  }

  /**
   * Update metrics from Level 5 (Return Box)
   */
  updateLevel5Data(data) {
    this.metrics.level5 = {
      ...this.metrics.level5,
      returnsProcessed: (this.metrics.level5.returnsProcessed || 0) + (data.count || 0),
      packagingRecycled: (this.metrics.level5.packagingRecycled || 0) + (data.recycled || 0),
      refundsIssued: (this.metrics.level5.refundsIssued || 0) + (data.refunds || 0),
      customerSatisfaction: data.satisfaction || 0,
    };
    this.metrics.engagement.activeModules = [...new Set([...this.metrics.engagement.activeModules, 'level5'])];
    this._generateLevel5Insights();
  }

  /**
   * Update environmental impact metrics
   */
  updateEnvironmentalImpact(data) {
    this.metrics.environmental = {
      ...this.metrics.environmental,
      wasteDiverteKg: (this.metrics.environmental.wasteDiverteKg || 0) + (data.wasteDiverted || 0),
      co2Prevented: (this.metrics.environmental.co2Prevented || 0) + (data.co2 || 0),
      resourcesSaved: (this.metrics.environmental.resourcesSaved || 0) + (data.resources || 0),
      landfillSpaceSaved: (this.metrics.environmental.landfillSpaceSaved || 0) + (data.space || 0),
    };
  }

  /**
   * Update eco points
   */
  updateEcoPoints(points, activity) {
    this.metrics.ecoPoints.totalPoints = (this.metrics.ecoPoints.totalPoints || 0) + points;
    this.metrics.ecoPoints.pointsByActivity[activity] = (this.metrics.ecoPoints.pointsByActivity[activity] || 0) + points;
  }

  /**
   * Generate insights from Level 1 data
   */
  _generateLevel1Insights() {
    const { itemsClassified, foodItemsDetected, itemsByCategory } = this.metrics.level1;
    
    if (itemsClassified > 0) {
      const foodPercentage = (foodItemsDetected / itemsClassified * 100).toFixed(1);
      
      this.insights.push({
        id: `level1-${Date.now()}`,
        module: 'WasteLens',
        type: 'behavior',
        title: 'Your Classification Pattern',
        message: `You've classified ${itemsClassified} items. ${foodPercentage}% are food items - showing strong engagement with food tracking!`,
        impact: 'high',
        timestamp: new Date().toISOString(),
      });

      if (foodPercentage > 70) {
        this.insights.push({
          id: `level1-focus-${Date.now()}`,
          module: 'WasteLens',
          type: 'recommendation',
          title: '💡 Try Level 2: ShelfLife AI',
          message: 'You focus heavily on food. Use ShelfLife AI to track expiry dates and prevent food waste before it happens!',
          impact: 'high',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Generate insights from Level 2 data
   */
  _generateLevel2Insights() {
    const { foodItemsTracked, foodSaved, foodWasted } = this.metrics.level2;
    
    if (foodSaved > 0) {
      const savingRate = (foodSaved / (foodSaved + foodWasted) * 100).toFixed(1);
      
      this.insights.push({
        id: `level2-impact-${Date.now()}`,
        module: 'ShelfLife AI',
        type: 'impact',
        title: 'Your Food Waste Prevention',
        message: `Amazing! You've saved ${foodSaved} food items (${savingRate}% save rate). That's ${foodSaved * 0.5} kg CO₂ equivalent prevented!`,
        impact: 'critical',
        timestamp: new Date().toISOString(),
      });

      if (foodSaved > 10) {
        this.insights.push({
          id: `level2-earn-${Date.now()}`,
          module: 'ShelfLife AI',
          type: 'opportunity',
          title: '🎯 Earn More EcoPoints',
          message: `You're a food waste prevention champion! Share your tips with others using the Referral System to earn bonus points.`,
          impact: 'medium',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Generate insights from Level 3 data
   */
  _generateLevel3Insights() {
    const { itemsMatched, itemsReused, matchSuccessRate } = this.metrics.level3;
    
    if (itemsReused > 0) {
      this.insights.push({
        id: `level3-circular-${Date.now()}`,
        module: 'Reuse Loop',
        type: 'impact',
        title: 'Circular Economy Champion',
        message: `You've enabled ${itemsReused} items to be reused instead of discarded. That's true circular economy in action!`,
        impact: 'critical',
        timestamp: new Date().toISOString(),
      });

      if (matchSuccessRate > 0.7) {
        this.insights.push({
          id: `level3-success-${Date.now()}`,
          module: 'Reuse Loop',
          type: 'milestone',
          title: '⭐ Expert Matcher',
          message: `${(matchSuccessRate * 100).toFixed(0)}% of your matches are successful. You're connecting items with the right recipients!`,
          impact: 'high',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Generate insights from Level 4 data
   */
  _generateLevel4Insights() {
    const { materialsRecorded, inventoryValue, activeListings } = this.metrics.level4;
    
    if (activeListings > 0) {
      const avgValue = (inventoryValue / materialsRecorded).toFixed(2);
      
      this.insights.push({
        id: `level4-inventory-${Date.now()}`,
        module: 'Material Bank',
        type: 'opportunity',
        title: 'Your Material Inventory',
        message: `You have ${activeListings} active listings with ${materialsRecorded} materials. Average value per item: ₹${avgValue}. Growing material economy!`,
        impact: 'medium',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Generate insights from Level 5 data
   */
  _generateLevel5Insights() {
    const { returnsProcessed, packagingRecycled } = this.metrics.level5;
    
    if (returnsProcessed > 0) {
      this.insights.push({
        id: `level5-returns-${Date.now()}`,
        module: 'Return Box',
        type: 'impact',
        title: 'Responsible Returns',
        message: `You've processed ${returnsProcessed} returns and recycled ${packagingRecycled} kg of packaging. Every return handled sustainably!`,
        impact: 'medium',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Generate cross-module insights
   */
  generateCrossPlatformInsights() {
    const insights = [];
    const modules = this.metrics.engagement.activeModules;

    // Engagement pattern
    if (modules.length >= 3) {
      insights.push({
        id: `cross-engagement-${Date.now()}`,
        module: 'Platform',
        type: 'achievement',
        title: '🚀 Multi-Module Master',
        message: `You're actively using ${modules.length} different Loopify modules! You understand the full circular economy loop.`,
        impact: 'high',
        timestamp: new Date().toISOString(),
      });
    }

    // Impact multiplier
    const totalImpact = (this.metrics.level2.foodSaved || 0) + (this.metrics.level3.itemsReused || 0) + (this.metrics.level5.returnsProcessed || 0);
    if (totalImpact > 20) {
      insights.push({
        id: `cross-impact-${Date.now()}`,
        module: 'Platform',
        type: 'milestone',
        title: '🌍 Real-World Change Maker',
        message: `Your combined actions across all modules have prevented over ${totalImpact} items from entering landfills. You're making quantifiable impact!`,
        impact: 'critical',
        timestamp: new Date().toISOString(),
      });
    }

    // Recommendation for missing modules
    const allModules = ['level1', 'level2', 'level3', 'level4', 'level5'];
    const unusedModules = allModules.filter(m => !modules.includes(m));
    
    if (unusedModules.length > 0) {
      const moduleNames = {
        level1: 'WasteLens',
        level2: 'ShelfLife AI',
        level3: 'Reuse Loop',
        level4: 'Material Bank',
        level5: 'Return Box',
      };
      
      insights.push({
        id: `cross-recommendation-${Date.now()}`,
        module: 'Platform',
        type: 'recommendation',
        title: '🎯 Maximize Your Impact',
        message: `Try ${moduleNames[unusedModules[0]]} to expand your sustainability journey. Unlock new ways to make environmental impact!`,
        impact: 'medium',
        timestamp: new Date().toISOString(),
      });
    }

    return insights;
  }

  /**
   * Get all insights
   */
  getAllInsights(limit = null) {
    const allInsights = [
      ...this.insights,
      ...this.generateCrossPlatformInsights(),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return limit ? allInsights.slice(0, limit) : allInsights;
  }

  /**
   * Get insights by type
   */
  getInsightsByType(type) {
    return this.insights.filter(i => i.type === type);
  }

  /**
   * Get insights by impact level
   */
  getInsightsByImpact(impact) {
    return this.insights.filter(i => i.impact === impact);
  }

  /**
   * Get summary dashboard data
   */
  getDashboardSummary() {
    return {
      user: this.userId,
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      insights: this.getAllInsights(5),
      recommendations: this.getInsightsByType('recommendation'),
      achievements: this.getInsightsByType('achievement'),
      totalImpact: {
        itemsClassified: this.metrics.level1.itemsClassified || 0,
        foodSaved: this.metrics.level2.foodSaved || 0,
        itemsReused: this.metrics.level3.itemsReused || 0,
        ecoPoints: this.metrics.ecoPoints.totalPoints || 0,
        co2Prevented: this.metrics.environmental.co2Prevented || 0,
      },
    };
  }

  /**
   * Send all insights to webhook
   */
  async sendInsightsToWebhook() {
    if (!this.webhookIntegration || !this.webhookIntegration.webhookUrl) {
      console.warn('⚠️  Webhook not configured');
      return null;
    }

    try {
      const summary = this.getDashboardSummary();
      await this.webhookIntegration.sendInsights(summary);
      console.log('✓ Insights sent to webhook');
      return summary;
    } catch (error) {
      console.error('❌ Error sending insights:', error);
      throw error;
    }
  }

  /**
   * Reset analytics for new session
   */
  reset() {
    this.metrics = this._initializeMetrics();
    this.insights = [];
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.impactAnalytics = new ImpactAnalytics();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImpactAnalytics;
}
