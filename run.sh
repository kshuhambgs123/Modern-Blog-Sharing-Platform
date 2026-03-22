#!/bin/bash

# 🖋️ Inkwell Startup Script

# 1. Colors for logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}>>> Starting Inkwell Stack...${NC}"

# Ensure we are in the script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 2. Check for node and npm
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v node &> /dev/null
then
    echo -e "${RED}❌ Error: Node.js is not installed or not in PATH.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node $(node -v) detected.${NC}"

# 3. Check for MongoDB (Required for MERN)
# ──────────────────────────────────────────────────────────────
if ! nc -z 127.0.0.1 27017 &> /dev/null
then
    echo -e "${RED}❌ Error: MongoDB is NOT running on port 27017.${NC}"
    echo -e "${RED}Please start MongoDB before running the app.${NC}"
    echo -e "${BLUE}Tip: On Mac, try: brew services start mongodb-community${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MongoDB detected.${NC}"

# 4. Handle Port Conflicts (5000 and 5173)
# ──────────────────────────────────────────────────────────────
echo -e "${BLUE}>>> Checking for port conflicts (5000, 5173)...${NC}"

ports=(5000 5173)

for port in "${ports[@]}"; do
    pid=$(lsof -t -i:"$port")
    if [ ! -z "$pid" ]; then
        echo -e "${RED}⚠️ Port $port in use by PID $pid. Stopping it...${NC}"
        kill -9 "$pid" &> /dev/null
        sleep 1
    fi
done

# 5. Install dependencies if they don't exist
# ──────────────────────────────────────────────────────────────
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}>>> Installing dependencies (this may take a minute)...${NC}"
    npm run install-all
fi

# 6. Start concurrent processes
# ──────────────────────────────────────────────────────────────
echo -e "${BLUE}>>> Launching Services...${NC}"
echo -e "${GREEN}👉 Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}👉 Backend:  http://localhost:5000${NC}"

npm run dev
