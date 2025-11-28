#!/bin/bash

# Script to run frontend in watch mode
# Vite provides Hot Module Replacement (HMR) for instant updates
# Usage: ./watch-frontend.sh

set -e

cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Frontend - Watch Mode (Vite HMR)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check prerequisites
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed or not in PATH${NC}"
    exit 1
fi

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}\n"
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping frontend...${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Vite dev server (already in watch mode with HMR)
echo -e "${GREEN}🚀 Starting Vite dev server...${NC}"
echo -e "${BLUE}   🔄 Hot Module Replacement (HMR) enabled${NC}"
echo -e "${BLUE}   📝 Watching for file changes...${NC}\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Watch mode active!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Features:${NC}"
echo -e "${YELLOW}   • Auto-reload on file changes${NC}"
echo -e "${YELLOW}   • Hot Module Replacement (HMR)${NC}"
echo -e "${YELLOW}   • Instant updates without full page reload${NC}"
echo -e "${YELLOW}   • Press Ctrl+C to stop${NC}\n"

# Run Vite dev server
npm run dev



