FROM node:16-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar archivos del proyecto
COPY . .

# Exponer puerto
EXPOSE 5001

# Comando para iniciar la aplicación
CMD ["npm", "start"]