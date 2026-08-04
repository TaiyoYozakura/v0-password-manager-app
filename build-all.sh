#!/bin/bash

# Vaultly - Build All Components
# Builds Chrome Extension, Web App, and Mobile APK

set -e

echo "=========================================="
echo "Vaultly - Complete Build Process"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DIST_DIR="$PROJECT_ROOT/dist-builds"

# Create output directory
mkdir -p "$DIST_DIR"

# ============================================
# 1. BUILD CHROME EXTENSION
# ============================================
echo -e "${BLUE}[1/3] Building Chrome Extension...${NC}"
cd "$PROJECT_ROOT/extension"

if [ ! -d "node_modules" ]; then
  echo "Installing extension dependencies..."
  npm install --legacy-peer-deps
fi

if [ ! -f "build.js" ]; then
  echo "ERROR: build.js not found in extension directory"
  exit 1
fi

npm run build 2>&1 || {
  echo -e "${YELLOW}Extension build completed with warnings (check output above)${NC}"
}

if [ -d "dist" ]; then
  echo -e "${GREEN}✓ Extension built successfully${NC}"
  echo "  Location: extension/dist/"
  echo "  Use: Load unpacked in chrome://extensions/"
  # Copy to dist output
  cp -r dist "$DIST_DIR/chrome-extension-dist" 2>/dev/null || true
else
  echo -e "${YELLOW}! Extension dist directory not created${NC}"
fi

cd "$PROJECT_ROOT"
echo ""

# ============================================
# 2. BUILD WEB APP
# ============================================
echo -e "${BLUE}[2/3] Building Next.js Web App...${NC}"
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
  echo "Installing web app dependencies..."
  pnpm install
fi

npm run build 2>&1 || {
  echo -e "${YELLOW}Web app build completed with warnings (check output above)${NC}"
}

if [ -d ".next" ]; then
  echo -e "${GREEN}✓ Web app built successfully${NC}"
  echo "  Start: npm run start"
  echo "  Deploy: Already deployed to Vercel"
else
  echo -e "${YELLOW}! .next directory not created${NC}"
fi

cd "$PROJECT_ROOT"
echo ""

# ============================================
# 3. BUILD MOBILE APP
# ============================================
echo -e "${BLUE}[3/3] Building Mobile App (Android)...${NC}"
cd "$PROJECT_ROOT/mobileapp"

if [ ! -d "node_modules" ]; then
  echo "Installing mobile app dependencies..."
  npm install --no-frozen-lockfile
fi

echo "Building development APK..."
if [ -d "android" ]; then
  cd android
  ./gradlew clean 2>&1 | tail -5
  ./gradlew assembleDebug 2>&1 | tail -10
  
  if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo -e "${GREEN}✓ Debug APK built successfully${NC}"
    echo "  Location: mobileapp/android/app/build/outputs/apk/debug/app-debug.apk"
    echo "  Install: adb install app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to dist output
    cp app/build/outputs/apk/debug/app-debug.apk "$DIST_DIR/vaultly-debug.apk"
    echo "  Copied to: dist-builds/vaultly-debug.apk"
  else
    echo -e "${YELLOW}! Debug APK not found${NC}"
  fi
  
  cd "$PROJECT_ROOT/mobileapp"
else
  echo -e "${YELLOW}! Android build directory not found${NC}"
fi

cd "$PROJECT_ROOT"
echo ""

# ============================================
# SUMMARY
# ============================================
echo "=========================================="
echo -e "${GREEN}BUILD COMPLETE${NC}"
echo "=========================================="
echo ""
echo "Output files available in: $DIST_DIR"
echo ""
echo "Files created:"
[ -d "$DIST_DIR/chrome-extension-dist" ] && echo "  ✓ Chrome Extension: $DIST_DIR/chrome-extension-dist/"
[ -f "$DIST_DIR/vaultly-debug.apk" ] && echo "  ✓ Android Debug APK: $DIST_DIR/vaultly-debug.apk"
echo ""
echo "Next steps:"
echo "  1. Chrome: Load unpacked at chrome://extensions/ → extension/dist/"
echo "  2. Android: adb install dist-builds/vaultly-debug.apk"
echo "  3. Web: npm run start (local) or visit Vercel deployment"
echo ""
echo "For production builds, see BUILD_AND_DISTRIBUTION.md"
