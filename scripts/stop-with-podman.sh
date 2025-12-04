#!/bin/bash

# Script pour arrêter FindPharma avec Podman

set -e

echo "🛑 Arrêt de FindPharma..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Arrêter les conteneurs
echo -e "${BLUE}Arrêt des conteneurs...${NC}"
podman stop findpharma-frontend 2>/dev/null || echo "Frontend déjà arrêté"
podman stop findpharma-backend 2>/dev/null || echo "Backend déjà arrêté"
podman stop findpharma-db 2>/dev/null || echo "Database déjà arrêtée"

echo ""
echo -e "${GREEN}✅ Tous les conteneurs sont arrêtés${NC}"
echo ""
echo "📋 Pour supprimer les conteneurs :"
echo "   podman rm findpharma-frontend findpharma-backend findpharma-db"
echo ""
echo "📋 Pour supprimer les volumes (⚠️  supprime les données) :"
echo "   podman volume rm findpharma_postgres_data findpharma_static findpharma_media"
echo ""
echo "📋 Pour supprimer le réseau :"
echo "   podman network rm findpharma_network"
echo ""
