#!/bin/bash

# Script de migration automatique pour User Story 3
echo "🚀 Migration FindPharma - User Story 3 (Automatique)"
echo "======================================================"

# Activer l'environnement virtuel
source /home/mitou/FindPharma/venv_system/bin/activate

# Aller dans le dossier du projet
cd /home/mitou/FindPharma/FindPharma

echo ""
echo "📦 Sauvegarde des données actuelles..."
python manage.py dumpdata pharmacies medicines stocks --indent 2 > backup_user_story_3_$(date +%Y%m%d_%H%M%S).json
echo "✅ Sauvegarde créée"

echo ""
echo "🗑️  Suppression des anciennes migrations users..."
rm -rf users/migrations
mkdir -p users/migrations
touch users/migrations/__init__.py
echo "✅ Dossier migrations recréé"

echo ""
echo "📝 Création des nouvelles migrations..."
python manage.py makemigrations users

echo ""
echo "🗑️  Suppression des tables auth dans PostgreSQL..."
PGPASSWORD="mitou" psql -U findpharmauser -d findpharma -h localhost <<EOF
DROP TABLE IF EXISTS auth_user_groups CASCADE;
DROP TABLE IF EXISTS auth_user_user_permissions CASCADE;
DROP TABLE IF EXISTS auth_user CASCADE;
DROP TABLE IF EXISTS authtoken_token CASCADE;
DROP TABLE IF EXISTS users_user_groups CASCADE;
DROP TABLE IF EXISTS users_user_user_permissions CASCADE;
DROP TABLE IF EXISTS users_user CASCADE;
EOF

echo ""
echo "✅ Tables supprimées"
echo ""
echo "📊 Application des migrations..."
python manage.py migrate

echo ""
echo "✅ Migrations appliquées avec succès!"
echo ""
echo "👤 Pour créer un nouveau superutilisateur, lancez:"
echo "   python manage.py createsuperuser --username admin --email admin@findpharma.cm"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Créer le superutilisateur avec la commande ci-dessus"
echo "   2. Créer des utilisateurs pharmacie depuis l'admin"
echo "   3. Associer chaque utilisateur à une pharmacie"
echo "   4. Tester les endpoints de gestion des stocks"
echo ""
