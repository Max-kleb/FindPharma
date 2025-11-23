#!/bin/bash

# Script complet de migration pour User Story 3
# Utilise l'utilisateur postgres pour éviter les problèmes de permissions

echo "🚀 Migration complète FindPharma - User Story 3"
echo "==============================================="

# Activer l'environnement virtuel
source /home/mitou/FindPharma/environments/venv_system/bin/activate

# Aller dans le dossier du projet
cd /home/mitou/FindPharma/backend

echo ""
echo "📦 Sauvegarde des données actuelles..."
python manage.py dumpdata pharmacies medicines stocks --indent 2 > backup_complete_$(date +%Y%m%d_%H%M%S).json
echo "✅ Sauvegarde créée"

echo ""
echo "🗑️  Suppression complète de la base de données..."
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS findpharma;
CREATE DATABASE findpharma;
GRANT ALL PRIVILEGES ON DATABASE findpharma TO findpharmauser;
EOF

echo ""
echo "🔧 Activation de PostGIS..."
sudo -u postgres psql -d findpharma <<EOF
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER DATABASE findpharma OWNER TO findpharmauser;
EOF

echo ""
echo "📝 Application de toutes les migrations..."
python manage.py migrate

echo ""
echo "📥 Restauration des données..."
python manage.py loaddata backup_complete_*.json

echo ""
echo "✅ Migration terminée avec succès!"
echo ""
echo "👤 Créons maintenant le superutilisateur admin..."
python manage.py createsuperuser --username admin --email admin@findpharma.cm

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Démarrer le serveur: python manage.py runserver"
echo "   2. Créer des utilisateurs pharmacie depuis l'admin"
echo "   3. Tester les endpoints de gestion des stocks"
echo ""
