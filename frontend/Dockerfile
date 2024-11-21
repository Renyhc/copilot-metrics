# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .

# EXPOSE 8080

# CMD ["npm", "start"]

# Build stage

FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config if you have custom configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Update nginx config to listen on port 8080
RUN sed -i 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]