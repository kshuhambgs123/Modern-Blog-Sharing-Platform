#!/bin/bash

# 🐳 Inkwell Docker Startup Script

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}>>> Starting Inkwell with Docker Compose...${NC}"

# 1. Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not running.${NC}"
    echo -e "${RED}Please open 'Docker Desktop' and wait for it to start.${NC}"
    exit 1
fi

# 2. Check for outside processes on ports 5000 and 5173
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

# 3. Force stop and clean up ANY existing containers
echo -e "${BLUE}>>> Stopping and removing any previous containers...${NC}"
docker compose down -v --remove-orphans &> /dev/null

# 3. Build and Start
echo -e "${BLUE}>>> Building and launching containers (In the background)...${NC}"
# --build ensures any code changes you made are reflected in the image
docker compose up --build -d

# 4. Success Status
echo -e "${GREEN}✅ Project is running in the background!${NC}"
echo -e "Frontend:  http://localhost:5173"
echo -e "Backend:   http://localhost:5000"
echo -e "\nTo see logs, run: ${BLUE}docker compose logs -f${NC}"
echo -e "To stop, run:     ${BLUE}docker compose down${NC}"
