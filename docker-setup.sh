#!/bin/bash

# Script de démarrage rapide pour FindPharma avec Docker

set -e

echo "🐳 FindPharma - Installation Docker"
echo "===================================="
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé !"
    echo "📥 Installez Docker : https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé !"
    echo "📥 Installez Docker Compose : https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"
echo ""

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "📋 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  ATTENTION : Modifiez le fichier .env avec vos vraies valeurs !"
    echo "   Éditez : nano .env"
    echo ""
    read -p "   Appuyez sur Entrée pour continuer..."
fi

# Construire les images
echo "🏗️  Construction des images Docker..."
docker-compose build

echo ""
echo "🚀 Démarrage des services..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage complet (30 secondes)..."
sleep 30

echo ""
echo "🔄 Exécution des migrations..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "📊 Collecte des fichiers statiques..."
docker-compose exec -T backend python manage.py collectstatic --noinput

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🌐 Accès à l'application :"
echo "   - Frontend : http://localhost"
echo "   - Backend API : http://localhost:8000/api"
echo "   - Admin Django : http://localhost:8000/admin"
echo ""
echo "👤 Créez un superutilisateur :"
echo "   docker-compose exec backend python manage.py createsuperuser"
echo "   OU : make createsuperuser"
echo ""
echo "📊 Peupler la base de données (optionnel) :"
echo "   docker-compose exec backend python populate_database.py"
echo "   OU : make populate"
echo ""
echo "📋 Voir les logs :"
echo "   docker-compose logs -f"
echo "   OU : make logs"
echo ""
echo "🛑 Arrêter les services :"
echo "   docker-compose down"
echo "   OU : make down"
echo ""
echo "📖 Documentation complète : voir DOCKER_GUIDE.md"
