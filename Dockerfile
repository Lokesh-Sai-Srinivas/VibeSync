# VibeSync React Native App Dockerfile
FROM node:18-alpine

# Install required system dependencies for React Native
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports for Expo development
# 8081: Metro Bundler
# 19000-19002: Legacy Expo ports (optional but kept for compatibility)
EXPOSE 8081 19000 19001 19002

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start the Expo development server using npx to avoid global install issues
CMD ["npx", "expo", "start"]
