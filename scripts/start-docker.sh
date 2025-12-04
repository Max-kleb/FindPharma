#!/bin/bash

# Script pour démarrer FindPharma avec Docker Compose

set -e

echo "🚀 Démarrage de FindPharma avec Docker..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo "Installez Docker avec: curl -fsSL https://get.docker.com | sudo sh"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo "Installez Docker Compose avec: sudo apt install docker-compose-plugin"
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé. Création depuis .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Fichier .env créé${NC}"
    else
        echo -e "${RED}❌ Fichier .env.example non trouvé${NC}"
        exit 1
    fi
fi

# Construire les images
echo -e "${BLUE}🔨 Construction des images Docker...${NC}"
docker-compose build

# Démarrer les services
echo -e "${BLUE}🚀 Démarrage des services...${NC}"
docker-compose up -d

# Attendre que les services soient prêts
echo -e "${YELLOW}⏳ Attente du démarrage des services (30 secondes)...${NC}"
sleep 30

# Afficher les logs
echo ""
echo -e "${GREEN}✅ FindPharma démarré avec succès !${NC}"
echo ""
echo "📋 Services en cours d'exécution :"
docker-compose ps
echo ""
echo "🌐 Accès à l'application :"
echo -e "  Frontend:     ${BLUE}http://localhost${NC}"
echo -e "  Backend API:  ${BLUE}http://localhost:8000/api${NC}"
echo -e "  Admin:        ${BLUE}http://localhost:8000/admin${NC}"
echo ""
echo "📝 Commandes utiles :"
echo "  Logs backend:  docker-compose logs -f backend"
echo "  Logs frontend: docker-compose logs -f frontend"
echo "  Logs database: docker-compose logs -f db"
echo "  Arrêter:       docker-compose down"
echo "  Redémarrer:    docker-compose restart"
echo ""
echo -e "${YELLOW}💡 Pour créer un superuser Django :${NC}"
echo "   docker-compose exec backend python manage.py createsuperuser"
echo ""
echo -e "${YELLOW}💡 Pour voir les logs en temps réel :${NC}"
echo "   docker-compose logs -f"
echo ""
