#!/bin/bash

# Script to run Java backend in watch mode
# Automatically recompiles on file changes and uses Spring Boot DevTools for auto-restart
# Usage: ./watch-backend.sh

cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   Java Backend - Watch Mode${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check prerequisites
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed or not in PATH${NC}"
    exit 1
fi

# Check if inotifywait is available (for Linux)
if ! command -v inotifywait &> /dev/null; then
    echo -e "${YELLOW}⚠️  inotifywait not found. Installing inotify-tools...${NC}"
    echo -e "${YELLOW}   Run: sudo apt-get install inotify-tools${NC}"
    echo -e "${YELLOW}   Falling back to manual compilation mode...${NC}"
    MANUAL_MODE=true
else
    MANUAL_MODE=false
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping backend...${NC}"
    if [ ! -z "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null || true
        wait $APP_PID 2>/dev/null || true
    fi
    if [ ! -z "$WATCHER_PID" ]; then
        kill $WATCHER_PID 2>/dev/null || true
        wait $WATCHER_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Backend stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Function to compile
compile() {
    echo -e "${BLUE}🔄 Compiling...${NC}"
    if [ -f "./mvnw" ]; then
        chmod +x ./mvnw
        ./mvnw compile -q || return 1
    else
        mvn compile -q || return 1
    fi
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Compilation successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Compilation failed${NC}"
        return 1
    fi
}

# Initial compilation
echo -e "${GREEN}📦 Initial compilation...${NC}"
compile

# Start Spring Boot application
echo -e "${GREEN}🚀 Starting Spring Boot application...${NC}"
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw spring-boot:run &
else
    mvn spring-boot:run &
fi
APP_PID=$!

# Give app a moment to start
sleep 3

# Check if app is still running
if ! kill -0 $APP_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started (PID: $APP_PID)${NC}"
echo -e "${BLUE}   🔄 Watch mode enabled${NC}"
echo -e "${BLUE}   🌐 Backend: http://localhost:8080${NC}"
echo -e "${BLUE}   📝 Watching for Java file changes...${NC}\n"

if [ "$MANUAL_MODE" = false ]; then
    # Watch for Java file changes and recompile
    (
        while true; do
            inotifywait -r -e modify,create,delete --include '\.java$' src/ 2>/dev/null || sleep 1
            if [ $? -eq 0 ]; then
                sleep 0.5  # Small delay to avoid multiple compilations
                compile || true  # Continue even if compilation fails
                # DevTools will automatically restart the app when classes change
            fi
        done
    ) &
    WATCHER_PID=$!
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ Watch mode active!${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}💡 Features:${NC}"
    echo -e "${YELLOW}   • Auto-compile on Java file changes${NC}"
    echo -e "${YELLOW}   • Auto-restart via Spring Boot DevTools${NC}"
    echo -e "${YELLOW}   • Press Ctrl+C to stop${NC}\n"
else
    echo -e "${YELLOW}💡 Manual Mode:${NC}"
    echo -e "${YELLOW}   • Spring Boot DevTools will restart on class changes${NC}"
    echo -e "${YELLOW}   • Manually compile with: mvn compile${NC}"
    echo -e "${YELLOW}   • Or use your IDE's auto-compile feature${NC}\n"
fi

# Keep the script running and monitor the application
echo -e "${BLUE}📊 Monitoring backend (running continuously)...${NC}\n"

# Wait for the application process and restart if it exits unexpectedly
while true; do
    if ! kill -0 $APP_PID 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Backend process exited. Restarting...${NC}"
        sleep 2
        if [ -f "./mvnw" ]; then
            chmod +x ./mvnw
            ./mvnw spring-boot:run &
        else
            mvn spring-boot:run &
        fi
        APP_PID=$!
        sleep 3
        if kill -0 $APP_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Backend restarted (PID: $APP_PID)${NC}"
        fi
    fi
    sleep 5  # Check every 5 seconds
done

