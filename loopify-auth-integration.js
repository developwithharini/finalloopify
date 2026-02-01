/**
 * LOOPIFY - OTP & LOCATION INTEGRATION GUIDE
 * 
 * This file contains helper functions to integrate OTP and location
 * detection into existing Loopify HTML pages
 * 
 * Usage: Include this file in any HTML and call the functions
 */

// ====================================================================
// SESSION MANAGEMENT
// ====================================================================

/**
 * Get session token from localStorage
 * @returns {string|null} Session token if exists
 */
function getSessionToken() {
  return localStorage.getItem('sessionToken');
}

/**
 * Get current user from localStorage
 * @returns {object|null} User object if logged in
 */
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Get currently selected hub
 * @returns {object|null} Hub object if selected
 */
function getSelectedHub() {
  const hubId = localStorage.getItem('selectedHubId');
  if (!hubId) return null;
  
  const hubJson = localStorage.getItem(`hub_${hubId}`);
  return hubJson ? JSON.parse(hubJson) : null;
}

/**
 * Clear session (logout)
 */
function clearSession() {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('user');
  localStorage.removeItem('selectedHubId');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getSessionToken();
}

// ====================================================================
// API HELPERS
// ====================================================================

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/users/123')
 * @param {object} options - fetch options
 * @returns {Promise}
 */
async function authenticatedFetch(endpoint, options = {}) {
  const token = getSessionToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearSession();
    window.location.href = '/static/login-mobile.html';
    throw new Error('Session expired');
  }

  return response;
}

// ====================================================================
// LOCATION HELPERS
// ====================================================================

/**
 * Get user's current position using browser Geolocation API
 * @returns {Promise} {latitude, longitude, accuracy}
 */
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/**
 * Find nearest hub to coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise} Nearest hub object
 */
async function findNearestHub(latitude, longitude) {
  const response = await fetch(
    `/api/location/nearest-hub?lat=${latitude}&lng=${longitude}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to find nearest hub');
  }

  return response.json();
}

/**
 * Get hubs within radius
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusKm - Default 10 km
 * @returns {Promise} Array of hubs
 */
async function getNearbyHubs(latitude, longitude, radiusKm = 10) {
  const response = await fetch(
    `/api/location/nearby-hubs?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get nearby hubs');
  }

  const data = await response.json();
  return data.hubs;
}

/**
 * Record user location to server
 * @param {object} location - {latitude, longitude, accuracy}
 * @returns {Promise}
 */
async function recordUserLocation(location) {
  const user = getCurrentUser();
  if (!user) return;

  const response = await authenticatedFetch('/api/location/record', {
    method: 'POST',
    body: JSON.stringify({
      user_id: user.user_id,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy_meters: Math.round(location.accuracy)
    })
  });

  if (!response.ok) {
    throw new Error('Failed to record location');
  }

  return response.json();
}

// ====================================================================
// AUTO-LOGIN REDIRECT
// ====================================================================

/**
 * Require login - redirect to login page if not authenticated
 * Use this in pages that require authentication
 */
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/static/login-mobile.html';
  }
}

/**
 * Redirect to login if not authenticated, otherwise continue
 * @param {string} loginPageUrl - URL of login page
 */
function redirectIfNotLoggedIn(loginPageUrl = '/static/login-mobile.html') {
  if (!isLoggedIn()) {
    window.location.href = loginPageUrl;
  }
}

// ====================================================================
// UI COMPONENTS
// ====================================================================

/**
 * Display current user info in element
 * @param {string} elementId - ID of element to populate
 */
function displayCurrentUser(elementId) {
  const user = getCurrentUser();
  const element = document.getElementById(elementId);
  
  if (!element) return;
  
  if (!user) {
    element.innerHTML = '<p>Not logged in</p>';
    return;
  }

  element.innerHTML = `
    <div style="padding: 10px;">
      <p><strong>${user.name}</strong></p>
      <p style="color: #999; font-size: 14px;">+91-${user.phone_number}</p>
      <p style="color: #667eea; font-weight: 600;">🌱 ${user.eco_points || 0} EcoPoints</p>
    </div>
  `;
}

/**
 * Display nearest hub in element
 * @param {string} elementId - ID of element to populate
 */
async function displayNearestHub(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.innerHTML = '<p>🔍 Detecting location...</p>';

  try {
    const location = await getUserLocation();
    const hub = await findNearestHub(location.latitude, location.longitude);
    
    element.innerHTML = `
      <div style="padding: 10px;">
        <p><strong>${hub.hub_name}</strong></p>
        <p style="color: #667eea; font-weight: 600;">📍 ${hub.distance_km} km away</p>
        <p style="color: #999; font-size: 12px;">${hub.address || hub.location}</p>
      </div>
    `;
  } catch (error) {
    element.innerHTML = `<p style="color: #d32f2f;">⚠️ ${error.message}</p>`;
  }
}

// ====================================================================
// PAGE INITIALIZATION
// ====================================================================

/**
 * Initialize authentication on page load
 * Redirects to login if not authenticated
 */
function initAuth() {
  if (!isLoggedIn()) {
    console.warn('Not authenticated. Redirecting to login...');
    window.location.href = '/static/login-mobile.html';
  }
}

/**
 * Auto-detect location and store in session
 */
async function autoDetectLocation() {
  try {
    const location = await getUserLocation();
    const hub = await findNearestHub(location.latitude, location.longitude);
    
    localStorage.setItem('selectedHubId', hub.hub_id);
    localStorage.setItem(`hub_${hub.hub_id}`, JSON.stringify(hub));
    localStorage.setItem('userLocation', JSON.stringify(location));
    
    return hub;
  } catch (error) {
    console.error('Location detection failed:', error);
    return null;
  }
}

// ====================================================================
// EXAMPLE: ADDING LOGIN BUTTON TO NAVBAR
// ====================================================================

/**
 * Add login button to navbar (if not logged in)
 * or user profile (if logged in)
 * 
 * Usage in HTML:
 * <div id="authContainer"></div>
 * <script>
 *   document.addEventListener('DOMContentLoaded', () => {
 *     addLoginButtonToNavbar('authContainer');
 *   });
 * </script>
 */
function addLoginButtonToNavbar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <a href="/static/login-mobile.html" style="
        padding: 8px 16px;
        background: #667eea;
        color: white;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
      ">Login</a>
    `;
  } else {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div>
          <div style="font-weight: 600;">${user.name}</div>
          <div style="font-size: 12px; color: #999;">${user.eco_points} EcoPoints</div>
        </div>
        <button onclick="logoutUser()" style="
          padding: 6px 12px;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">Logout</button>
      </div>
    `;
  }
}

/**
 * Logout user
 */
async function logoutUser() {
  const token = getSessionToken();
  
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: token })
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  clearSession();
  window.location.href = '/static/login-mobile.html';
}

// ====================================================================
// DEMO: SIMULATE LOCATION (FOR TESTING)
// ====================================================================

/**
 * Simulate location with Indian city coordinates
 * Useful for testing without actual device
 * 
 * Usage: simulateLocation('delhi');
 */
function simulateLocation(city) {
  const cities = {
    'delhi': { latitude: 28.6139, longitude: 77.2090 },
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'bhopal': { latitude: 23.1815, longitude: 79.9864 }
  };

  const coords = cities[city.toLowerCase()];
  if (!coords) {
    console.error('City not found. Available:', Object.keys(cities));
    return;
  }

  return findNearestHub(coords.latitude, coords.longitude);
}

// ====================================================================
// CONSOLE HELPERS (For debugging)
// ====================================================================

// Access in browser console:
// loopifyAuth.isLoggedIn()
// loopifyAuth.getCurrentUser()
// loopifyAuth.getSelectedHub()
// loopifyAuth.clearSession()

window.loopifyAuth = {
  isLoggedIn,
  getCurrentUser,
  getSelectedHub,
  clearSession,
  getUserLocation,
  findNearestHub,
  getNearbyHubs,
  recordUserLocation,
  simulateLocation
};
