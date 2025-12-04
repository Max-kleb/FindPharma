#!/bin/bash

# Script pour vérifier l'état de FindPharma

echo "🔍 Vérification de l'état de FindPharma"
echo "=========================================="
echo ""

# Images
echo "📦 Images disponibles :"
podman images | grep -E "(REPOSITORY|findpharma)" || echo "Aucune image FindPharma trouvée"
echo ""

# Conteneurs en cours
echo "🚀 Conteneurs en cours d'exécution :"
podman ps --filter "name=findpharma" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "Aucun conteneur FindPharma en cours"
echo ""

# Conteneurs arrêtés
echo "⏸️  Conteneurs arrêtés :"
podman ps -a --filter "name=findpharma" --filter "status=exited" --format "table {{.Names}}\t{{.Status}}" || echo "Aucun conteneur arrêté"
echo ""

# Réseaux
echo "🌐 Réseaux :"
podman network ls | grep -E "(NAME|findpharma)" || echo "Réseau FindPharma non créé"
echo ""

# Volumes
echo "💾 Volumes :"
podman volume ls | grep -E "(DRIVER|findpharma)" || echo "Volumes FindPharma non créés"
echo ""

# Processus de build
echo "🔨 Processus de construction en cours :"
pgrep -a podman | grep build || echo "Aucun build en cours"
echo ""

echo "✅ Vérification terminée"
