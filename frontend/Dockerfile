FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Run with legacy-peer-deps consistent with earlier setup
RUN npm install --legacy-peer-deps

COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start Vite in dev mode and bind to all interfaces for Docker host access
CMD ["npm", "run", "dev", "--", "--host"]
