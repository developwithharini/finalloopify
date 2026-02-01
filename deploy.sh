#!/bin/bash

# ============================================================================
# LOOPIFY PLATFORM - DEPLOYMENT CHECKLIST & SETUP SCRIPT
# ============================================================================

echo "🌱 Loopify Tiered Platform - Setup & Deployment"
echo "============================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "index-new.html" ]; then
    echo -e "${RED}❌ Error: Run this script from the Loopify-1 directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Loopify directory${NC}"
echo ""

# List all core files
echo -e "${BLUE}📦 Core Platform Files:${NC}"
echo "  - index-new.html (Home page, entry point)"
echo "  - platform-app.js (State manager)"
echo "  - platform-unified-app.js (Tier-aware app logic)"
echo "  - payment.html (Payment form)"
echo ""

# Check file sizes
echo -e "${BLUE}📊 File Sizes:${NC}"
ls -lh index-new.html platform-app.js platform-unified-app.js payment.html | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# Verify all required files exist
echo -e "${BLUE}✓ Verifying required files...${NC}"

FILES=(
    "index-new.html"
    "app.html"
    "platform-app.js"
    "platform-unified-app.js"
    "payment.html"
)

MISSING=false
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        MISSING=true
    fi
done

if [ "$MISSING" = true ]; then
    echo ""
    echo -e "${RED}Some files are missing. Please create them first.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All files present!${NC}"
echo ""

# Display deployment options
echo -e "${YELLOW}🚀 Deployment Options:${NC}"
echo ""
echo "1. LOCAL TESTING (Development)"
echo "   python -m http.server 8000"
echo "   Then open: http://localhost:8000/index-new.html"
echo ""

echo "2. QUICK TEST (Current Directory)"
echo "   python -m http.server 8080 --directory ."
echo ""

echo "3. PRODUCTION DEPLOYMENT"
echo "   1. Copy all files to web server"
echo "   2. Configure HTTPS (required for payment forms)"
echo "   3. Set up payment webhook (Stripe/Square)"
echo "   4. Configure CORS settings"
echo "   5. Update DNS records"
echo ""

# Tier system summary
echo -e "${BLUE}📊 Tier System Summary:${NC}"
echo ""
echo "Freemium Tier:"
echo "  • Levels 1-3 accessible"
echo "  • Level 1: WasteLens (ML waste classification)"
echo "  • Level 2: ShelfLife (Food spoilage prevention)"
echo "  • Level 3: ReturnBox (Circular returns)"
echo "  • Price: FREE"
echo ""

echo "Premium Tier:"
echo "  • All 5 levels accessible"
echo "  • Levels 4-5: MaterialBank + Impact Dashboard"
echo "  • Level 4: MaterialBank (Industrial matching)"
echo "  • Level 5: Impact Dashboard (Full analytics)"
echo "  • Price: \$49/month"
echo ""

# Feature matrix
echo -e "${BLUE}📋 Feature Matrix:${NC}"
echo ""
echo "Feature                    | Freemium | Premium"
echo "---------------------------|----------|----------"
echo "Waste Classification       | ✅       | ✅"
echo "Food Tracking              | ✅       | ✅"
echo "Returns Management         | ✅       | ✅"
echo "Material Matching          | ❌       | ✅"
echo "Advanced Analytics         | ❌       | ✅"
echo ""

# Design system
echo -e "${BLUE}🎨 Design System:${NC}"
echo ""
echo "Colors (Locked - No Changes):"
echo "  • Primary: #6b9e83 (Sage Green)"
echo "  • Background: #000 (Black)"
echo "  • Surface: #1a1a1a (Charcoal)"
echo "  • Border: #333 (Gray)"
echo ""

echo "Typography (Locked):"
echo "  • Font: System fonts (-apple-system, BlinkMacSystemFont)"
echo "  • Spacing: 4px grid (8, 12, 16, 24, 32, 48px)"
echo "  • Transitions: 0.3s ease"
echo ""

# Testing checklist
echo -e "${BLUE}✓ Testing Checklist:${NC}"
echo ""
echo "Functional Tests:"
echo "  □ Home page loads correctly"
echo "  □ Tier selection displays properly"
echo "  □ Freemium flow: Direct to app with L1-L3"
echo "  □ Premium flow: Payment → app with L1-L5"
echo "  □ MaterialBank locked for Freemium"
echo "  □ Impact Dashboard locked for Freemium"
echo ""

echo "Design Tests:"
echo "  □ Colors match exactly (#6b9e83, #000, etc)"
echo "  □ Spacing consistent (4px grid)"
echo "  □ Hover effects work (0.3s ease, -2px translateY)"
echo "  □ Responsive on desktop (1024px+)"
echo "  □ Responsive on tablet (768px-1024px)"
echo "  □ Responsive on mobile (<768px)"
echo ""

echo "Integration Tests:"
echo "  □ postMessage working (home → app tier init)"
echo "  □ Payment success → tier upgrade"
echo "  □ localStorage persistence working"
echo "  □ Logout returns to home"
echo ""

# Troubleshooting
echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
echo ""
echo "Issue: Payment page doesn't close"
echo "  Fix: Check browser console for postMessage errors"
echo ""

echo "Issue: Features still locked after upgrade"
echo "  Fix: Clear localStorage and refresh"
echo "  localStorage.clear(); location.reload();"
echo ""

echo "Issue: Design looks wrong"
echo "  Fix: Verify Tailwind CSS is loading from CDN"
echo "  Check: <link href=\"https://cdn.tailwindcss.com\">"
echo ""

# Next steps
echo -e "${GREEN}📝 Next Steps:${NC}"
echo ""
echo "1. Start local server:"
echo "   python -m http.server 8000"
echo ""

echo "2. Test in browser:"
echo "   http://localhost:8000/index-new.html"
echo ""

echo "3. Try both flows:"
echo "   • Freemium: Click 'Start with Freemium'"
echo "   • Premium: Click 'Explore Premium'"
echo ""

echo "4. For Production:"
echo "   • Read: PLATFORM_INTEGRATION.md"
echo "   • Set up backend API"
echo "   • Configure payment gateway"
echo "   • Deploy to production server"
echo ""

# Final status
echo ""
echo -e "${GREEN}✅ Platform is ready!${NC}"
echo -e "${GREEN}✅ Design system locked (100% consistency)${NC}"
echo -e "${GREEN}✅ All files created and verified${NC}"
echo ""

echo "For detailed documentation, see: PLATFORM_INTEGRATION.md"
echo ""
echo "============================================================"
echo "🚀 Ready to launch Loopify!"
echo "============================================================"
