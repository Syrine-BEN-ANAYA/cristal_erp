FROM node:20

WORKDIR /app

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer toutes les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Compiler le projet NestJS
RUN npm run build

EXPOSE 3101

# Lancer l'application
CMD ["node", "dist/main.js"]