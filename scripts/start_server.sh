#!/bin/bash

# Script pour démarrer FindPharma facilement

echo "🚀 Démarrage de FindPharma..."
echo ""

# Activer l'environnement virtuel
source /home/mitou/FindPharma/environments/venv_system/bin/activate

# Aller dans le dossier du projet
cd /home/mitou/FindPharma/backend

echo "✅ Environnement activé: venv_system"
echo "✅ Base de données: PostgreSQL (findpharma)"
echo ""
echo "📍 Le serveur démarre sur: http://127.0.0.1:8000/"
echo "📄 Pour tester l'API, ouvrez: file:///home/mitou/FindPharma/backend/test_api.html"
echo ""
echo "⏹️  Pour arrêter le serveur: Ctrl+C"
echo ""

# Démarrer le serveur
python manage.py runserver
