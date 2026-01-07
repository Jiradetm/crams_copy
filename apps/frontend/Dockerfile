# Frontend Dockerfile
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables for API
# Using relative path for ngrok compatibility, proxy target points to backend container
ENV NUXT_PUBLIC_API_BASE=/api
ENV NUXT_API_PROXY_TARGET=http://backend:3001/api/**

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
