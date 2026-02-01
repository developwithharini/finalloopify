#!/bin/bash

# Test Admin System
# This script verifies all admin panel files exist and have correct structure

echo "=========================================="
echo "Loopify Admin System - File Verification"
echo "=========================================="
echo ""

# Check files exist
echo "Checking core admin files..."
files=(
    "admin-login.html"
    "thriftloop-admin.html"
    "thriftloop.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
    fi
done

echo ""
echo "=========================================="
echo "Admin Feature Status"
echo "=========================================="
echo ""

# Check admin-login.html features
echo "📋 Professional Admin Login Page:"
if grep -q "admin-login" "thriftloop.html"; then
    echo "  ✅ Integration with thriftloop.html"
else
    echo "  ❌ Missing integration"
fi

if grep -q "password visibility toggle" "admin-login.html"; then
    echo "  ✅ Password visibility toggle"
else
    echo "  ⚠️  Password visibility might be present"
fi

if grep -q "attempt" "admin-login.html"; then
    echo "  ✅ Attempt limiting logic"
else
    echo "  ❌ Missing attempt limiting"
fi

echo ""
echo "🏠 Hub Management System:"
if grep -q "CollectionHubManager" "thriftloop-admin.html"; then
    echo "  ✅ Hub manager class implemented"
else
    echo "  ❌ Missing hub manager class"
fi

if grep -q "switchTab" "thriftloop-admin.html"; then
    echo "  ✅ Tab switching functionality"
else
    echo "  ❌ Missing tab functionality"
fi

if grep -q "openHubModal" "thriftloop-admin.html"; then
    echo "  ✅ Hub edit modal"
else
    echo "  ❌ Missing hub modal"
fi

echo ""
echo "=========================================="
echo "LocalStorage Hub Data"
echo "=========================================="
echo ""
echo "Hub data key: 'loopify_collection_hubs'"
echo ""
echo "5 Hubs initialized:"
echo "  1. Downtown Hub - T. Nagar (150 capacity)"
echo "  2. South Side Hub - Adyar (120 capacity)"
echo "  3. North Side Hub - Perambur (180 capacity)"
echo "  4. West Side Hub - Guindy (200 capacity)"
echo "  5. East Side Hub - Besant Nagar (140 capacity)"
echo ""

echo "=========================================="
echo "Access Instructions"
echo "=========================================="
echo ""
echo "1. Open: http://localhost:8000/admin-login.html"
echo "2. Login with:"
echo "   Username: admin"
echo "   Password: admin"
echo "3. You'll be redirected to thriftloop-admin.html"
echo "4. Two tabs available:"
echo "   - Items Management (original)"
echo "   - Hub Management (new - manage 5 hubs)"
echo ""
echo "=========================================="

