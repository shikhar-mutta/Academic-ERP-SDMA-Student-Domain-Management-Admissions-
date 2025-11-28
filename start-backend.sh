#!/bin/bash

# Script to start only the backend
# Usage: ./start-backend.sh

cd "$(dirname "$0")/backend"

if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw spring-boot:run
else
    mvn spring-boot:run
fi

