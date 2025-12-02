# Dockerfile multi-stage pour le frontend React
FROM node:20-alpine AS build

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --silent

# Copier tout le code source
COPY . .

# Build de l'application React
RUN npm run build

# Stage 2: Serveur Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers build depuis l'étape précédente
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
