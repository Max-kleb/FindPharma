#!/bin/bash

# Script d'installation de Docker et Docker Compose sur Ubuntu/Debian

set -e

echo "🐳 Installation de Docker et Docker Compose"
echo "==========================================="
echo ""

# Vérifier si l'utilisateur est root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Ce script doit être exécuté avec sudo"
    echo "Usage: sudo ./install-docker.sh"
    exit 1
fi

# Mettre à jour les paquets
echo "📦 Mise à jour des paquets..."
apt-get update

# Installer les dépendances
echo "📦 Installation des dépendances..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Ajouter la clé GPG officielle de Docker
echo "🔑 Ajout de la clé GPG Docker..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Ajouter le dépôt Docker
echo "📦 Ajout du dépôt Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Mettre à jour les paquets
apt-get update

# Installer Docker Engine
echo "🐳 Installation de Docker Engine..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Démarrer et activer Docker
echo "🚀 Démarrage de Docker..."
systemctl start docker
systemctl enable docker

# Ajouter l'utilisateur au groupe docker (pour utiliser Docker sans sudo)
if [ -n "$SUDO_USER" ]; then
    echo "👤 Ajout de l'utilisateur $SUDO_USER au groupe docker..."
    usermod -aG docker $SUDO_USER
    echo "⚠️  Déconnectez-vous et reconnectez-vous pour que les changements prennent effet"
fi

# Vérifier l'installation
echo ""
echo "✅ Installation terminée !"
echo ""
docker --version
docker compose version

echo ""
echo "🎉 Docker est maintenant installé !"
echo ""
echo "📌 Prochaines étapes :"
echo "   1. Déconnectez-vous et reconnectez-vous (ou exécutez: newgrp docker)"
echo "   2. Testez Docker avec: docker run hello-world"
echo "   3. Lancez FindPharma avec: ./docker-setup.sh"
echo ""
