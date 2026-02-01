// ============================================================================
// LOOPIFY PLATFORM - Tier-Based Architecture
// ============================================================================

// PLATFORM STATE
const PlatformState = {
  user: {
    tier: null, // 'freemium' or 'premium'
    username: null,
    email: null,
  },

  progress: {
    currentLevel: 0,           // 0-4 (0=home, 1-5=levels)
    completedLevels: [],
    isAuthenticated: false,
  },

  // Tier feature access matrix
  tiers: {
    freemium: {
      name: 'Freemium',
      color: '#999',
      accessibleLevels: [1, 2, 3],
      features: {
        wastelens: true,
        shelflife: true,
        returnbox_basic: true,
        materialbank: false,
        impact_full: false,
      }
    },
    premium: {
      name: 'Premium',
      color: '#6b9e83',
      accessibleLevels: [1, 2, 3, 4, 5],
      features: {
        wastelens: true,
        shelflife: true,
        returnbox_full: true,
        materialbank: true,
        impact_full: true,
        analytics: true,
      }
    }
  },

  save() {
    localStorage.setItem('loopify-platform-state', JSON.stringify(this));
  },

  load() {
    const saved = localStorage.getItem('loopify-platform-state');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(this, data);
    }
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  PlatformState.load();
  
  if (PlatformState.progress.isAuthenticated) {
    showAuthenticated();
  } else {
    showHome();
  }
});

// ============================================================================
// HOME PAGE FLOWS
// ============================================================================

function showHome() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('tierInfo').style.display = 'none';
}

function showTiers() {
  document.getElementById('stepsSection').style.display = 'none';
  document.getElementById('tiersSection').style.display = 'block';
  
  // Scroll to tiers
  setTimeout(() => {
    document.querySelector('.tiers-section').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function startFreemium() {
  PlatformState.user.tier = 'freemium';
  PlatformState.progress.isAuthenticated = true;
  PlatformState.progress.currentLevel = 1;
  PlatformState.save();
  
  showAuthenticated();
}

function upgradeToPremium() {
  // Go to payment page
  window.location.href = 'payment.html';
}

function logout() {
  PlatformState.user.tier = null;
  PlatformState.progress.isAuthenticated = false;
  PlatformState.progress.currentLevel = 0;
  PlatformState.save();
  
  showHome();
}

function goHome() {
  if (PlatformState.progress.isAuthenticated) {
    showAuthenticated();
  } else {
    showHome();
  }
}

function goToApp() {
  showApp();
}

// ============================================================================
// AUTHENTICATED VIEW
// ============================================================================

function showAuthenticated() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('stepsSection').style.display = 'block';
  document.getElementById('tiersSection').style.display = 'none';
  
  // Show tier badge
  const tierInfo = document.getElementById('tierInfo');
  tierInfo.style.display = 'flex';
  
  const badge = document.getElementById('tierBadge');
  const tierName = PlatformState.tiers[PlatformState.user.tier].name;
  badge.textContent = tierName;
  
  // Update steps UI based on tier access
  updateProgressSteps();
}

function updateProgressSteps() {
  const tier = PlatformState.user.tier;
  const accessibleLevels = PlatformState.tiers[tier].accessibleLevels;
  const steps = document.querySelectorAll('.step');
  
  steps.forEach((step, index) => {
    const levelNum = index + 1;
    const isAccessible = accessibleLevels.includes(levelNum);
    
    if (!isAccessible) {
      step.style.opacity = '0.5';
      step.style.pointerEvents = 'none';
      step.querySelector('.step-label').innerHTML += ' <span style="font-size: 10px; color: #999;">(Premium)</span>';
    }
  });
}

// ============================================================================
// APP TRANSITION
// ============================================================================

function showApp() {
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  
  // Pass platform state to app via postMessage
  const appFrame = document.getElementById('appFrame');
  
  setTimeout(() => {
    appFrame.contentWindow.postMessage({
      type: 'INIT_PLATFORM',
      tier: PlatformState.user.tier,
      accessibleLevels: PlatformState.tiers[PlatformState.user.tier].accessibleLevels,
    }, '*');
  }, 500);
}

// ============================================================================
// PAYMENT REDIRECT FLOW
// ============================================================================

function initiatePremiumUpgrade() {
  // Redirect to payment page with return URL
  const returnUrl = window.location.href;
  window.location.href = `payment.html?return=${encodeURIComponent(returnUrl)}`;
}

// Listen for payment completion from payment page
window.addEventListener('message', (event) => {
  if (event.data.type === 'PAYMENT_SUCCESS') {
    // Upgrade to premium
    PlatformState.user.tier = 'premium';
    PlatformState.save();
    
    // Show authenticated view with premium access
    showAuthenticated();
    
    alert('Welcome to Loopify Premium! All features are now unlocked.');
  }
});
