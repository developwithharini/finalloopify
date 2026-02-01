  // n8n Fetch Example Button
  const fetchBtn = document.getElementById('n8n-fetch-example');
  if (fetchBtn) {
    fetchBtn.onclick = async function() {
      const status = document.getElementById('n8n-fetch-status');
      status.textContent = 'Sending...';
      try {
        const resp = await fetch('https://harinikishore.app.n8n.cloud/webhook-test/028a55f3-8c94-4b60-81be-d756af089a5d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
        });
        if (resp.ok) {
          status.textContent = '✅ Test data sent!';
        } else {
          status.textContent = '❌ Failed to send.';
        }
      } catch (e) {
        status.textContent = '❌ Error sending.';
      }
    };
  }
// ============================================================================
// LOOPIFY TIERED APP - Unified Platform with Feature Gating
// ============================================================================

// EXTENDED APP STATE - includes tier awareness
const AppState = {
  // Platform tier info (from parent window)
  tier: 'freemium',
  accessibleLevels: [1, 2, 3],
  isPremium() {
    return this.tier === 'premium' || (this.accessibleLevels && this.accessibleLevels.includes(4));
  },
  
  currentSection: 'wastelens',
  currentInputMode: 'camera',
  
  // WasteLens
  wasteResults: [],
  currentImage: null,
  videoStream: null,
  
  // ShelfLife
  foodItems: [],
  
  // ReturnBox
  returns: [],
  
  // MaterialBank
  materials: [],
  requests: [],
  
  // Impact (aggregated from all modules)
  impact: {
    wasteClassified: 0,
    compostable: 0,
    recyclable: 0,
    reusable: 0,
    landfill: 0,
    foodTracked: 0,
    itemsReused: 0,
    materialsMatched: 0,
  },

  save() {
    localStorage.setItem('loopify-app-state', JSON.stringify(this));
    if (typeof updateImpactDashboard === 'function') {
      updateImpactDashboard();
    }
  },

  load() {
    const saved = localStorage.getItem('loopify-app-state');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(this, data);
    }
  }
};

// CLASSIFICATION RULES (unchanged from original)
const CLASSIFICATION_RULES = {
  Compostable: {
    keywords: ['fruit', 'vegetable', 'food', 'organic', 'banana', 'apple', 'lettuce', 'cabbage', 'coffee', 'tea', 'grass', 'leaf', 'leaves', 'peel', 'skin'],
    features: ['brown', 'yellow', 'green', 'natural'],
    icon: '🌱',
    guidance: 'Add to compost bin or green waste. This item will naturally decompose, enriching soil.',
    impact: 'Prevents methane emissions from landfills and creates nutrient-rich compost for gardens.',
    color: '#6b9e83'
  },
  Recyclable: {
    keywords: ['plastic', 'paper', 'cardboard', 'glass', 'metal', 'aluminum', 'tin', 'bottle', 'can', 'box', 'newspaper', 'magazine'],
    features: ['metallic', 'transparent', 'white', 'blue'],
    icon: '♻️',
    guidance: 'Place in recycling bin. Ensure it\'s clean and sorted by material type.',
    impact: 'Reduces mining/extraction by 95%, saves 99% energy vs new production.',
    color: '#0ea5e9'
  },
  Reusable: {
    keywords: ['container', 'bottle', 'jar', 'bag', 'box', 'furniture', 'clothes', 'book', 'cup', 'glass', 'plastic'],
    features: ['intact', 'functional', 'clean'],
    icon: '🔁',
    guidance: 'Donate or resell. This item can serve another purpose elsewhere.',
    impact: 'Extends product lifecycle, eliminates manufacturing waste, builds community.',
    color: '#f59e0b'
  },
  Landfill: {
    keywords: ['hazardous', 'contaminated', 'broken', 'damaged', 'mixed', 'composite'],
    features: ['deteriorated', 'non-functional'],
    icon: '🗑️',
    guidance: 'Dispose in regular trash. Check local regulations for special handling.',
    impact: 'Minimize landfill impact by preventing it when possible.',
    color: '#ef4444'
  }
};

// ============================================================================
// PLATFORM COMMUNICATION
// ============================================================================

window.addEventListener('message', (event) => {
  if (event.data.type === 'INIT_PLATFORM') {
    AppState.tier = event.data.tier;
    AppState.accessibleLevels = event.data.accessibleLevels;
    
    // Log tier info
    console.log(`✅ Platform initialized with tier: ${AppState.tier}`);
    console.log(`✅ Accessible levels: ${AppState.accessibleLevels.join(', ')}`);
    
    // Update UI for tier restrictions
    applyTierRestrictions();
  }
});

// ============================================================================
// TIER-BASED ACCESS CONTROL
// ============================================================================

function applyTierRestrictions() {
  const premiumLevels = [4, 5];
  
  document.querySelectorAll('.nav-item').forEach((item) => {
    const section = item.dataset.section;
    const sectionNum = {
      'wastelens': 1,
      'shelflife': 2,
      'returnbox': 3,
      'materialbank': 4,
      'impact': 5,
      'help': 0
    }[section];

    if (sectionNum && premiumLevels.includes(sectionNum)) {
      // Check if user can access
      if (!AppState.accessibleLevels.includes(sectionNum)) {
        // Lock this item
        item.style.opacity = '0.5';
        item.style.pointerEvents = 'none';
        item.style.cursor = 'not-allowed';
        
        // Add premium badge
        const label = item.innerHTML;
        if (!label.includes('Premium')) {
          item.innerHTML = label + ' <span style="font-size: 10px; color: #999; margin-left: 4px;"><strong>[Premium]</strong></span>';
        }
        
        // Add click handler to show upgrade prompt
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          showUpgradePrompt(section);
        });
      }
    }
  });
}

function showUpgradePrompt(section) {
  const message = `This feature is available in Premium. Upgrade now to access Level 4 & 5 features.`;
  const proceed = confirm(message + '\n\nWould you like to upgrade to Premium?');
  
  if (proceed) {
    // Redirect to upgrade page
    window.parent.location.href = 'payment.html';
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initApp() {
  AppState.load();
  setupNavigation();
  setupWasteLens();
  setupShelfLife();
  setupReturnBox();
  setupMaterialBank();
  updateImpactDashboard();
  
  // Initialize EcoPoints display
  if (typeof ecoPoints !== 'undefined') {
    const balanceEl = document.getElementById('app-ecopoints-balance');
    if (balanceEl) {
      balanceEl.textContent = ecoPoints.getBalance();
    }
  }
  
  // Apply tier restrictions
  setTimeout(applyTierRestrictions, 100);
  
  console.log('✅ Loopify app initialized');
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      
      // Check access
      const sectionNum = {
        'wastelens': 1,
        'shelflife': 2,
        'returnbox': 3,
        'materialbank': 4,
        'impact': 5,
        'help': 0
      }[section];
      
      if (sectionNum && !AppState.accessibleLevels.includes(sectionNum)) {
        showUpgradePrompt(section);
        return;
      }
      
      switchSection(section);
    });
  });
}

function switchSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  
  document.getElementById(sectionId).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
  
  AppState.currentSection = sectionId;
  window.scrollTo(0, 0);
}

// ============================================================================
// WASTELENS - WASTE CLASSIFICATION
// ============================================================================

function setupWasteLens() {
  const modeBtns = document.querySelectorAll('.input-mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchInputMode(btn.dataset.mode);
    });
  });

  document.getElementById('startCameraBtn').addEventListener('click', startCamera);
  document.getElementById('captureBtn').addEventListener('click', captureFrame);
  document.getElementById('selectGalleryBtn').addEventListener('click', () => {
    document.getElementById('galleryInput').click();
  });
  document.getElementById('galleryInput').addEventListener('change', (e) => {
    handleImageSelect(e.target.files[0], 'upload');
  });
  document.getElementById('selectFileBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  document.getElementById('fileInput').addEventListener('change', (e) => {
    handleImageSelect(e.target.files[0], 'file');
  });
  document.getElementById('scanBtn').addEventListener('click', scanWaste);
  document.getElementById('clearBtn').addEventListener('click', clearWasteLens);
}

function switchInputMode(mode) {
  document.getElementById('cameraMode').style.display = mode === 'camera' ? 'block' : 'none';
  document.getElementById('uploadMode').style.display = mode === 'upload' ? 'block' : 'none';
  document.getElementById('fileMode').style.display = mode === 'file' ? 'block' : 'none';
}

function startCamera() {
  const video = document.getElementById('videoFeed');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      AppState.videoStream = stream;
      video.srcObject = stream;
      video.style.display = 'block';
      document.getElementById('noCameraMsg').style.display = 'none';
      document.getElementById('startCameraBtn').style.display = 'none';
      document.getElementById('captureBtn').style.display = 'block';
    })
    .catch(err => {
      alert('Unable to access camera. Please check permissions.');
    });
}

function captureFrame() {
  const video = document.getElementById('videoFeed');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  const img = new Image();
  img.src = canvas.toDataURL();
  AppState.currentImage = img;
  document.getElementById('scanBtn').disabled = false;
}

function handleImageSelect(file, mode) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      AppState.currentImage = img;
      if (mode === 'upload') {
        document.getElementById('uploadImg').src = img.src;
        document.getElementById('uploadImg').style.display = 'block';
        document.getElementById('uploadPlaceholder').style.display = 'none';
      } else {
        document.getElementById('fileImg').src = img.src;
        document.getElementById('fileImg').style.display = 'block';
        document.getElementById('filePlaceholder').style.display = 'none';
      }
      document.getElementById('scanBtn').disabled = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function scanWaste() {
  if (!AppState.currentImage) {
    alert('Please select an image first');
    return;
  }
  const scanBtn = document.getElementById('scanBtn');
  scanBtn.disabled = true;
  document.getElementById('scanBtnText').style.display = 'none';
  document.getElementById('scanSpinner').style.display = 'inline-block';

  setTimeout(() => {
    const result = classifyWaste(AppState.currentImage);
    displayWasteResult(result);
    AppState.impact.wasteClassified++;
    AppState.impact[result.category.toLowerCase()]++;
    AppState.save();
    updateImpactDashboard();
    scanBtn.disabled = false;
    document.getElementById('scanBtnText').style.display = 'inline';
    document.getElementById('scanSpinner').style.display = 'none';
  }, 800);
}

function classifyWaste(imgElement) {
  const features = extractWasteFeatures(imgElement);
  let bestCategory = 'Landfill';
  let bestScore = 0;

  for (const [category, rules] of Object.entries(CLASSIFICATION_RULES)) {
    const keywords = 'scanned_waste'.toLowerCase();
    const keywordMatches = rules.keywords.filter(kw => keywords.includes(kw)).length;
    const keywordScore = (keywordMatches / rules.keywords.length) * 0.4;

    const featureMatches = rules.features.filter(feat => features.dominantColors.includes(feat)).length;
    const featureScore = (featureMatches / rules.features.length) * 0.3;

    const colorScore = features.hasNaturalColors ? 0.3 : 0;
    const score = keywordScore + featureScore + colorScore;

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const confidence = Math.min(99, Math.max(70, Math.round(bestScore * 100)));
  return {
    category: bestCategory,
    confidence,
    icon: CLASSIFICATION_RULES[bestCategory].icon,
    guidance: CLASSIFICATION_RULES[bestCategory].guidance,
    impact: CLASSIFICATION_RULES[bestCategory].impact,
    reason: `ML confidence: ${confidence}%. Features detected: ${features.dominantColors.join(', ')}.`
  };
}

function extractWasteFeatures(imgElement) {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, 224, 224);
  const imageData = ctx.getImageData(0, 0, 224, 224);
  const data = imageData.data;

  const colors = { brown: 0, yellow: 0, green: 0, blue: 0, transparent: 0, metallic: 0 };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) colors.transparent++;
    else if (r > 150 && g > 100 && b < 100) colors.brown++;
    else if (r > 200 && g > 150 && b < 100) colors.yellow++;
    else if (g > r && g > b) colors.green++;
    else if (b > r && b > g) colors.blue++;
    else if (r === g && g === b && r > 180) colors.metallic++;
  }

  const dominantColors = Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);

  return {
    dominantColors,
    hasNaturalColors: colors.brown > 224 * 224 * 0.1 || colors.green > 224 * 224 * 0.1,
    colorDistribution: colors
  };
}

function displayWasteResult(result) {
  const resultSection = document.getElementById('resultSection');
  const emptyState = document.getElementById('emptyState');

  document.getElementById('resultIcon').textContent = result.icon;
  document.getElementById('resultCategory').textContent = result.category;
  document.getElementById('resultSubtitle').textContent = `${result.confidence}% confidence`;
  document.getElementById('confidencePercent').textContent = `${result.confidence}%`;
  document.getElementById('confidenceFill').style.width = `${result.confidence}%`;
  document.getElementById('guidanceText').textContent = result.guidance;
  document.getElementById('impactText').textContent = result.impact;
  document.getElementById('reasonText').textContent = result.reason;

  resultSection.style.display = 'block';
  emptyState.style.display = 'none';
  AppState.wasteResults.push(result);
  AppState.save();
}

function clearWasteLens() {
  AppState.currentImage = null;
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('emptyState').style.display = 'block';
  document.getElementById('scanBtn').disabled = true;
  document.getElementById('uploadImg').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'block';
  document.getElementById('fileImg').style.display = 'none';
  document.getElementById('filePlaceholder').style.display = 'block';
  if (AppState.videoStream) {
    AppState.videoStream.getTracks().forEach(track => track.stop());
    AppState.videoStream = null;
  }
  document.getElementById('videoFeed').style.display = 'none';
  document.getElementById('noCameraMsg').style.display = 'block';
  document.getElementById('startCameraBtn').style.display = 'block';
  document.getElementById('captureBtn').style.display = 'none';
}

// ============================================================================
// SHELFLIFE - FOOD SPOILAGE PREVENTION
// ============================================================================

function setupShelfLife() {
  document.getElementById('shelflife-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('shelf-food-name').value;
    const date = new Date(document.getElementById('shelf-purchase-date').value);
    const storage = document.querySelector('.storage-btn.active')?.dataset.storage || 'room';
    
    if (!name || !date || !storage) {
      alert('Please fill all fields');
      return;
    }
    
    addFoodItem(name, date, storage);
    displayFoodItems();
    document.getElementById('shelflife-form').reset();
    document.querySelectorAll('.storage-btn').forEach(b => b.classList.remove('active'));
  });

  document.querySelectorAll('.storage-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.storage-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  displayFoodItems();
}

function addFoodItem(name, purchaseDate, storage) {
  const now = new Date();
  const daysOld = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
  const shelfLifeDays = { 'room': 7, 'refrigerated': 14, 'frozen': 180 };
  const maxDays = shelfLifeDays[storage];
  const daysRemaining = maxDays - daysOld;
  const riskLevel = daysRemaining <= 0 ? 'expired' : daysRemaining <= 2 ? 'critical' : daysRemaining <= 5 ? 'warning' : 'safe';

  const item = {
    id: Date.now(),
    name,
    purchaseDate: purchaseDate.toISOString(),
    storage,
    daysOld,
    daysRemaining,
    riskLevel,
    created: now.toISOString()
  };

  AppState.foodItems.push(item);
  AppState.impact.foodTracked++;
  AppState.save();
  return item;
}

function displayFoodItems() {
  const container = document.getElementById('shelflife-items');
  if (AppState.foodItems.length === 0) {
    container.innerHTML = '<p class="text-muted text-sm">No items yet.</p>';
    return;
  }

  const now = new Date();
  const activeItems = AppState.foodItems.filter(item => {
    const itemDate = new Date(item.created);
    return (now - itemDate) / (1000 * 60 * 60 * 24) < 30;
  });

  container.innerHTML = activeItems.map(item => {
    const riskColor = { 'expired': '#ef4444', 'critical': '#f59e0b', 'warning': '#eab308', 'safe': '#6b9e83' }[item.riskLevel];
    const riskLabel = { 'expired': '❌ Expired', 'critical': '⚠️ Use Soon', 'warning': '⏰ Days Left', 'safe': '✅ Safe' }[item.riskLevel];
    return `<div class="card-premium"><div class="flex justify-between items-start mb-2"><div><h4 class="font-semibold">${item.name}</h4><p class="text-xs text-muted">${item.storage}</p></div><div class="badge-sage">${item.daysRemaining} days</div></div><div style="border-top: 1px solid #333; padding-top: 8px; margin-top: 8px;"><p class="text-xs" style="color: ${riskColor}; font-weight: 500;">${riskLabel}</p></div></div>`;
  }).join('');
}

// ============================================================================
// RETURNBOX - CIRCULAR RETURNS TRACKING
// ============================================================================

function setupReturnBox() {
  document.getElementById('returnbox-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const itemId = document.getElementById('return-item-id').value;
    const condition = document.getElementById('return-condition').value;
    
    if (!itemId || !condition) {
      alert('Please fill all fields');
      return;
    }

    const returnItem = {
      id: Date.now(),
      itemId,
      condition,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };

    AppState.returns.push(returnItem);
    AppState.impact.itemsReused++;
    AppState.save();
    document.getElementById('returnbox-form').reset();
    displayReturnsLog();
    updateReturnStats();
    updateImpactDashboard();
  });

  displayReturnsLog();
  updateReturnStats();
}

function displayReturnsLog() {
  const log = document.getElementById('returnbox-log');
  if (AppState.returns.length === 0) {
    log.innerHTML = '<p class="text-muted">No returns yet.</p>';
    return;
  }

  const recentReturns = AppState.returns.slice(-5).reverse();
  log.innerHTML = recentReturns.map(ret => `<div style="padding: 12px 0; border-bottom: 1px solid #333;"><div style="display: flex; justify-content: space-between; align-items: center;"><div><div style="font-weight: 500; font-size: 14px;">${ret.itemId}</div><div style="font-size: 12px; color: #999;">${ret.condition}</div></div><div style="text-align: right;"><div class="badge-sage">${ret.status}</div><div style="font-size: 11px; color: #666; margin-top: 4px;">${new Date(ret.timestamp).toLocaleDateString()}</div></div></div></div>`).join('');
}

function updateReturnStats() {
  document.getElementById('return-count').textContent = AppState.returns.length;
  document.getElementById('reuse-count').textContent = AppState.returns.filter(r => r.status === 'confirmed').length;
  const rate = AppState.returns.length > 0 ? Math.round((AppState.returns.filter(r => r.status === 'confirmed').length / AppState.returns.length) * 100) : 0;
  document.getElementById('return-rate').textContent = `${rate}%`;
}

// ============================================================================
// MATERIALBANK - INDUSTRIAL MATCHING (Premium only - feature gated)
// ============================================================================

function setupMaterialBank() {
  if (!AppState.accessibleLevels.includes(4)) {
    document.getElementById('materialbank').innerHTML = '<div class="card-premium" style="text-align: center; padding: 60px;"><h2 style="font-size: 24px; margin-bottom: 16px;">🔒 Premium Feature</h2><p class="text-muted" style="margin-bottom: 24px;">MaterialBank is available in Premium tier.</p><button class="button-primary" onclick="window.parent.location.href=\'payment.html\'">Upgrade to Premium</button></div>';
    return;
  }

  document.getElementById('material-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const material = {
      id: Date.now(),
      name: document.getElementById('material-name').value,
      category: document.getElementById('material-category').value,
      quantity: parseFloat(document.getElementById('material-quantity').value),
      type: 'producer',
      timestamp: new Date().toISOString()
    };
    AppState.materials.push(material);
    AppState.save();
    document.getElementById('material-form').reset();
    displayMaterialsTable();
    updateImpactDashboard();
  });

  document.getElementById('request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('request-category').value;
    const quantity = parseFloat(document.getElementById('request-quantity').value);
    const matches = AppState.materials.filter(m => m.category === category && m.quantity >= quantity);
    
    if (matches.length > 0) {
      alert(`Found ${matches.length} supplier(s) for ${quantity}kg of ${category}`);
      AppState.requests.push({
        id: Date.now(),
        category,
        quantity,
        matchCount: matches.length,
        timestamp: new Date().toISOString()
      });
      AppState.impact.materialsMatched += matches.length;
      AppState.save();
      updateImpactDashboard();
    } else {
      alert(`No suppliers found for ${quantity}kg of ${category}`);
    }
    document.getElementById('request-form').reset();
    displayMaterialsTable();
  });

  displayMaterialsTable();
}

function displayMaterialsTable() {
  const tbody = document.getElementById('materialbank-table');
  if (AppState.materials.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-8">No materials listed yet.</td></tr>';
    return;
  }
  tbody.innerHTML = AppState.materials.map(mat => `<tr><td>${mat.name}</td><td>${mat.category}</td><td>${mat.quantity}</td><td><span class="badge-sage">${mat.type}</span></td></tr>`).join('');
}

// ============================================================================
// IMPACT DASHBOARD (Premium only - full version feature gated)
// ============================================================================

function updateImpactDashboard() {
    console.log('updateImpactDashboard called:', JSON.stringify(AppState.impact));
  if (!AppState.accessibleLevels.includes(5)) {
    document.getElementById('impact').innerHTML = '<div class="card-premium" style="text-align: center; padding: 60px;"><h2 style="font-size: 24px; margin-bottom: 16px;">🔒 Premium Feature</h2><p class="text-muted" style="margin-bottom: 24px;">Full Impact Dashboard is available in Premium tier.</p><button class="button-primary" onclick="window.parent.location.href=\'payment.html\'">Upgrade to Premium</button></div>';
    return;
  }

  document.getElementById('metric-waste-diverted').textContent = AppState.impact.wasteClassified;
  document.getElementById('metric-food-saved').textContent = AppState.impact.foodTracked;
  document.getElementById('metric-items-reused').textContent = AppState.impact.itemsReused;
  document.getElementById('metric-materials-matched').textContent = AppState.impact.materialsMatched;

  const total = AppState.impact.wasteClassified || 1;
  document.getElementById('compost-count').textContent = AppState.impact.compostable;
  document.getElementById('recycle-count').textContent = AppState.impact.recyclable;
  document.getElementById('reuse-count-impact').textContent = AppState.impact.reusable;
  document.getElementById('landfill-count').textContent = AppState.impact.landfill;

  document.getElementById('compost-bar').style.width = `${(AppState.impact.compostable / total) * 100}%`;
  document.getElementById('recycle-bar').style.width = `${(AppState.impact.recyclable / total) * 100}%`;
  document.getElementById('reuse-bar').style.width = `${(AppState.impact.reusable / total) * 100}%`;
  document.getElementById('landfill-bar').style.width = `${(AppState.impact.landfill / total) * 100}%`;

  const methanePrevented = (AppState.impact.compostable + AppState.impact.recyclable) * 2.5;
  const resourcesSaved = AppState.impact.recyclable * 0.75 + AppState.impact.reusable * 1.2;
  const landfillSpace = AppState.impact.wasteClassified * 0.03;
  const carbonReduced = AppState.impact.foodTracked * 0.8 + (AppState.impact.recyclable * 1.2);

  document.getElementById('methane-prevented').textContent = methanePrevented.toFixed(1);
  document.getElementById('resources-saved').textContent = resourcesSaved.toFixed(1);
  document.getElementById('landfill-space').textContent = landfillSpace.toFixed(2);
  document.getElementById('carbon-reduced').textContent = carbonReduced.toFixed(1);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  // Premium Sync Integration (main button)
  const btnMain = document.getElementById('premium-sync-main');
  if (btnMain) {
    if (AppState.isPremium()) {
      btnMain.style.display = '';
      btnMain.onclick = async function() {
        const statusDiv = document.getElementById('premium-sync-status-main');
        statusDiv.textContent = 'Syncing...';
        try {
          const resp = await fetch('https://harinikishore.app.n8n.cloud/webhook-test/028a55f3-8c94-4b60-81be-d756af089a5d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: AppState.foodItems, timestamp: new Date().toISOString() })
          });
          if (resp.ok) {
            statusDiv.textContent = '✅ Synced to cloud successfully!';
          } else {
            statusDiv.textContent = '❌ Sync failed. Please try again.';
          }
        } catch (e) {
          statusDiv.textContent = '❌ Sync error. Check your connection.';
        }
      };
    } else {
      btnMain.style.display = '';
      btnMain.textContent = 'Upgrade to Premium';
      btnMain.onclick = function() {
        window.location.href = 'payment.html';
      };
    }
  }
  // Premium Sync Integration (ShelfLife section)
  const btnShelf = document.getElementById('premium-sync-shelf');
  if (btnShelf) {
    if (AppState.isPremium()) {
      btnShelf.style.display = '';
      btnShelf.onclick = async function() {
        const statusDiv = document.getElementById('premium-sync-status-shelf');
        statusDiv.textContent = 'Syncing...';
        try {
          const resp = await fetch('https://harinikishore.app.n8n.cloud/webhook-test/028a55f3-8c94-4b60-81be-d756af089a5d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: AppState.foodItems, timestamp: new Date().toISOString() })
          });
          if (resp.ok) {
            statusDiv.textContent = '✅ Synced to cloud successfully!';
          } else {
            statusDiv.textContent = '❌ Sync failed. Please try again.';
          }
        } catch (e) {
          statusDiv.textContent = '❌ Sync error. Check your connection.';
        }
      };
    } else {
      btnShelf.style.display = '';
      btnShelf.textContent = 'Upgrade to Premium';
      btnShelf.onclick = function() {
        window.location.href = 'payment.html';
      };
    }
  }
});
