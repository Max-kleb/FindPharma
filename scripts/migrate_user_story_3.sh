#!/bin/bash

# Script de migration pour User Story 3
# Mise à jour du modèle User et ajout de la gestion des stocks

echo "🚀 Migration FindPharma - User Story 3"
echo "======================================"
echo ""
echo "⚠️  ATTENTION: Cette migration va :"
echo "   - Modifier le modèle User (ajout du lien vers Pharmacy)"
echo "   - Recréer les tables auth_user"
echo "   - Vous devrez recréer les utilisateurs après"
echo ""
read -p "Voulez-vous continuer ? (o/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]
then
    echo "❌ Migration annulée"
    exit 1
fi

# Activer l'environnement virtuel
source /home/mitou/FindPharma/venv_system/bin/activate

# Aller dans le dossier du projet
cd /home/mitou/FindPharma/FindPharma

echo ""
echo "📦 Sauvegarde des données actuelles..."
python manage.py dumpdata pharmacies medicines stocks --indent 2 > backup_user_story_3.json

echo "✅ Sauvegarde créée: backup_user_story_3.json"
echo ""
echo "🗑️  Suppression des anciennes migrations users..."

# Supprimer les anciennes migrations users (sauf __init__.py)
find users/migrations -type f -name "*.py" ! -name "__init__.py" -delete
find users/migrations -type f -name "*.pyc" -delete

echo "✅ Anciennes migrations supprimées"
echo ""
echo "📝 Création des nouvelles migrations..."

# Créer les nouvelles migrations
python manage.py makemigrations users

echo ""
echo "⚠️  Pour appliquer les migrations, vous devez :"
echo "   1. Supprimer les tables auth_user existantes dans PostgreSQL"
echo "   2. Lancer: python manage.py migrate"
echo ""
echo "Voulez-vous que je le fasse automatiquement ? (o/N)"
read -p "" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]
then
    echo ""
    echo "🗑️  Suppression des tables auth dans PostgreSQL..."
    
    sudo -u postgres psql -d findpharma <<EOF
DROP TABLE IF EXISTS auth_user_groups CASCADE;
DROP TABLE IF EXISTS auth_user_user_permissions CASCADE;
DROP TABLE IF EXISTS auth_user CASCADE;
DROP TABLE IF EXISTS users_user_groups CASCADE;
DROP TABLE IF EXISTS users_user_user_permissions CASCADE;
DROP TABLE IF EXISTS users_user CASCADE;
EOF
    
    echo "✅ Tables supprimées"
    echo ""
    echo "📊 Application des migrations..."
    
    python manage.py migrate
    
    echo ""
    echo "✅ Migrations appliquées avec succès!"
    echo ""
    echo "👤 Création d'un nouveau superutilisateur..."
    echo "   Username: admin"
    echo "   Email: admin@findpharma.cm"
    
    python manage.py createsuperuser --username admin --email admin@findpharma.cm
    
    echo ""
    echo "✅ Migration terminée avec succès!"
    echo ""
    echo "📝 Prochaines étapes:"
    echo "   1. Créer des utilisateurs pharmacie depuis l'admin"
    echo "   2. Associer chaque utilisateur à une pharmacie"
    echo "   3. Tester les endpoints de gestion des stocks"
else
    echo ""
    echo "ℹ️  Migration manuelle requise:"
    echo ""
    echo "1. Connectez-vous à PostgreSQL:"
    echo "   sudo -u postgres psql -d findpharma"
    echo ""
    echo "2. Supprimez les tables auth:"
    echo "   DROP TABLE IF EXISTS auth_user_groups CASCADE;"
    echo "   DROP TABLE IF EXISTS auth_user_user_permissions CASCADE;"
    echo "   DROP TABLE IF EXISTS auth_user CASCADE;"
    echo "   DROP TABLE IF EXISTS users_user_groups CASCADE;"
    echo "   DROP TABLE IF EXISTS users_user_user_permissions CASCADE;"
    echo "   DROP TABLE IF EXISTS users_user CASCADE;"
    echo ""
    echo "3. Appliquez les migrations:"
    echo "   python manage.py migrate"
    echo ""
    echo "4. Recréez le superutilisateur:"
    echo "   python manage.py createsuperuser"
fi
