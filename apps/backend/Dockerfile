# Backend Dockerfile
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY .env ./.env

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "dev"]
