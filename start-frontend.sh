#!/bin/bash

# Script to start only the frontend
# Usage: ./start-frontend.sh

cd "$(dirname "$0")/frontend/academic-erp-frotnend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

npm run watch:nodemon


