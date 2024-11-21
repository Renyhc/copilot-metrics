# Usar una imagen base de Node.js con Alpine Linux
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install && npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
