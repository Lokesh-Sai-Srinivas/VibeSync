# VibeSync React Native App Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port for Expo development server
EXPOSE 8081

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start the Expo development server
CMD ["npm", "start"]
