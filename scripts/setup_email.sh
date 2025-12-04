#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  📧 Configuration Email SMTP pour FindPharma"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérifier si le fichier .env existe déjà
if [ -f "backend/.env" ]; then
    echo "⚠️  Un fichier .env existe déjà dans backend/"
    read -p "Voulez-vous le remplacer ? (o/N) : " replace
    if [ "$replace" != "o" ] && [ "$replace" != "O" ]; then
        echo "❌ Configuration annulée"
        exit 0
    fi
fi

# Choix du provider
echo "Choisissez votre provider email :"
echo ""
echo "  1) 📧 Gmail SMTP (Recommandé pour développement)"
echo "     • Gratuit : 100 emails/jour"
echo "     • Envoi réel vers votre boîte mail"
echo ""
echo "  2) 🧪 Mailtrap (Recommandé pour tests)"
echo "     • Gratuit : Emails de test illimités"
echo "     • Emails non envoyés réellement (boîte de test)"
echo ""
echo "  3) 🚀 SendGrid (Recommandé pour production)"
echo "     • Gratuit : 100 emails/jour"
echo "     • Statistiques et tracking"
echo ""
echo "  4) 🔧 Mode Console (Développement sans SMTP)"
echo "     • Code affiché dans les logs uniquement"
echo ""
read -p "Votre choix (1-4) : " choice

echo ""

case $choice in
  1)
    echo "════════════════════════════════════════════════════════════════"
    echo "  📧 Configuration Gmail SMTP"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "⚠️  IMPORTANT : Vous devez d'abord créer un mot de passe d'application Gmail :"
    echo ""
    echo "  1. Aller sur https://myaccount.google.com/security"
    echo "  2. Activer la validation en 2 étapes (obligatoire)"
    echo "  3. Aller dans 'Mots de passe des applications'"
    echo "  4. Créer un nouveau mot de passe pour 'FindPharma'"
    echo "  5. Copier le mot de passe généré (format: xxxx xxxx xxxx xxxx)"
    echo ""
    read -p "Votre email Gmail : " email
    read -sp "Mot de passe d'application (avec ou sans espaces) : " password
    echo ""
    
    # Supprimer les espaces du mot de passe
    password=$(echo "$password" | tr -d ' ')
    
    cat > backend/.env << EOF
# ════════════════════════════════════════════════════════════════
# Configuration FindPharma Backend
# ════════════════════════════════════════════════════════════════

DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production

# Base de données PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root

# ════════════════════════════════════════════════════════════════
# 📧 Configuration Email - Gmail SMTP
# ════════════════════════════════════════════════════════════════
EMAIL_MODE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$email
EMAIL_HOST_PASSWORD=$password
DEFAULT_FROM_EMAIL=FindPharma <$email>

# Durée de validité du code de vérification (en minutes)
EMAIL_VERIFICATION_CODE_EXPIRY=15

# Nombre maximum de tentatives de vérification
MAX_VERIFICATION_ATTEMPTS=5
EOF
    
    echo ""
    echo "✅ Configuration Gmail SMTP enregistrée !"
    echo ""
    echo "📧 Les emails seront envoyés depuis : $email"
    ;;
    
  2)
    echo "════════════════════════════════════════════════════════════════"
    echo "  🧪 Configuration Mailtrap"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "⚠️  IMPORTANT : Vous devez d'abord créer un compte Mailtrap :"
    echo ""
    echo "  1. Aller sur https://mailtrap.io/"
    echo "  2. S'inscrire (gratuit)"
    echo "  3. Créer un inbox 'FindPharma Dev'"
    echo "  4. Copier les credentials SMTP (onglet SMTP Settings)"
    echo ""
    read -p "Mailtrap Username : " username
    read -sp "Mailtrap Password : " password
    echo ""
    
    cat > backend/.env << EOF
# ════════════════════════════════════════════════════════════════
# Configuration FindPharma Backend
# ════════════════════════════════════════════════════════════════

DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production

# Base de données PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root

# ════════════════════════════════════════════════════════════════
# 📧 Configuration Email - Mailtrap (Tests)
# ════════════════════════════════════════════════════════════════
EMAIL_MODE=smtp
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$username
EMAIL_HOST_PASSWORD=$password
DEFAULT_FROM_EMAIL=FindPharma <noreply@findpharma.cm>

# Durée de validité du code de vérification (en minutes)
EMAIL_VERIFICATION_CODE_EXPIRY=15

# Nombre maximum de tentatives de vérification
MAX_VERIFICATION_ATTEMPTS=5
EOF
    
    echo ""
    echo "✅ Configuration Mailtrap enregistrée !"
    echo ""
    echo "🧪 Visualisez vos emails sur : https://mailtrap.io/inboxes"
    ;;
    
  3)
    echo "════════════════════════════════════════════════════════════════"
    echo "  🚀 Configuration SendGrid"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "⚠️  IMPORTANT : Vous devez d'abord créer un compte SendGrid :"
    echo ""
    echo "  1. Aller sur https://sendgrid.com/"
    echo "  2. S'inscrire (gratuit jusqu'à 100 emails/jour)"
    echo "  3. Créer une API Key dans Settings > API Keys"
    echo "  4. Copier l'API Key (commence par 'SG.')"
    echo ""
    read -sp "SendGrid API Key : " apikey
    echo ""
    read -p "Email expéditeur (ex: noreply@votredomaine.com) : " sender_email
    
    cat > backend/.env << EOF
# ════════════════════════════════════════════════════════════════
# Configuration FindPharma Backend
# ════════════════════════════════════════════════════════════════

DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production

# Base de données PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root

# ════════════════════════════════════════════════════════════════
# 📧 Configuration Email - SendGrid (Production)
# ════════════════════════════════════════════════════════════════
EMAIL_MODE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=$apikey
DEFAULT_FROM_EMAIL=FindPharma <$sender_email>

# Durée de validité du code de vérification (en minutes)
EMAIL_VERIFICATION_CODE_EXPIRY=15

# Nombre maximum de tentatives de vérification
MAX_VERIFICATION_ATTEMPTS=5
EOF
    
    echo ""
    echo "✅ Configuration SendGrid enregistrée !"
    echo ""
    echo "📧 Les emails seront envoyés depuis : $sender_email"
    ;;
    
  4)
    echo "════════════════════════════════════════════════════════════════"
    echo "  🔧 Mode Console (Développement)"
    echo "════════════════════════════════════════════════════════════════"
    
    cat > backend/.env << EOF
# ════════════════════════════════════════════════════════════════
# Configuration FindPharma Backend
# ════════════════════════════════════════════════════════════════

DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production

# Base de données PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root

# ════════════════════════════════════════════════════════════════
# 📧 Configuration Email - Mode Console (Développement)
# ════════════════════════════════════════════════════════════════
EMAIL_MODE=console
DEFAULT_FROM_EMAIL=FindPharma <noreply@findpharma.cm>

# Durée de validité du code de vérification (en minutes)
EMAIL_VERIFICATION_CODE_EXPIRY=3

# Nombre maximum de tentatives de vérification
MAX_VERIFICATION_ATTEMPTS=5
EOF
    
    echo ""
    echo "✅ Configuration Mode Console enregistrée !"
    echo ""
    echo "📝 Les codes seront affichés dans les logs backend"
    ;;
    
  *)
    echo "❌ Choix invalide"
    exit 1
    ;;
esac

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Configuration terminée avec succès !"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🔄 Prochaines étapes :"
echo ""
echo "  1. Redémarrer le backend :"
echo "     podman restart findpharma_backend"
echo ""
echo "  2. Tester l'envoi d'email :"
echo "     curl -X POST http://localhost:8000/api/auth/send-verification-code/ \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"email\": \"votre-email@gmail.com\", \"username\": \"test\"}'"
echo ""
echo "  3. Vérifier les logs :"
echo "     podman logs findpharma_backend -f"
echo ""
echo "════════════════════════════════════════════════════════════════"
