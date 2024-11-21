# Usar una imagen base de Node.js con Alpine Linux
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para canvas
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias con configuración específica para Alpine
RUN npm install --build-from-source=canvas \
    && npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
