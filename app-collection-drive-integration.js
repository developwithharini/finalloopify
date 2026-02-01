/**
 * Collection Drive Integration for app.html
 * Integrates ReturnBox and MaterialBank with collection drive system
 */

// ReturnBox Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const returnboxForm = document.getElementById('returnbox-form');
  
  if (returnboxForm) {
    returnboxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const itemId = document.getElementById('return-item-id').value;
      const quantity = parseInt(document.getElementById('return-quantity').value) || 1;
      const condition = document.getElementById('return-condition').value;
      
      if (!itemId || !condition) {
        toastManager.error('Please fill all fields');
        return;
      }
      
      // Create unique transaction ID
      const transactionId = `L3_${itemId}_${Date.now()}`;
      
      // Award EcoPoints (+20 for ReturnBox)
      const pointsResult = ecoPoints.addPoints('LEVEL3_RETURN', {
        transactionId: transactionId,
        itemId: itemId,
        quantity: quantity,
        condition: condition
      });
      
      if (pointsResult.success) {
        // Show success toast
        toastManager.success(pointsResult.message);
        
        // Log the return
        logReturnBox(itemId, quantity, condition, transactionId);
        
        // Show collection drive fulfillment modal
        showReturnBoxCollectionDrive(itemId, quantity, transactionId, pointsResult);
        
        // Clear form
        returnboxForm.reset();
      } else {
        toastManager.error(pointsResult.message);
      }
    });
  }

  // MaterialBank Form Handler
  const materialbankForm = document.getElementById('materialbank-form');
  if (materialbankForm) {
    materialbankForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const materialName = document.getElementById('material-name').value;
      const category = document.getElementById('material-category').value;
      const quantity = parseInt(document.getElementById('material-quantity').value) || 0;
      
      if (!materialName || !category || quantity <= 0) {
        toastManager.error('Please fill all fields correctly');
        return;
      }
      
      // Create unique transaction ID
      const transactionId = `L4_${materialName}_${Date.now()}`;
      
      // Award EcoPoints (+40 for MaterialBank)
      const pointsResult = ecoPoints.addPoints('LEVEL4_MATERIAL', {
        transactionId: transactionId,
        itemId: materialName,
        quantity: quantity,
        category: category
      });
      
      if (pointsResult.success) {
        // Show success toast
        toastManager.success(pointsResult.message);
        
        // Show collection drive fulfillment modal
        showMaterialBankCollectionDrive(materialName, quantity, transactionId, pointsResult);
        
        // Clear form
        materialbankForm.reset();
      } else {
        toastManager.error(pointsResult.message);
      }
    });
  }
});

/**
 * Log return in ReturnBox
 */
function logReturnBox(itemId, quantity, condition, transactionId) {
  const log = document.getElementById('returnbox-log');
  if (!log) return;
  
  // Initialize if empty
  if (log.querySelector('p:contains("No returns")')) {
    log.innerHTML = '';
  }
  
  const entry = document.createElement('div');
  entry.className = 'text-muted text-sm p-2 bg-gray-900 rounded mb-2';
  entry.innerHTML = `
    <div class=\"flex justify-between mb-1\">
      <strong>${itemId} (x${quantity})</strong>
      <span class=\"text-xs\">${new Date().toLocaleTimeString()}</span>
    </div>
    <div class=\"text-xs text-gray-500\">Condition: ${condition} | ID: ${transactionId.substring(0, 20)}...</div>
  `;
  log.insertBefore(entry, log.firstChild);
  
  // Keep only last 5
  while (log.children.length > 5) {
    log.removeChild(log.lastChild);
  }
}

/**
 * Show ReturnBox Collection Drive Flow
 */
function showReturnBoxCollectionDrive(itemId, quantity, transactionId, pointsResult) {
  if (!window.collectionDriveSystem || !window.fulfillmentModal) {
    console.error('Collection Drive System not available');
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
    ecoPointsMessage: `+20 EcoPoints added for your donation of ${quantity}x ${itemId} 🌱`,
    nextCollection: nextCollection,
    selectedHub: nearestHub,
    itemName: `${quantity}x ${itemId}`,
    transactionId: transactionId,
    level: 3,
  });
}

/**
 * Show MaterialBank Collection Drive Flow
 */
function showMaterialBankCollectionDrive(materialName, quantity, transactionId, pointsResult) {
  if (!window.collectionDriveSystem || !window.fulfillmentModal) {
    console.error('Collection Drive System not available');
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
    ecoPointsMessage: `+40 EcoPoints added for your material listing 🌱`,
    nextCollection: nextCollection,
    selectedHub: nearestHub,
    itemName: `${quantity} kg ${materialName}`,
    transactionId: transactionId,
    level: 4,
  });
}
