#!/bin/bash

# Script to start both backend and frontend services
# Usage: ./start.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Academic ERP Application...${NC}\n"

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}❌ Java is not installed or not in PATH${NC}"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm is not installed or not in PATH${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}📦 Starting Backend (Spring Boot)...${NC}"
cd backend
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw spring-boot:run > ../backend.log 2>&1 &
else
    mvn spring-boot:run > ../backend.log 2>&1 &
fi
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${YELLOW}❌ Backend failed to start. Check backend.log for details${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "${BLUE}   Backend running on: http://localhost:8080${NC}"
echo -e "${BLUE}   Logs: backend.log${NC}\n"

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend (Vite)...${NC}"
cd frontend/academic-erp-frotnend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing frontend dependencies...${NC}"
    npm install
fi

npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait a bit for frontend to start
sleep 2

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${YELLOW}❌ Frontend failed to start. Check frontend.log for details${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "${BLUE}   Frontend running on: http://localhost:5173${NC}"
echo -e "${BLUE}   Logs: frontend.log${NC}\n"

echo -e "${GREEN}✨ Both services are running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Backend:  http://localhost:8080${NC}"
echo -e "${BLUE}   Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}\n"

# Wait for both processes
wait

