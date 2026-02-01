/**
 * Eco Loop RAG Knowledge Base
 * Extracted and structured from official Eco Loop documentation
 * 100% accurate - sourced directly from provided content
 */

const ECO_LOOP_RAG_KNOWLEDGE = {
  // Document chunks for semantic search
  chunks: [
    // Section 1: Ethical Framework
    {
      id: 'ethics-ai',
      title: 'Ethical Use of Artificial Intelligence',
      content:
        'All AI systems in Eco Loop are designed to assist human decision-making rather than replace it. Image classification, shelf-life predictions, and demand forecasting are transparent and explainable. Users are informed when AI is used, how predictions are made, and are always allowed to override automated decisions.',
      keywords: ['ethics', 'ai', 'transparent', 'decision-making', 'override'],
      category: 'ethical-framework',
    },
    {
      id: 'ethics-privacy',
      title: 'Data Privacy & User Ownership',
      content:
        'Eco Loop follows strict data-minimization principles. Images, inventory data, and usage logs belong to the user. Enterprise data is isolated per organization, encrypted, and never sold to third parties. Users can delete their data at any time, ensuring ethical digital autonomy.',
      keywords: ['privacy', 'data', 'ownership', 'encryption', 'security', 'delete'],
      category: 'ethical-framework',
    },
    {
      id: 'ethics-incentive',
      title: 'Fair Incentive & Reward Ethics',
      content:
        'The Eco Points system is designed to reward real environmental impact rather than excessive consumption. Point values are linked to verified recycling outcomes and material recovery rates to prevent exploitation or artificial waste generation for profit.',
      keywords: ['eco-points', 'rewards', 'incentives', 'environmental-impact', 'fair'],
      category: 'ethical-framework',
    },
    {
      id: 'ethics-inclusion',
      title: 'Environmental Justice & Inclusion',
      content:
        'Eco Loop ensures inclusivity by offering a free tier accessible via smartphones. The platform partners with local recyclers and waste workers, supporting livelihoods and preventing displacement due to automation.',
      keywords: ['inclusion', 'accessibility', 'free', 'recyclers', 'justice'],
      category: 'ethical-framework',
    },

    // Section 2: Platform Overview
    {
      id: 'overview-what',
      title: 'What is Eco Loop?',
      content:
        'Eco Loop is a waste-prevention and sustainability platform that helps individuals and enterprises reduce waste before it is created. It combines AI, machine learning, IoT, AR, and ethical incentives to guide users toward responsible consumption, reuse, and recycling.',
      keywords: ['eco-loop', 'platform', 'waste-prevention', 'sustainability', 'ai'],
      category: 'overview',
    },
    {
      id: 'overview-prevention',
      title: 'Prevention vs Disposal Focus',
      content:
        'Disposal-focused systems address waste only after environmental damage has already occurred. Eco Loop prioritizes prevention by helping users buy less, use items fully, extend product life, and divert materials into circular reuse systems.',
      keywords: ['prevention', 'disposal', 'circular', 'reuse', 'philosophy'],
      category: 'overview',
    },

    // Section 3: Level 1
    {
      id: 'level1-what',
      title: 'Level 1: Image-Based Waste Classification - Purpose',
      content:
        'Level 1 helps users identify and dispose of waste correctly. Users open the Eco Loop app, select scan mode, and capture an image of the item. The app responds instantly with waste type, disposal instructions, and sustainability tips.',
      keywords: ['level-1', 'image', 'waste', 'classification', 'scan', 'ai'],
      category: 'level-1',
    },
    {
      id: 'level1-how',
      title: 'Level 1: How to Use Image-Based Waste Classification',
      content:
        'Step 1: Open the Eco Loop app. Step 2: Tap "Scan Waste". Step 3: Point your phone camera at the item (food waste, plastic, metal, etc.). Step 4: Capture the image. Step 5: Wait 1–2 seconds for AI analysis. Step 6: View results showing waste type (organic, plastic, metal, e-waste, etc.), confidence score, and correct disposal method. Step 7: Follow the suggested action: compost, dry waste bin, recycling, or hazardous disposal.',
      keywords: ['level-1', 'how-to', 'steps', 'scan', 'camera', 'disposal'],
      category: 'level-1',
    },
    {
      id: 'level1-benefits',
      title: 'Level 1: Benefits and What Users Get',
      content:
        'Users get clear disposal instruction, reduced confusion, and awareness points (optional). The system reduces waste segregation confusion and helps build correct waste management habits.',
      keywords: ['level-1', 'benefits', 'disposal', 'points', 'awareness'],
      category: 'level-1',
    },

    // Section 4: Level 2
    {
      id: 'level2-purpose',
      title: 'Level 2: Shelf Life AI & Smart Inventory - Purpose',
      content:
        'Level 2 solves over-purchasing and expiry-based waste. It tracks inventory, predicts demand, and alerts users before items expire so they can consume, donate, or redistribute them.',
      keywords: ['level-2', 'shelf-life', 'inventory', 'expiry', 'waste-prevention'],
      category: 'level-2',
    },
    {
      id: 'level2-how',
      title: 'Level 2: How to Use Shelf Life AI',
      content:
        'Step 1: Go to Inventory/Shelf Life section. Step 2: Add items by manual entry or barcode scan. Step 3: Enter or confirm item name, quantity, and expiry date. Step 4: App tracks usage automatically over time. Step 5: User receives alerts ("Use within 3 days", "Best time to cook", "Donate recommended"). Step 6: App suggests what to consume first, what not to reorder, and optimal buying quantity.',
      keywords: ['level-2', 'inventory', 'barcode', 'alerts', 'expiry', 'tracking'],
      category: 'level-2',
    },
    {
      id: 'level2-benefits',
      title: 'Level 2: Benefits and What Users Get',
      content:
        'Users get less expired food/items, smarter shopping, and reduced overbuying. The AI monitors expiry and usage trends, helping users stay in control while receiving optimized purchase recommendations.',
      keywords: ['level-2', 'benefits', 'food-waste', 'shopping', 'savings'],
      category: 'level-2',
    },

    // Section 5: Level 3
    {
      id: 'level3-purpose',
      title: 'Level 3: QR/RFID Lifecycle Tracking - Purpose',
      content:
        'Level 3 ensures items are used for their full intended lifespan by tracking usage through QR or RFID tags and guiding maintenance or reuse. The system ensures no premature disposal and maximizes value from products.',
      keywords: ['level-3', 'qr', 'rfid', 'lifecycle', 'tracking', 'reuse'],
      category: 'level-3',
    },
    {
      id: 'level3-how',
      title: 'Level 3: How to Use QR/RFID Lifecycle Tracking',
      content:
        'Step 1: Select "Track Item Lifecycle". Step 2: Register an item by scanning QR code or attaching Eco Loop QR tag/RFID. Step 3: Define maximum usage count or expected lifespan. Step 4: Each time the item is used, scan QR or auto-log (enterprise). Step 5: App displays remaining usable life and maintenance suggestions. Step 6: When usage limit is reached, app notifies user and suggests reuse/resale/recycling.',
      keywords: ['level-3', 'qr', 'rfid', 'lifecycle', 'usage', 'tracking', 'steps'],
      category: 'level-3',
    },
    {
      id: 'level3-when-reuse',
      title: 'Level 3: When an Item Should Move to Reuse or Recycling',
      content:
        'The system tracks usage limits and condition. When thresholds are reached, the app notifies the user and suggests reuse, resale, or recycling options automatically. This prevents premature disposal and ensures full product lifecycle utilization.',
      keywords: ['level-3', 'reuse', 'recycling', 'threshold', 'lifecycle'],
      category: 'level-3',
    },

    // Section 6: Level 4
    {
      id: 'level4-purpose',
      title: 'Level 4: Second-Hand Marketplace & Recycling Rewards - Purpose',
      content:
        'Level 4 converts waste into value through a marketplace and rewards system. Users can list reusable items or recyclable waste, and the system evaluates materials and assigns Eco Points.',
      keywords: ['level-4', 'marketplace', 'recycling', 'rewards', 'value'],
      category: 'level-4',
    },
    {
      id: 'level4-how',
      title: 'Level 4: How to Use Second-Hand Marketplace',
      content:
        'Step 1: Open Marketplace/Recycling. Step 2: Upload item or waste (reusable product or recyclable materials like plastic/metal/electronics). Step 3: Select category and condition. Step 4: App calculates Eco Points. Step 5: User confirms listing. Step 6: Partner recycler/buyer is assigned. Step 7: Material is collected or exchanged. Step 8: Eco Points are added to user wallet. Step 9: Points can be redeemed after milestones.',
      keywords: ['level-4', 'marketplace', 'upload', 'eco-points', 'recycling', 'steps'],
      category: 'level-4',
    },
    {
      id: 'level4-process',
      title: 'Level 4: What Happens After Uploading Waste',
      content:
        'Uploaded items are categorized, assigned points, and connected to verified recycling or resale partners. Users can redeem rewards after reaching sustainability milestones.',
      keywords: ['level-4', 'upload', 'categorized', 'points', 'partners'],
      category: 'level-4',
    },

    // Section 7: Level 5
    {
      id: 'level5-purpose',
      title: 'Level 5: AR-Based Sustainability Education - Purpose',
      content:
        'Level 5 drives long-term behavior change through interactive learning. AR provides interactive education where users scan objects and instantly see disposal guidance, environmental impact, and eco-friendly alternatives.',
      keywords: ['level-5', 'ar', 'education', 'learning', 'behavior-change'],
      category: 'level-5',
    },
    {
      id: 'level5-how',
      title: 'Level 5: How to Use AR-Based Sustainability Education',
      content:
        'Step 1: Open AR Scan Mode. Step 2: Point camera at any object or waste. Step 3: AR overlay appears showing what the item is, how to dispose or recycle it, and environmental impact. Step 4: App suggests better alternatives and reuse ideas. Step 5: User earns knowledge badges.',
      keywords: ['level-5', 'ar', 'scan', 'education', 'alternatives', 'badges'],
      category: 'level-5',
    },

    // Section 8: Eco Points System
    {
      id: 'eco-points-how',
      title: 'How Eco Loop Rewards Sustainability',
      content:
        'Eco Loop uses Eco Points tied to verified environmental impact. Points are awarded only for genuine reuse or recycling actions, preventing misuse or artificial waste generation. The Eco Points system is designed to reward real environmental impact rather than excessive consumption.',
      keywords: ['eco-points', 'rewards', 'impact', 'verified', 'genuine'],
      category: 'rewards',
    },

    // Section 9: All Levels Integration
    {
      id: 'all-levels-journey',
      title: 'How All Levels Work Together',
      content:
        'The complete Eco Loop journey: Step 1 - Scan and Identify waste (Level 1). Step 2 - Prevent waste by using items before expiry (Level 2). Step 3 - Optimize by using items fully (Level 3). Step 4 - Recover value through reuse or recycling (Level 4). Step 5 - Learn and improve future behavior (Level 5).',
      keywords: [
        'levels',
        'journey',
        'integration',
        'prevention',
        'circular',
        'behavior',
      ],
      category: 'overview',
    },

    // Section 10: Sustainability Philosophy
    {
      id: 'philosophy-core',
      title: 'Eco Loop Sustainability Philosophy',
      content:
        'Eco Loop is built on the principle that the most sustainable waste is the waste that is never created. Unlike traditional waste-management systems that focus only on disposal, Eco Loop emphasizes waste prevention, optimized consumption, reuse, and circular material flow. The platform aligns with global sustainability goals such as the UN SDGs (Responsible Consumption & Production, Climate Action, and Sustainable Cities).',
      keywords: ['philosophy', 'prevention', 'circular', 'sustainability', 'un-sdgs'],
      category: 'philosophy',
    },
    {
      id: 'economic-sustainability',
      title: 'Economic Sustainability: Cost Reduction',
      content:
        'Eco Loop reduces costs through reduced food and inventory waste, optimized purchasing, and lower waste management costs. Impact: Households save money and enterprises increase operational efficiency.',
      keywords: ['economics', 'cost', 'savings', 'efficiency', 'waste-reduction'],
      category: 'sustainability',
    },
    {
      id: 'ethical-sustainability',
      title: 'Ethical Sustainability',
      content:
        'Eco Loop embeds ethics directly into sustainability through user data ownership and privacy, explainable AI, fair partnerships with recyclers, and no exploitation of waste generation for rewards. Impact: Long-term trust and compliance with ESG principles.',
      keywords: ['ethics', 'trust', 'esg', 'privacy', 'fair-partnerships'],
      category: 'sustainability',
    },
  ],
};

/**
 * Simple semantic similarity using keyword matching
 * More advanced than exact match but efficient for browser
 */
function calculateSimilarity(query, chunk) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const contentWords = chunk.content.toLowerCase().split(/\s+/);
  const titleWords = chunk.title.toLowerCase().split(/\s+/);

  let score = 0;

  // Keyword matches
  queryWords.forEach((word) => {
    if (word.length > 3) {
      // Ignore small words
      const keywordMatches = chunk.keywords.filter(
        (kw) => kw.includes(word) || word.includes(kw)
      ).length;
      score += keywordMatches * 3; // High weight for keyword matches

      // Content matches
      const contentMatches = contentWords.filter((cw) =>
        cw.includes(word) || word.includes(cw)
      ).length;
      score += contentMatches * 1;

      // Title matches
      const titleMatches = titleWords.filter((tw) =>
        tw.includes(word) || word.includes(tw)
      ).length;
      score += titleMatches * 2;
    }
  });

  return score;
}

/**
 * Search knowledge base and return best matching chunks
 */
function searchKnowledgeBase(query, topK = 3) {
  const scored = ECO_LOOP_RAG_KNOWLEDGE.chunks.map((chunk) => ({
    ...chunk,
    score: calculateSimilarity(query, chunk),
  }));

  return scored
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ score, ...chunk }) => chunk);
}

/**
 * Get comprehensive answer from best matching chunks
 */
function generateAnswer(query) {
  const chunks = searchKnowledgeBase(query, 3);

  if (chunks.length === 0) {
    // Fallback: Always construct an answer
    return {
      chunks: [],
      primaryContent:
        `I couldn't find an exact answer in the documentation, but here's a helpful response based on what I know about Eco Loop:\n\n` +
        `Eco Loop is a sustainability platform focused on waste prevention, smart inventory, lifecycle tracking, recycling, and education.\n\n` +
        `For your question: "${query}", please try rephrasing or ask about any of our 5 levels, Eco Points, or our ethical approach.\n\n` +
        `If you need more details, visit our documentation or contact support.`,
      title: 'General Eco Loop Information',
      category: 'general',
    };
  }

  // Build answer from chunks
  const answer = {
    chunks: chunks,
    primaryContent: chunks[0].content,
    title: chunks[0].title,
    category: chunks[0].category,
  };

  return answer;
}

/**
 * Format RAG answer for display
 */
function formatRAGAnswer(ragAnswer) {
  if (!ragAnswer) return null;

  const { title, primaryContent, chunks } = ragAnswer;

  let formatted = `**${title}**\n\n${primaryContent}`;

  // Add supporting information from other chunks if relevant
  if (chunks.length > 1) {
    formatted += '\n\n**Related Information:**';
    chunks.slice(1, 3).forEach((chunk) => {
      formatted += `\n\n• **${chunk.title}**: ${chunk.content.substring(0, 150)}...`;
    });
  }

  return formatted;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ECO_LOOP_RAG_KNOWLEDGE,
    searchKnowledgeBase,
    generateAnswer,
    formatRAGAnswer,
  };
}

// Make functions globally available in browser
if (typeof window !== 'undefined') {
  window.ECO_LOOP_RAG_KNOWLEDGE = ECO_LOOP_RAG_KNOWLEDGE;
  window.searchKnowledgeBase = searchKnowledgeBase;
  window.generateAnswer = generateAnswer;
  window.formatRAGAnswer = formatRAGAnswer;
}

/**
 * Usage:
 * const answer = generateAnswer('How do I use Level 1?');
 * const formatted = formatRAGAnswer(answer);
 * console.log(formatted);
 */
