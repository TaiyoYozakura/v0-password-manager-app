#!/bin/bash

# Vaultly - Repository Cleanup Script
# Removes temporary files, logs, and unused build artifacts

set -e

echo "=========================================="
echo "Vaultly - Repository Cleanup"
echo "=========================================="
echo ""

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to safely remove files/dirs
cleanup_item() {
  local item=$1
  local description=$2
  
  if [ -e "$item" ]; then
    local size=$(du -sh "$item" 2>/dev/null | cut -f1)
    rm -rf "$item"
    echo -e "${GREEN}✓${NC} Removed: $description ($size)"
  fi
}

echo -e "${BLUE}Cleaning up temporary files...${NC}"
echo ""

# Remove environment files
cleanup_item "$PROJECT_ROOT/.env.local" ".env.local"
cleanup_item "$PROJECT_ROOT/.env.development.local" ".env.development.local"

# Remove Next.js build cache
echo -e "${BLUE}Cleaning build caches...${NC}"
cleanup_item "$PROJECT_ROOT/.next/cache" "Next.js cache"
cleanup_item "$PROJECT_ROOT/mobileapp/.expo" "Expo cache"

# Remove build outputs (keep dist-builds)
echo -e "${BLUE}Cleaning build outputs...${NC}"
cleanup_item "$PROJECT_ROOT/mobileapp/android/.gradle" "Android gradle cache"
cleanup_item "$PROJECT_ROOT/mobileapp/android/app/build" "Android build artifacts"
cleanup_item "$PROJECT_ROOT/extension/dist" "Extension dist (rebuild as needed)"

# Remove old test/log files
echo -e "${BLUE}Cleaning log and temporary files...${NC}"
find "$PROJECT_ROOT" -maxdepth 3 -type f \( \
  -name "*.log" \
  -o -name "*.tmp" \
  -o -name ".DS_Store" \
  -o -name "Thumbs.db" \
  -o -name "debug.txt" \
  \) -delete 2>/dev/null && echo -e "${GREEN}✓${NC} Removed temporary files"

echo ""
echo -e "${BLUE}Repository structure after cleanup:${NC}"
du -sh \
  "$PROJECT_ROOT/node_modules" \
  "$PROJECT_ROOT/mobileapp/node_modules" \
  "$PROJECT_ROOT/extension/node_modules" \
  "$PROJECT_ROOT/.next" \
  2>/dev/null | grep -v "^0" || echo "  All cleaned"

echo ""
echo "=========================================="
echo -e "${GREEN}Cleanup complete!${NC}"
echo "=========================================="
echo ""
echo "To rebuild components:"
echo "  ./build-all.sh"
echo ""
