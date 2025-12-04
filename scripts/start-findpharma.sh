#!/bin/bash

# 🚀 Script de lancement rapide de FindPharma avec Docker
# Ce script vérifie l'environnement et lance l'application

set -e

echo ""
echo "🏥 FindPharma - Lancement de la Conteneurisation"
echo "================================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

# Étape 1 : Vérifier Docker
echo "🔍 Étape 1/6 : Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé !"
    echo ""
    print_info "Pour installer Docker, exécutez :"
    echo "    sudo ./install-docker.sh"
    echo ""
    print_info "Ou installez manuellement depuis : https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker est installé : $(docker --version)"

# Étape 2 : Vérifier Docker Compose
echo ""
echo "🔍 Étape 2/6 : Vérification de Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose n'est pas installé !"
    echo ""
    print_info "Pour installer Docker Compose, exécutez :"
    echo "    sudo ./install-docker.sh"
    exit 1
fi

# Déterminer la commande docker compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    print_success "Docker Compose est installé : $(docker compose version)"
else
    DOCKER_COMPOSE="docker-compose"
    print_success "Docker Compose est installé : $(docker-compose --version)"
fi

# Étape 3 : Vérifier le fichier .env
echo ""
echo "🔍 Étape 3/6 : Vérification du fichier .env..."
if [ ! -f .env ]; then
    print_warning "Fichier .env introuvable. Création depuis .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Fichier .env créé"
        print_warning "⚠️  IMPORTANT : Modifiez le fichier .env avec vos vraies valeurs !"
        echo ""
        read -p "Voulez-vous éditer .env maintenant ? (o/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        print_error ".env.example introuvable !"
        exit 1
    fi
else
    print_success "Fichier .env existe"
fi

# Étape 4 : Arrêter les conteneurs existants
echo ""
echo "🛑 Étape 4/6 : Arrêt des conteneurs existants (si présents)..."
$DOCKER_COMPOSE down 2>/dev/null || true
print_success "Conteneurs arrêtés"

# Étape 5 : Construire les images
echo ""
echo "🏗️  Étape 5/6 : Construction des images Docker..."
print_info "Cela peut prendre 5-10 minutes la première fois..."
echo ""
$DOCKER_COMPOSE build
print_success "Images construites avec succès"

# Étape 6 : Démarrer les services
echo ""
echo "🚀 Étape 6/6 : Démarrage des services..."
$DOCKER_COMPOSE up -d
print_success "Services démarrés"

# Attendre que les services soient prêts
echo ""
echo "⏳ Attente du démarrage complet des services..."
sleep 10

# Vérifier le statut des services
echo ""
echo "📊 Statut des services :"
$DOCKER_COMPOSE ps

# Afficher les informations finales
echo ""
echo "🎉 =========================================="
print_success "FindPharma est maintenant en cours d'exécution !"
echo "============================================"
echo ""
echo "🌐 Accès à l'application :"
echo "   • Frontend :        http://localhost"
echo "   • Backend API :     http://localhost:8000/api"
echo "   • Admin Django :    http://localhost:8000/admin"
echo "   • API Docs :        http://localhost:8000/api/docs"
echo ""
echo "👤 Créer un superutilisateur (admin) :"
echo "   $DOCKER_COMPOSE exec backend python manage.py createsuperuser"
echo "   OU : make createsuperuser"
echo ""
echo "📊 Peupler avec des données de test :"
echo "   $DOCKER_COMPOSE exec backend python populate_database.py"
echo "   OU : make populate"
echo ""
echo "📋 Voir les logs en temps réel :"
echo "   $DOCKER_COMPOSE logs -f"
echo "   OU : make logs"
echo ""
echo "🛑 Arrêter l'application :"
echo "   $DOCKER_COMPOSE down"
echo "   OU : make down"
echo ""
echo "📖 Aide complète : make help"
echo ""
