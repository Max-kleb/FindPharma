#!/bin/bash
# Script pour peupler PostgreSQL en contournant le problème GDAL/Anaconda

set -e

echo "======================================================================"
echo "🚀 SCRIPT DE PEUPLEMENT POSTGRES FINDPHARMA"
echo "======================================================================"

PROJECT_DIR="/home/mitou/FindPharma/FindPharma"
VENV_DIR="/home/mitou/FindPharma/venv_system"

cd /home/mitou/FindPharma

# Créer un environnement virtuel propre avec Python système
if [ ! -d "$VENV_DIR" ]; then
    echo ""
    echo "🐍 Création d'un environnement virtuel Python système..."
    /usr/bin/python3 -m venv "$VENV_DIR"
    echo "✅ Environnement virtuel créé"
else
    echo "✅ Environnement virtuel existe déjà"
fi

# Activer l'environnement
echo ""
echo "🔧 Activation de l'environnement virtuel..."
source "$VENV_DIR/bin/activate"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r "$PROJECT_DIR/clean-requirements.txt"

cd "$PROJECT_DIR"

# Vérifier PostgreSQL
echo ""
echo "🔍 Vérification de PostgreSQL..."
if ! sudo -u postgres psql -c '\l' > /dev/null 2>&1; then
    echo "❌ PostgreSQL n'est pas accessible"
    exit 1
fi
echo "✅ PostgreSQL est actif"

# Vérifier/créer la base findpharma
echo ""
echo "🔍 Vérification de la base findpharma..."
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw findpharma; then
    echo "📝 Création de la base findpharma..."
    sudo -u postgres createdb findpharma
    sudo -u postgres psql -d findpharma -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    echo "✅ Base findpharma créée avec PostGIS"
else
    echo "✅ Base findpharma existe"
    # Vérifier PostGIS
    if sudo -u postgres psql -d findpharma -c "SELECT PostGIS_version();" > /dev/null 2>&1; then
        echo "✅ PostGIS est activé"
    else
        echo "📝 Activation de PostGIS..."
        sudo -u postgres psql -d findpharma -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    fi
fi

# Créer les migrations
echo ""
echo "🔄 Création des migrations..."
python manage.py makemigrations

# Appliquer les migrations
echo ""
echo "🔄 Application des migrations..."
python manage.py migrate

# Peupler la base
echo ""
echo "🌱 Peuplement de la base de données..."
python populate_database.py

echo ""
echo "======================================================================"
echo "✅ PEUPLEMENT TERMINÉ AVEC SUCCÈS!"
echo "======================================================================"
echo ""
echo "📊 Pour voir les données:"
echo "  sudo -u postgres psql -d findpharma -c 'SELECT count(*) FROM pharmacies_pharmacy;'"
echo ""
echo "🌐 Pour démarrer le serveur:"
echo "  source $VENV_DIR/bin/activate"
echo "  cd $PROJECT_DIR"
echo "  python manage.py runserver"
echo ""
echo "📚 Documentation API: http://127.0.0.1:8000/api/docs/"
echo "======================================================================"
