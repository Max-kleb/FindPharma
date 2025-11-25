#!/bin/bash
# Configuration interactive de Gmail pour FindPharma

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📧 CONFIGURATION GMAIL POUR EMAILS EN TEMPS RÉEL             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Demander l'email
echo -e "${BLUE}📧 Quelle est votre adresse Gmail ?${NC}"
echo -e "${YELLOW}Exemple: john.doe@gmail.com${NC}"
read -p "Email : " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo -e "${RED}❌ Email vide. Configuration annulée.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔐 Créez un App Password Gmail :${NC}"
echo -e "${YELLOW}1. Ouvrez: https://myaccount.google.com/apppasswords${NC}"
echo -e "${YELLOW}2. Connectez-vous avec votre Gmail${NC}"
echo -e "${YELLOW}3. Créez un nouveau mot de passe pour 'FindPharma'${NC}"
echo -e "${YELLOW}4. Copiez le mot de passe de 16 caractères${NC}"
echo ""
read -p "Appuyez sur Entrée quand vous avez votre App Password..."
echo ""

# Demander l'App Password
echo -e "${BLUE}🔑 Entrez votre App Password (16 caractères sans espaces)${NC}"
echo -e "${YELLOW}Exemple: abcdefghijklmnop${NC}"
read -s -p "App Password : " APP_PASSWORD
echo ""

if [ -z "$APP_PASSWORD" ]; then
    echo -e "${RED}❌ App Password vide. Configuration annulée.${NC}"
    exit 1
fi

# Retirer les espaces
APP_PASSWORD=$(echo "$APP_PASSWORD" | tr -d ' ')

echo ""
echo -e "${GREEN}✅ Configuration en cours...${NC}"
echo ""

# Mettre à jour le fichier .env
ENV_FILE="/home/mitou/FindPharma/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Fichier .env non trouvé: $ENV_FILE${NC}"
    exit 1
fi

# Backup du .env
cp "$ENV_FILE" "$ENV_FILE.backup"
echo -e "${GREEN}✅ Backup créé: $ENV_FILE.backup${NC}"

# Mettre à jour ou ajouter les lignes
if grep -q "EMAIL_HOST_USER=" "$ENV_FILE"; then
    sed -i "s|EMAIL_HOST_USER=.*|EMAIL_HOST_USER=$USER_EMAIL|" "$ENV_FILE"
else
    echo "EMAIL_HOST_USER=$USER_EMAIL" >> "$ENV_FILE"
fi

if grep -q "EMAIL_HOST_PASSWORD=" "$ENV_FILE"; then
    sed -i "s|EMAIL_HOST_PASSWORD=.*|EMAIL_HOST_PASSWORD=$APP_PASSWORD|" "$ENV_FILE"
else
    echo "EMAIL_HOST_PASSWORD=$APP_PASSWORD" >> "$ENV_FILE"
fi

if grep -q "DEFAULT_FROM_EMAIL=" "$ENV_FILE"; then
    sed -i "s|DEFAULT_FROM_EMAIL=.*|DEFAULT_FROM_EMAIL=FindPharma <$USER_EMAIL>|" "$ENV_FILE"
else
    echo "DEFAULT_FROM_EMAIL=FindPharma <$USER_EMAIL>" >> "$ENV_FILE"
fi

echo -e "${GREEN}✅ Fichier .env mis à jour${NC}"
echo ""

# Modifier settings.py pour activer SMTP
SETTINGS_FILE="/home/mitou/FindPharma/backend/FindPharma/settings.py"

if [ -f "$SETTINGS_FILE" ]; then
    # Backup
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"
    
    # Changer if True: en if False:
    sed -i 's/if True:  # Mode console/if False:  # Mode SMTP activé/' "$SETTINGS_FILE"
    
    echo -e "${GREEN}✅ settings.py mis à jour (SMTP activé)${NC}"
else
    echo -e "${RED}⚠️ settings.py non trouvé, modifiez manuellement${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ CONFIGURATION TERMINÉE !                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📝 Configuration appliquée:${NC}"
echo "  • Email: $USER_EMAIL"
echo "  • App Password: $(echo $APP_PASSWORD | sed 's/./*/g')"
echo "  • Mode SMTP: Activé"
echo ""
echo -e "${BLUE}🔄 IMPORTANT: Redémarrez Django !${NC}"
echo ""
echo "  1. Arrêtez Django (Ctrl+C dans le terminal)"
echo "  2. Relancez: ${GREEN}python manage.py runserver${NC}"
echo ""
echo -e "${GREEN}🧪 Pour tester l'envoi d'email:${NC}"
echo "  cd /home/mitou/FindPharma/backend"
echo "  python manage.py shell"
echo ""
echo "  >>> from django.core.mail import send_mail"
echo "  >>> send_mail('Test', 'Message test', 'from@example.com', ['$USER_EMAIL'])"
echo "  >>> # Vous devriez recevoir un email dans quelques secondes !"
echo ""
echo -e "${BLUE}🎯 Maintenant, testez l'inscription sur:${NC}"
echo "  http://localhost:3000/register"
echo ""
