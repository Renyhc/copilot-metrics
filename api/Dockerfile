# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .

# EXPOSE 3000

# CMD ["node", "app.js"]

FROM node:18-alpine

# Install build dependencies for canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci && \
    # Clean up build dependencies if not needed at runtime
    apk del python3 make g++ && \
    # Remove npm cache
    npm cache clean --force

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
