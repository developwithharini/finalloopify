// MaterialBank Level 4 - Industrial Reuse Matching System

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const producerToggle = document.getElementById('producer-toggle');
const reuserToggle = document.getElementById('reuser-toggle');
const producerModule = document.getElementById('producer-module');
const reuserModule = document.getElementById('reuser-module');
const listingForm = document.getElementById('listing-form');
const requestForm = document.getElementById('request-form');
const matchTableBody = document.getElementById('match-table-body');
const transactionLogs = document.getElementById('transaction-logs');
const ecopointsBalanceEl = document.getElementById('ecopoints-balance');

// Data storage keys
const LISTINGS_KEY = 'materialListings';
const LOGS_KEY = 'transactionLogs';

// Initialize data
let listings = JSON.parse(localStorage.getItem(LISTINGS_KEY)) || [];
let transactionData = JSON.parse(localStorage.getItem(LOGS_KEY)) || [];

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
});

// Module toggle
producerToggle.addEventListener('click', () => {
    producerModule.classList.remove('hidden');
    reuserModule.classList.add('hidden');
    producerToggle.classList.add('bg-blue-500', 'text-white');
    producerToggle.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
    reuserToggle.classList.remove('bg-green-500', 'text-white');
    reuserToggle.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
});

reuserToggle.addEventListener('click', () => {
    reuserModule.classList.remove('hidden');
    producerModule.classList.add('hidden');
    reuserToggle.classList.add('bg-green-500', 'text-white');
    reuserToggle.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
    producerToggle.classList.remove('bg-blue-500', 'text-white');
    producerToggle.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
});

// Listing form submission
listingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(listingForm);
    const listing = {
        id: Date.now().toString(),
        name: formData.get('material-name'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        timestamp: new Date().toISOString()
    };
    listings.push(listing);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    
    // Award EcoPoints for material listing (match opportunity)
    const pointsResult = ecoPoints.addPoints('LEVEL4_MATERIAL_MATCH', {
        transactionId: listing.id,
        itemId: listing.name,
        quantity: listing.quantity,
        category: listing.category
    });
    
    if (pointsResult.success) {
        toastManager.success(pointsResult.message);
        updateEcopointsDisplay();
    }
    
    listingForm.reset();
});

// Request form submission
requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(requestForm);
    const requestCategory = formData.get('request-category');
    const requestQuantity = parseInt(formData.get('request-quantity'));

    // Find matches
    const matches = listings.filter(listing =>
        listing.category === requestCategory && listing.quantity >= requestQuantity
    );

    // Clear previous results
    matchTableBody.innerHTML = '';

    if (matches.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                No matching materials available
            </td>
        `;
        matchTableBody.appendChild(row);
        toastManager.info('No matching materials available');
    } else {
        matches.forEach(match => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${match.name}</td>
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${match.category}</td>
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${requestQuantity} kg</td>
                <td class="px-4 py-2 text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Matched
                    </span>
                </td>
            `;
            matchTableBody.appendChild(row);

            // Create transaction ID using both materials for uniqueness
            const transactionId = `L4_${match.id}_${Date.now()}`;

            // Log transaction
            const transaction = {
                id: transactionId,
                materialId: match.id,
                name: match.name,
                category: match.category,
                quantity: requestQuantity,
                timestamp: new Date().toISOString(),
                status: 'Matched'
            };
            transactionData.push(transaction);

            // Award EcoPoints for successful material reuse transaction
            const pointsResult = ecoPoints.addPoints('LEVEL4_TRANSACTION', {
                transactionId: transactionId,
                itemId: match.name,
                quantity: requestQuantity,
                category: match.category
            });
            
            if (pointsResult.success) {
                toastManager.success(pointsResult.message);
                // Show fulfillment modal for material pickup/delivery
                processTransactionWithCollectionDrive(match.name, requestQuantity, transactionId);
            }
        });
        localStorage.setItem(LOGS_KEY, JSON.stringify(transactionData));
        displayTransactionLogs();
        updateEcopointsDisplay();
    }

    requestForm.reset();
});

/**
 * Process material transaction with collection drive integration
 * Shows fulfillment modal for user to choose pickup or self drop-off
 */
function processTransactionWithCollectionDrive(materialName, quantity, transactionId) {
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
        ecoPointsMessage: `+40 EcoPoints added for your material reuse transaction 🌱`,
        nextCollection: nextCollection,
        selectedHub: nearestHub,
        itemName: `${quantity} kg ${materialName}`,
        transactionId: transactionId,
        level: 4,
    });
}

// Display transaction logs
function displayTransactionLogs() {
    transactionData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    transactionLogs.innerHTML = '';
    transactionData.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = 'bg-gray-50 dark:bg-gray-700 p-3 rounded-md';
        logEntry.innerHTML = `
            <p class="text-sm text-gray-600 dark:text-gray-300">
                <strong>${log.name}</strong> (${log.category}) - ${log.quantity} kg reused
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
                ${new Date(log.timestamp).toLocaleString()} - ${log.status}
            </p>
        `;
        transactionLogs.appendChild(logEntry);
    });
}

// Update EcoPoints display
function updateEcopointsDisplay() {
    ecopointsBalanceEl.textContent = ecoPoints.getBalance();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayTransactionLogs();
    updateEcopointsDisplay();
    // Set initial theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
        themeToggle.textContent = 'Toggle Light Mode';
    }
});