#!/bin/bash
# ==========================================
# FindPharma - Script de démarrage
# Compatible Linux, macOS, Windows (Git Bash/WSL)
# ==========================================

set -e

echo ""
echo "🏥 FindPharma - Démarrage de l'application"
echo "=========================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé!"
    echo "   Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Vérifier si Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    error "Docker n'est pas en cours d'exécution!"
    echo "   Démarrez Docker Desktop et réessayez."
    exit 1
fi

success "Docker détecté et en cours d'exécution"

# Vérifier docker compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    error "Docker Compose n'est pas disponible!"
    exit 1
fi

success "Docker Compose: $($DOCKER_COMPOSE version | head -n 1)"

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    warning "Fichier .env non trouvé, création depuis .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        success "Fichier .env créé. Modifiez-le si nécessaire."
    else
        error "Fichier .env.example non trouvé!"
        exit 1
    fi
else
    success "Fichier .env trouvé"
fi

# Arrêter les anciens conteneurs si présents
info "Arrêt des anciens conteneurs..."
$DOCKER_COMPOSE down --remove-orphans 2>/dev/null || true

# Construire et démarrer les conteneurs
info "Construction et démarrage des conteneurs..."
$DOCKER_COMPOSE up -d --build

# Attendre que les services soient prêts
info "Attente du démarrage des services..."
echo ""

# Attendre la base de données
echo -n "   Base de données: "
for i in {1..30}; do
    if $DOCKER_COMPOSE exec -T db pg_isready -U findpharmauser -d findpharma &>/dev/null; then
        echo -e "${GREEN}OK${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Attendre le backend
echo -n "   Backend Django: "
for i in {1..60}; do
    if curl -s http://localhost:8000/api/ &>/dev/null; then
        echo -e "${GREEN}OK${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Attendre le frontend
echo -n "   Frontend React: "
for i in {1..30}; do
    if curl -s http://localhost:3000 &>/dev/null; then
        echo -e "${GREEN}OK${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "=========================================="
success "FindPharma est prêt!"
echo ""
echo "🌐 URLs d'accès:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:8000"
echo "   - API Docs:  http://localhost:8000/api/docs/"
echo "   - Admin:     http://localhost:8000/admin/"
echo ""
echo "📋 Commandes utiles:"
echo "   - Arrêter:   $DOCKER_COMPOSE down"
echo "   - Logs:      $DOCKER_COMPOSE logs -f"
echo "   - Redémarrer: $DOCKER_COMPOSE restart"
echo ""
echo "👤 Compte admin par défaut:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
