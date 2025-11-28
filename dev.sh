#!/bin/bash

# Script to start both backend and frontend in watch/dev mode
# Usage: ./dev.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Academic ERP - Development Mode${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check prerequisites
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed or not in PATH${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed or not in PATH${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend in watch mode (Spring Boot DevTools provides hot reload)
echo -e "${GREEN}📦 Starting Backend (Spring Boot with DevTools)...${NC}"
cd backend

# Check if node_modules needs to be installed for frontend (we'll do it in parallel)
cd ../frontend/academic-erp-frotnend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing frontend dependencies (this may take a moment)...${NC}"
    npm install --silent
fi
cd ../../backend

# Start backend with Maven wrapper or Maven
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw spring-boot:run 2>&1 | sed 's/^/[BACKEND] /' &
else
    mvn spring-boot:run 2>&1 | sed 's/^/[BACKEND] /' &
fi
BACKEND_PID=$!
cd ..

# Give backend a moment to start
sleep 5

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "${BLUE}   🔄 Hot reload enabled via Spring Boot DevTools${NC}"
echo -e "${BLUE}   🌐 Backend: http://localhost:8080${NC}\n"

# Start Frontend in watch mode (Vite HMR)
echo -e "${GREEN}🎨 Starting Frontend (Vite with HMR)...${NC}"
cd frontend/academic-erp-frotnend

npm run dev 2>&1 | sed 's/^/[FRONTEND] /' &
FRONTEND_PID=$!
cd ../..

# Give frontend a moment to start
sleep 3

# Check if frontend is still running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "${BLUE}   🔄 Hot Module Replacement (HMR) enabled${NC}"
echo -e "${BLUE}   🌐 Frontend: http://localhost:5173${NC}\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Both services running in watch/dev mode!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Backend:  http://localhost:8080${NC}"
echo -e "${BLUE}   Frontend: http://localhost:5173${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Watch Mode Features:${NC}"
echo -e "${YELLOW}   • Backend: Auto-reload on Java file changes${NC}"
echo -e "${YELLOW}   • Frontend: Hot Module Replacement (HMR)${NC}"
echo -e "${YELLOW}   • Press Ctrl+C to stop both services${NC}\n"

# Wait for both processes and show their output
wait

