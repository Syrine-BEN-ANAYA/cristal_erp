# Étape 1 : construire l'application
FROM node:20-alpine AS builder

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --frozen-lockfile

# Copier tout le code source
COPY . .

# Compiler TypeScript en JavaScript
RUN npm run build

# Étape 2 : image finale plus légère
FROM node:20-alpine

WORKDIR /usr/src/app

# Copier uniquement les fichiers nécessaires pour exécuter
COPY package*.json ./
RUN npm install --only=production --frozen-lockfile

# Copier les fichiers compilés depuis l'étape builder
COPY --from=builder /usr/src/app/dist ./dist

# Copier les fichiers .env si nécessaire
COPY .env ./

# Exposer le port de l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "dist/main.js"]