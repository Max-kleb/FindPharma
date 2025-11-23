#!/bin/bash

# Script de démarrage complet FindPharma
# Démarre backend et frontend simultanément

echo "🚀 FindPharma - Démarrage complet"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="/home/mitou/FindPharma"

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$PROJECT_DIR/backend" ] || [ ! -d "$PROJECT_DIR/frontend" ]; then
    echo "❌ Erreur: Répertoires backend/ ou frontend/ introuvables"
    echo "Assurez-vous d'être dans le répertoire FindPharma"
    exit 1
fi

# Fonction pour démarrer le backend
start_backend() {
    echo -e "${BLUE}🐍 Démarrage du backend Django...${NC}"
    cd "$PROJECT_DIR/backend"
    source "$PROJECT_DIR/environments/venv_system/bin/activate"
    python manage.py runserver
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo -e "${GREEN}⚛️  Démarrage du frontend React...${NC}"
    cd "$PROJECT_DIR/frontend"
    
    # Vérifier si node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installation des dépendances npm...${NC}"
        npm install
    fi
    
    npm start
}

# Menu de choix
echo "Que voulez-vous démarrer ?"
echo "1) Backend uniquement (Django)"
echo "2) Frontend uniquement (React)"
echo "3) Les deux (recommandé)"
echo ""
read -p "Votre choix (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}📍 Backend: http://127.0.0.1:8000/${NC}"
        echo ""
        start_backend
        ;;
    2)
        echo ""
        echo -e "${GREEN}📍 Frontend: http://localhost:3000/${NC}"
        echo ""
        start_frontend
        ;;
    3)
        echo ""
        echo -e "${BLUE}📍 Backend: http://127.0.0.1:8000/${NC}"
        echo -e "${GREEN}📍 Frontend: http://localhost:3000/${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Les deux serveurs vont démarrer dans des terminaux séparés${NC}"
        echo -e "${YELLOW}   Fermez cette fenêtre pour arrêter les deux serveurs${NC}"
        echo ""
        
        # Démarrer les deux en arrière-plan avec tmux ou dans des terminaux séparés
        # Option 1: Avec gnome-terminal (si disponible)
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $PROJECT_DIR && source environments/venv_system/bin/activate && cd backend && python manage.py runserver; exec bash"
            sleep 2
            gnome-terminal -- bash -c "cd $PROJECT_DIR/frontend && npm start; exec bash"
            echo -e "${GREEN}✅ Les deux serveurs sont lancés dans des terminaux séparés${NC}"
        else
            echo -e "${YELLOW}⚠️  gnome-terminal non disponible${NC}"
            echo "Démarrage du backend uniquement. Lancez le frontend manuellement :"
            echo "  cd frontend && npm start"
            echo ""
            start_backend
        fi
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac
