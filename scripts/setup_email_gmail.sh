#!/bin/bash
# Script pour tester l'envoi d'emails avec Gmail

echo "================================================"
echo "📧 CONFIGURATION EMAIL GMAIL POUR FINDPHARMA"
echo "================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 ÉTAPES À SUIVRE:${NC}"
echo ""
echo "1. Ouvrir le fichier .env:"
echo "   ${YELLOW}nano /home/mitou/FindPharma/backend/.env${NC}"
echo ""
echo "2. Remplacer les lignes:"
echo "   ${YELLOW}EMAIL_HOST_USER=votre.email@gmail.com${NC}"
echo "   ${YELLOW}EMAIL_HOST_PASSWORD=votre_app_password_ici${NC}"
echo ""
echo "3. Créer un App Password Gmail:"
echo "   a) Aller sur: ${BLUE}https://myaccount.google.com/apppasswords${NC}"
echo "   b) Se connecter avec votre compte Gmail"
echo "   c) Créer un nouveau mot de passe d'application"
echo "   d) Choisir 'Application: Autre' et nommer 'FindPharma'"
echo "   e) Copier le mot de passe généré (16 caractères)"
echo ""
echo "4. OU utiliser l'authentification 2FA désactivée:"
echo "   a) Activer 'Accès moins sécurisé' dans Gmail"
echo "   b) Utiliser votre mot de passe Gmail normal"
echo "   c) ${YELLOW}⚠️ Moins sécurisé, pas recommandé${NC}"
echo ""
echo "5. Tester l'envoi:"
echo "   ${GREEN}python manage.py shell${NC}"
echo "   ${GREEN}>>> from django.core.mail import send_mail${NC}"
echo "   ${GREEN}>>> send_mail('Test', 'Message test', 'from@example.com', ['votre@email.com'])${NC}"
echo ""
echo "================================================"
echo ""

read -p "Voulez-vous entrer vos identifiants Gmail maintenant? (o/n): " response

if [ "$response" = "o" ] || [ "$response" = "O" ]; then
    read -p "Votre email Gmail: " user_email
    read -p "Votre App Password (16 caractères sans espaces): " app_password
    
    # Mettre à jour le fichier .env
    sed -i "s/EMAIL_HOST_USER=.*/EMAIL_HOST_USER=$user_email/" /home/mitou/FindPharma/backend/.env
    sed -i "s/EMAIL_HOST_PASSWORD=.*/EMAIL_HOST_PASSWORD=$app_password/" /home/mitou/FindPharma/backend/.env
    sed -i "s/DEFAULT_FROM_EMAIL=.*/DEFAULT_FROM_EMAIL=FindPharma <$user_email>/" /home/mitou/FindPharma/backend/.env
    
    echo ""
    echo -e "${GREEN}✅ Configuration mise à jour dans .env${NC}"
    echo ""
    echo "Pour activer l'envoi réel d'emails, modifiez settings.py:"
    echo "Remplacez dans backend/FindPharma/settings.py:"
    echo "  ${YELLOW}if DEBUG:${NC}"
    echo "Par:"
    echo "  ${YELLOW}if False:  # Forcer l'envoi réel même en DEBUG${NC}"
    echo ""
else
    echo ""
    echo "Configuration annulée. Éditez manuellement le fichier .env"
fi

echo "================================================"
