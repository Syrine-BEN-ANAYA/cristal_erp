# Étape 1 : build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Étape 2 : serveur web
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3105
CMD ["nginx", "-g", "daemon off;"]