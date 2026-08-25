# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for optimal caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy all backend source code
COPY . .

# Expose API port
EXPOSE 5000

# Command to start the application
CMD ["npm", "start"]