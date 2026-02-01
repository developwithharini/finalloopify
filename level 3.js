// Predefined item IDs for simulation
const predefinedItems = ["BOTTLE001", "CAN002", "BOX003", "BAG004"];

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const manualToggle = document.getElementById('manual-toggle');
const simulatedToggle = document.getElementById('simulated-toggle');
const singleToggle = document.getElementById('single-toggle');
const multipleToggle = document.getElementById('multiple-toggle');
const itemIdInput = document.getElementById('item-id');
const quantitySection = document.getElementById('quantity-section');
const quantityInput = document.getElementById('quantity');
const simulateScanBtn = document.getElementById('simulate-scan');
const returnItemBtn = document.getElementById('return-item');
const confirmationDiv = document.getElementById('confirmation');
const confirmationMessage = document.getElementById('confirmation-message');
const totalEventsEl = document.getElementById('total-events');
const itemCountsEl = document.getElementById('item-counts');
const reuseLogEl = document.getElementById('reuse-log');
const ecopointsBalanceEl = document.getElementById('ecopoints-balance');

// Data storage
let reuseLogs = JSON.parse(localStorage.getItem('reuseLogs')) || [];
let itemCounts = JSON.parse(localStorage.getItem('itemCounts')) || {};

// Theme management
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';
updateTheme();

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('isDarkMode', isDarkMode);
    updateTheme();
});

function updateTheme() {
    const overlay = document.getElementById('overlay');
    if (isDarkMode) {
        overlay.classList.remove('overlay-light');
        overlay.classList.add('overlay-dark');
        document.body.classList.add('dark');
    } else {
        overlay.classList.remove('overlay-dark');
        overlay.classList.add('overlay-light');
        document.body.classList.remove('dark');
    }
    themeToggle.textContent = isDarkMode ? '🌙' : '☀️';
}

// Toggle management
manualToggle.addEventListener('click', () => {
    setActiveToggle(manualToggle, simulatedToggle);
});

simulatedToggle.addEventListener('click', () => {
    setActiveToggle(simulatedToggle, manualToggle);
});

singleToggle.addEventListener('click', () => {
    setActiveToggle(singleToggle, multipleToggle);
    quantitySection.classList.add('hidden');
    quantityInput.value = 1;
});

multipleToggle.addEventListener('click', () => {
    setActiveToggle(multipleToggle, singleToggle);
    quantitySection.classList.remove('hidden');
});

function setActiveToggle(active, inactive) {
    active.classList.add('active', 'bg-green-500', 'text-white');
    active.classList.remove('bg-gray-300', 'text-gray-700');
    inactive.classList.remove('active', 'bg-green-500', 'text-white');
    inactive.classList.add('bg-gray-300', 'text-gray-700');
}

// Simulate scan
simulateScanBtn.addEventListener('click', () => {
    const randomItem = predefinedItems[Math.floor(Math.random() * predefinedItems.length)];
    itemIdInput.value = randomItem;
});

// Return item
returnItemBtn.addEventListener('click', () => {
    const itemId = itemIdInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!itemId) {
        toastManager.error('Please enter an item ID.');
        return;
    }
    
    // Create unique transaction ID (prevent duplicate rewards)
    const transactionId = `L3_${itemId}_${Date.now()}`;
    
    // Log the return
    const logEntry = {
        id: itemId,
        timestamp: new Date().toISOString(),
        quantity: quantity
    };
    reuseLogs.push(logEntry);
    
    // Update counts
    itemCounts[itemId] = (itemCounts[itemId] || 0) + quantity;
    
    // Save to localStorage
    localStorage.setItem('reuseLogs', JSON.stringify(reuseLogs));
    localStorage.setItem('itemCounts', JSON.stringify(itemCounts));
    
    // Award EcoPoints based on quantity
    let pointsRule;
    if (quantity === 1) {
        pointsRule = 'LEVEL3_SMALL_RETURN';
    } else if (quantity <= 5) {
        pointsRule = 'LEVEL3_MEDIUM_RETURN';
    } else {
        pointsRule = 'LEVEL3_COMMUNITY_DRIVE';
    }
    
    const pointsResult = ecoPoints.addPoints(pointsRule, {
        transactionId: transactionId,
        itemId: itemId,
        quantity: quantity
    });
    
    // Show feedback
    updateMetrics();
    updateLog();
    
    if (pointsResult.success) {
        toastManager.success(pointsResult.message);
        
        // Initialize collection drive flow
        processReturnWithCollectionDrive(itemId, quantity, transactionId);
    }
    
    // Clear inputs
    itemIdInput.value = '';
    quantityInput.value = 1;
});

/**
 * Process return with collection drive integration
 * Shows fulfillment modal for user to choose pickup or self drop-off
 */
function processReturnWithCollectionDrive(itemId, quantity, transactionId) {
    // Ensure collection drive system is ready
    if (!window.collectionDriveSystem) {
        console.error('Collection Drive System not available');
        return;
    }
    
    // Ensure fulfillment modal is ready
    if (!window.fulfillmentModal) {
        console.error('Fulfillment Modal not available');
        return;
    }
    
    // Get nearest hub
    const nearestHub = window.collectionDriveSystem.getNearestHub();
    if (!nearestHub) {
        toastManager.error('No collection hubs available');
        return;
    }
    
    // Calculate next collection
    const nextCollection = window.collectionDriveSystem.calculateNextCollection(nearestHub);
    
    // Show fulfillment modal
    fulfillmentModal.show({
        ecoPointsMessage: `+20 EcoPoints added for your donation of ${quantity} ${itemId} 🌱`,
        nextCollection: nextCollection,
        selectedHub: nearestHub,
        itemName: `${quantity}x ${itemId}`,
        transactionId: transactionId,
        level: 3,
    });
}

// Show confirmation
function showConfirmation(message, success) {
    confirmationMessage.textContent = message;
    confirmationDiv.classList.remove('hidden');
    setTimeout(() => {
        confirmationDiv.classList.add('hidden');
    }, 3000);
}

// Update metrics
function updateMetrics() {
    const totalEvents = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);
    totalEventsEl.textContent = totalEvents;
    
    // Update EcoPoints balance
    ecopointsBalanceEl.textContent = ecoPoints.getBalance();
    
    itemCountsEl.innerHTML = '';
    for (const [id, count] of Object.entries(itemCounts)) {
        const div = document.createElement('div');
        div.className = 'flex justify-between';
        div.innerHTML = `<span class="text-gray-600 dark:text-gray-400">${id}:</span> <span class="font-semibold text-gray-900 dark:text-gray-100">${count}</span>`;
        itemCountsEl.appendChild(div);
    }
}

// Update log
function updateLog() {
    reuseLogEl.innerHTML = '';
    reuseLogs.slice(-10).reverse().forEach(log => {
        const div = document.createElement('div');
        div.className = 'p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300';
        div.textContent = `${new Date(log.timestamp).toLocaleString()}: Returned ${log.quantity} ${log.id}`;
        reuseLogEl.appendChild(div);
    });
}

// Initialize
updateMetrics();
updateLog();