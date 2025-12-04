#!/bin/bash

# Script pour configurer Docker et désactiver Podman

set -e

echo "🐳 Configuration de Docker..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Docker...${NC}"
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    echo -e "${GREEN}✅ Docker installé${NC}"
else
    echo -e "${GREEN}✅ Docker est déjà installé${NC}"
    docker --version
fi

# Ajouter l'utilisateur au groupe docker
echo ""
echo -e "${BLUE}👤 Ajout de l'utilisateur au groupe docker...${NC}"
sudo usermod -aG docker $USER

# Désactiver l'émulation Podman
echo ""
echo -e "${BLUE}🔧 Désactivation de l'émulation Docker par Podman...${NC}"
sudo touch /etc/containers/nodocker 2>/dev/null || echo "Fichier nodocker déjà présent ou Podman non installé"

# Installer Docker Compose
echo ""
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installation de Docker Compose...${NC}"
    sudo apt update
    sudo apt install -y docker-compose-plugin
    echo -e "${GREEN}✅ Docker Compose installé${NC}"
else
    echo -e "${GREEN}✅ Docker Compose est déjà installé${NC}"
    docker compose version 2>/dev/null || docker-compose --version
fi

# Démarrer le service Docker
echo ""
echo -e "${BLUE}🚀 Démarrage du service Docker...${NC}"
sudo systemctl enable docker
sudo systemctl start docker

# Vérifier que Docker fonctionne
echo ""
echo -e "${BLUE}🔍 Vérification de Docker...${NC}"
if sudo docker run --rm hello-world > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker fonctionne correctement !${NC}"
else
    echo -e "${RED}❌ Erreur lors du test de Docker${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Configuration terminée !${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT : Vous devez vous déconnecter et vous reconnecter${NC}"
echo -e "${YELLOW}   pour que les changements de groupe prennent effet.${NC}"
echo ""
echo "Après reconnexion, vous pourrez utiliser :"
echo "  docker ps"
echo "  docker-compose up"
echo "  ./start-docker.sh"
echo ""
