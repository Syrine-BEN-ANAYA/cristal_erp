FROM node:20

WORKDIR /app

# 1️⃣ Mise à jour des paquets système dès le début
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2️⃣ Copier les fichiers package pour installer les dépendances
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 3️⃣ Copier le reste du projet
COPY . .

# 4️⃣ Expose port et CMD
EXPOSE 3101
CMD ["node", "dist/main.js"]