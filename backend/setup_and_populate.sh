#!/bin/bash
# Script pour peupler la base de données PostgreSQL FindPharma
# Gère automatiquement les problèmes GDAL/GCC

set -e

echo "🔧 Configuration de l'environnement..."

# Désactiver les bibliothèques conda qui interfèrent avec GDAL système
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

# Chemin vers l'environnement virtuel
VENV_PATH="/home/mitou/FindPharma/env"
PROJECT_PATH="/home/mitou/FindPharma/FindPharma"

echo "📍 Répertoire du projet: $PROJECT_PATH"
echo "🐍 Environnement virtuel: $VENV_PATH"

cd "$PROJECT_PATH"

# Vérifier que PostgreSQL est actif
echo ""
echo "🔍 Vérification de PostgreSQL..."
if ! sudo -u postgres psql -c '\l' > /dev/null 2>&1; then
    echo "❌ PostgreSQL n'est pas actif ou accessible"
    exit 1
fi
echo "✅ PostgreSQL est actif"

# Vérifier la base findpharma
echo ""
echo "🔍 Vérification de la base findpharma..."
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw findpharma; then
    echo "❌ La base findpharma n'existe pas"
    echo "Création de la base..."
    sudo -u postgres createdb findpharma
    sudo -u postgres psql -d findpharma -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    echo "✅ Base findpharma créée avec PostGIS"
else
    echo "✅ Base findpharma existe"
fi

# Appliquer les migrations
echo ""
echo "🔄 Application des migrations..."
"$VENV_PATH/bin/python" manage.py makemigrations
"$VENV_PATH/bin/python" manage.py migrate

# Peupler la base
echo ""
echo "🌱 Peuplement de la base de données..."
"$VENV_PATH/bin/python" populate_database.py

echo ""
echo "✅ Script terminé avec succès!"
echo "🌐 Serveur disponible sur: http://127.0.0.1:8000/"
echo "📚 Documentation API: http://127.0.0.1:8000/api/docs/"
