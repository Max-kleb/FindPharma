#!/bin/bash

# Script pour démarrer FindPharma avec Podman (sans docker-compose)

set -e

echo "🚀 Démarrage de FindPharma avec Podman..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Créer un réseau podman
echo -e "${BLUE}📡 Création du réseau findpharma...${NC}"
podman network exists findpharma_network || podman network create findpharma_network

# Créer les volumes
echo -e "${BLUE}💾 Création des volumes...${NC}"
podman volume exists findpharma_postgres_data || podman volume create findpharma_postgres_data
podman volume exists findpharma_static || podman volume create findpharma_static
podman volume exists findpharma_media || podman volume create findpharma_media

# Démarrer PostgreSQL
echo -e "${BLUE}🐘 Démarrage de PostgreSQL...${NC}"
podman stop findpharma-db 2>/dev/null || true
podman rm findpharma-db 2>/dev/null || true

podman run -d \
  --name findpharma-db \
  --network findpharma_network \
  -e POSTGRES_DB=findpharma_db \
  -e POSTGRES_USER=findpharma_user \
  -e POSTGRES_PASSWORD=findpharma_pass \
  -v findpharma_postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgis/postgis:15-3.3

echo -e "${YELLOW}⏳ Attente du démarrage de PostgreSQL (30 secondes)...${NC}"
sleep 30

# Démarrer le backend
echo -e "${BLUE}🐍 Démarrage du backend Django...${NC}"
podman stop findpharma-backend 2>/dev/null || true
podman rm findpharma-backend 2>/dev/null || true

podman run -d \
  --name findpharma-backend \
  --network findpharma_network \
  -e DATABASE_URL=postgresql://findpharma_user:findpharma_pass@findpharma-db:5432/findpharma_db \
  -e DJANGO_SECRET_KEY=your-secret-key-here-change-in-production \
  -e DEBUG=True \
  -e DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend \
  -e CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:80,http://localhost:3000 \
  -v findpharma_static:/app/staticfiles \
  -v findpharma_media:/app/media \
  -p 8000:8000 \
  findpharma-backend:latest

echo -e "${YELLOW}⏳ Attente du démarrage du backend (20 secondes)...${NC}"
sleep 20

# Démarrer le frontend
echo -e "${BLUE}⚛️  Démarrage du frontend React...${NC}"
podman stop findpharma-frontend 2>/dev/null || true
podman rm findpharma-frontend 2>/dev/null || true

podman run -d \
  --name findpharma-frontend \
  --network findpharma_network \
  -p 80:80 \
  findpharma-frontend:latest

echo ""
echo -e "${GREEN}✅ FindPharma démarré avec succès !${NC}"
echo ""
echo "📋 Conteneurs en cours d'exécution :"
podman ps --filter "name=findpharma"
echo ""
echo "🌐 Accès à l'application :"
echo -e "  Frontend:     ${BLUE}http://localhost${NC}"
echo -e "  Backend API:  ${BLUE}http://localhost:8000/api${NC}"
echo -e "  Admin:        ${BLUE}http://localhost:8000/admin${NC}"
echo ""
echo "📝 Commandes utiles :"
echo "  Logs backend:  podman logs -f findpharma-backend"
echo "  Logs frontend: podman logs -f findpharma-frontend"
echo "  Logs database: podman logs -f findpharma-db"
echo "  Arrêter tout:  podman stop findpharma-backend findpharma-frontend findpharma-db"
echo "  Supprimer:     podman rm findpharma-backend findpharma-frontend findpharma-db"
echo ""
echo -e "${YELLOW}💡 Pour créer un superuser Django :${NC}"
echo "   podman exec -it findpharma-backend python manage.py createsuperuser"
echo ""
