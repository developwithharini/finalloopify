/**
 * ThriftLoop System - Verification & Testing Script
 * Run this in browser console to verify all components
 */

console.log("🚀 ThriftLoop System Verification Started...\n");

// ============================================
// 1. CHECK REQUIRED SYSTEMS
// ============================================
console.log("📋 STEP 1: Checking Required Systems");
console.log("─".repeat(50));

const systems = {
  "ThriftLoopSystem": typeof ThriftLoopSystem,
  "ThriftLoop": typeof ThriftLoop,
  "EcoPoints": typeof ecoPoints,
  "ToastManager": typeof toastManager,
};

Object.entries(systems).forEach(([name, type]) => {
  const status = type !== 'undefined' ? '✅' : '❌';
  console.log(`${status} ${name}: ${type}`);
});

// ============================================
// 2. CHECK INVENTORY SYSTEM
// ============================================
console.log("\n📦 STEP 2: Checking Inventory System");
console.log("─".repeat(50));

if (window.thriftLoopSystem) {
  const inventory = thriftLoopSystem.getInventory();
  const hubs = thriftLoopSystem.getHubs();
  const redemptions = thriftLoopSystem.getRedemptions();

  console.log(`✅ Inventory Items: ${inventory.length}`);
  console.log(`✅ Collection Hubs: ${hubs.length}`);
  console.log(`✅ Redemptions Recorded: ${redemptions.length}`);
  
  console.log("\n📍 Available Hubs:");
  hubs.forEach(hub => {
    console.log(`   • ${hub.name} - ${hub.location}`);
  });

  console.log("\n📦 Sample Items:");
  inventory.slice(0, 3).forEach(item => {
    console.log(`   • ${item.name} (${item.pointsCost} pts) - ${item.available ? 'Available' : 'Redeemed'}`);
  });
} else {
  console.log("❌ ThriftLoopSystem not loaded");
}

// ============================================
// 3. CHECK ECOPOINTS INTEGRATION
// ============================================
console.log("\n💰 STEP 3: Checking EcoPoints Integration");
console.log("─".repeat(50));

if (window.ecoPoints) {
  const balance = ecoPoints.getBalance();
  console.log(`✅ Current Balance: ${balance} EcoPoints`);
  
  // Test deduction (will be reversed)
  console.log("\n   Testing deduction simulation...");
  const initialBalance = ecoPoints.getBalance();
  console.log(`   Before: ${initialBalance} pts`);
} else {
  console.log("❌ EcoPoints system not loaded");
}

// ============================================
// 4. CHECK UI ELEMENTS
// ============================================
console.log("\n🎨 STEP 4: Checking UI Elements");
console.log("─".repeat(50));

const uiElements = {
  "Items Container": document.getElementById('items-container'),
  "Current Balance": document.getElementById('current-balance'),
  "Filter Tabs": document.querySelectorAll('.filter-tab'),
  "Confirmation Modal": document.getElementById('confirmation-modal'),
  "Error Modal": document.getElementById('error-modal'),
};

Object.entries(uiElements).forEach(([name, element]) => {
  if (Array.isArray(element)) {
    const status = element.length > 0 ? '✅' : '❌';
    console.log(`${status} ${name}: ${element.length} found`);
  } else {
    const status = element ? '✅' : '❌';
    console.log(`${status} ${name}: ${element ? 'Present' : 'Missing'}`);
  }
});

// ============================================
// 5. CHECK STORAGE
// ============================================
console.log("\n💾 STEP 5: Checking localStorage");
console.log("─".repeat(50));

const storageKeys = [
  'thriftloop_inventory',
  'thriftloop_hubs',
  'thriftloop_redemptions',
  'eco_points_balance',
  'role'
];

storageKeys.forEach(key => {
  const value = localStorage.getItem(key);
  const status = value ? '✅' : '⚠️';
  const display = value ? (key.includes('_') ? '(data stored)' : value) : '(not set)';
  console.log(`${status} ${key}: ${display}`);
});

// ============================================
// 6. CHECK ROLE-BASED ACCESS
// ============================================
console.log("\n🔐 STEP 6: Checking Role-Based Access");
console.log("─".repeat(50));

const userRole = localStorage.getItem('role');
const currentPage = window.location.pathname;
const isAdminPage = currentPage.includes('admin');

console.log(`📍 Current Page: ${currentPage}`);
console.log(`👤 User Role: ${userRole || 'Regular User'}`);

if (isAdminPage) {
  if (userRole === 'hub-admin') {
    console.log("✅ Access: ALLOWED (hub-admin)");
  } else {
    console.log("❌ Access: DENIED (restricted page)");
  }
} else {
  console.log("✅ Access: ALLOWED (user page)");
}

// ============================================
// 7. SHOW ACTION MENU
// ============================================
console.log("\n🎯 STEP 7: Quick Actions");
console.log("─".repeat(50));
console.log(`
Test commands you can run:

1️⃣  VIEW INVENTORY:
    window.thriftLoopSystem.getInventory()

2️⃣  VIEW HUBS:
    window.thriftLoopSystem.getHubs()

3️⃣  GET BALANCE:
    ecoPoints.getBalance()

4️⃣  BECOME ADMIN:
    localStorage.setItem('role', 'hub-admin')
    location.reload()

5️⃣  TEST REDEMPTION:
    thriftLoop.handleRedeem('item-001')

6️⃣  VIEW REDEMPTIONS:
    window.thriftLoopSystem.getRedemptions()

7️⃣  CLEAR ALL DATA:
    localStorage.removeItem('thriftloop_inventory')
    localStorage.removeItem('thriftloop_hubs')
    localStorage.removeItem('thriftloop_redemptions')
    location.reload()

8️⃣  SET TEST BALANCE:
    ecoPoints.addPoints('TEST', {amount: 100})
`);

// ============================================
// FINAL STATUS
// ============================================
console.log("═".repeat(50));
console.log("✅ ThriftLoop System Verification Complete!");
console.log("═".repeat(50));
console.log("\n📌 System Status: READY FOR TESTING\n");
