FROM node:20-alpine

# Use /usr/src/app as working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Expose port 5000
EXPOSE 5000

# Start development mode (with nodemon)
CMD ["npm", "run", "dev"]
