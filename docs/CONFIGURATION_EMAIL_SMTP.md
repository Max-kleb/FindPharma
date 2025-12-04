# 📧 Configuration SMTP pour Envoi d'Emails en Temps Réel

## 🎯 Objectif

Permettre à l'utilisateur de **recevoir le code de vérification par email** dans sa boîte mail (Gmail, Outlook, etc.) en temps réel.

---

## 🚀 Solutions Disponibles

### ✅ Option 1 : Gmail SMTP (Recommandé pour Dev)
- **Gratuit** : 100 emails/jour
- **Simple** : Configuration en 5 minutes
- **Fiable** : Service Google stable

### ✅ Option 2 : Mailtrap (Recommandé pour Tests)
- **Gratuit** : Emails de test illimités
- **Safe** : Pas d'envoi réel (boîte de test)
- **Debug** : Visualisation des emails envoyés

### ✅ Option 3 : SendGrid (Recommandé pour Production)
- **Gratuit** : 100 emails/jour
- **Professionnel** : Statistiques et tracking
- **Scalable** : Jusqu'à 100k emails/mois

### ✅ Option 4 : Mailgun
- **Gratuit** : 1000 emails/mois
- **API Simple** : Integration facile
- **Europe** : Serveurs UE disponibles

---

## 🔧 Option 1 : Configuration Gmail SMTP (5 minutes)

### Étape 1 : Créer un Mot de Passe d'Application Gmail

1. Aller sur https://myaccount.google.com/security
2. Activer la **Validation en 2 étapes** (obligatoire)
3. Aller dans **Mots de passe des applications**
4. Sélectionner "Autre (nom personnalisé)"
5. Entrer "FindPharma Backend"
6. Copier le mot de passe généré (ex: `abcd efgh ijkl mnop`)

### Étape 2 : Configurer le Backend

Créer/éditer le fichier `.env` :

```bash
# backend/.env
DEBUG=True
SECRET_KEY=votre-secret-key

# Base de données
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root

# 📧 CONFIGURATION EMAIL (Gmail)
EMAIL_MODE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
DEFAULT_FROM_EMAIL=FindPharma <votre-email@gmail.com>

# Durée de validité du code (en minutes)
EMAIL_VERIFICATION_CODE_EXPIRY=15
```

### Étape 3 : Redémarrer le Backend

```bash
cd /home/mitou/FindPharma
podman restart findpharma_backend
```

### Étape 4 : Tester

```bash
curl -X POST http://localhost:8000/api/auth/send-verification-code/ \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email@gmail.com", "username": "test"}'
```

**Résultat attendu :**
- ✅ Email reçu dans votre boîte Gmail en 2-5 secondes
- ✅ Objet : "🔐 FindPharma - Code de vérification"
- ✅ Code à 6 caractères dans l'email

---

## 🧪 Option 2 : Mailtrap (Pour Tests)

**Avantage :** Les emails ne sont pas vraiment envoyés, mais vous pouvez les visualiser dans une interface web.

### Étape 1 : Créer un Compte Mailtrap

1. Aller sur https://mailtrap.io/
2. S'inscrire (gratuit)
3. Créer un inbox "FindPharma Dev"
4. Copier les credentials SMTP

### Étape 2 : Configuration Backend

```bash
# backend/.env
EMAIL_MODE=smtp
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-username-mailtrap
EMAIL_HOST_PASSWORD=votre-password-mailtrap
DEFAULT_FROM_EMAIL=FindPharma <noreply@findpharma.cm>
```

### Étape 3 : Visualiser les Emails

- Aller sur https://mailtrap.io/inboxes
- Voir tous les emails envoyés par l'application
- Tester sans polluer votre vraie boîte mail

---

## 🚀 Option 3 : SendGrid (Production)

### Étape 1 : Créer un Compte SendGrid

1. Aller sur https://sendgrid.com/
2. S'inscrire (gratuit jusqu'à 100 emails/jour)
3. Créer une API Key
4. Vérifier votre domaine (optionnel)

### Étape 2 : Configuration Backend

```bash
# backend/.env
EMAIL_MODE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=votre-sendgrid-api-key
DEFAULT_FROM_EMAIL=FindPharma <noreply@findpharma.cm>
```

---

## 📝 Script de Configuration Rapide

Créez un fichier `setup_email.sh` :

```bash
#!/bin/bash

echo "🔧 Configuration Email SMTP pour FindPharma"
echo ""

# Choix du provider
echo "Choisissez votre provider email :"
echo "1) Gmail"
echo "2) Mailtrap (Tests)"
echo "3) SendGrid (Production)"
read -p "Votre choix (1-3) : " choice

case $choice in
  1)
    echo ""
    echo "📧 Configuration Gmail SMTP"
    read -p "Votre email Gmail : " email
    read -sp "Mot de passe d'application : " password
    echo ""
    
    cat > backend/.env << EOF
DEBUG=True
EMAIL_MODE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$email
EMAIL_HOST_PASSWORD=$password
DEFAULT_FROM_EMAIL=FindPharma <$email>
EMAIL_VERIFICATION_CODE_EXPIRY=15
EOF
    ;;
    
  2)
    echo ""
    echo "📧 Configuration Mailtrap"
    read -p "Mailtrap username : " username
    read -sp "Mailtrap password : " password
    echo ""
    
    cat > backend/.env << EOF
DEBUG=True
EMAIL_MODE=smtp
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$username
EMAIL_HOST_PASSWORD=$password
DEFAULT_FROM_EMAIL=FindPharma <noreply@findpharma.cm>
EMAIL_VERIFICATION_CODE_EXPIRY=15
EOF
    ;;
    
  3)
    echo ""
    echo "📧 Configuration SendGrid"
    read -sp "SendGrid API Key : " apikey
    echo ""
    
    cat > backend/.env << EOF
DEBUG=True
EMAIL_MODE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=$apikey
DEFAULT_FROM_EMAIL=FindPharma <noreply@findpharma.cm>
EMAIL_VERIFICATION_CODE_EXPIRY=15
EOF
    ;;
esac

echo ""
echo "✅ Fichier .env créé avec succès !"
echo ""
echo "🔄 Redémarrez le backend :"
echo "   podman restart findpharma_backend"
echo ""
echo "🧪 Testez l'envoi :"
echo "   curl -X POST http://localhost:8000/api/auth/send-verification-code/ \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\": \"votre-email@gmail.com\", \"username\": \"test\"}'"
```

Rendre le script exécutable :

```bash
chmod +x setup_email.sh
./setup_email.sh
```

---

## 🐳 Configuration Docker avec SMTP

### Mise à Jour du docker-compose.yml

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: findpharma_backend
    environment:
      - DEBUG=True
      - DATABASE_HOST=db
      - DATABASE_PORT=5432
      - DATABASE_NAME=findpharma
      - DATABASE_USER=findpharmauser
      - DATABASE_PASSWORD=root
      # 📧 Configuration Email
      - EMAIL_MODE=smtp
      - EMAIL_HOST=smtp.gmail.com
      - EMAIL_PORT=587
      - EMAIL_USE_TLS=True
      - EMAIL_HOST_USER=${EMAIL_HOST_USER}
      - EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD}
      - DEFAULT_FROM_EMAIL=FindPharma <${EMAIL_HOST_USER}>
      - EMAIL_VERIFICATION_CODE_EXPIRY=15
    ports:
      - "8000:8000"
    depends_on:
      - db
```

Créer un fichier `.env` à la racine :

```bash
# .env (racine du projet)
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-application
```

Redémarrer les conteneurs :

```bash
podman compose down
podman compose up -d
```

---

## ✅ Vérification

### Test 1 : Envoyer un Code

```bash
curl -X POST http://localhost:8000/api/auth/send-verification-code/ \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email@gmail.com", "username": "testuser"}'
```

**Résultat attendu :**
```json
{
  "message": "Code de vérification envoyé",
  "email": "votre-email@gmail.com",
  "expires_in": 900
}
```

### Test 2 : Vérifier la Réception

1. Ouvrir votre boîte mail
2. Vérifier les emails reçus (dossier principal ou spam)
3. Chercher l'email de "FindPharma"
4. Copier le code à 6 caractères

### Test 3 : Vérifier les Logs

```bash
podman logs findpharma_backend -f
```

**Logs attendus :**
```
✅ Code généré pour votre-email@gmail.com: ABC123
💾 Stocké dans cache avec clé: verification_code_votre-email@gmail.com
✅ Email de vérification envoyé à votre-email@gmail.com
```

---

## 🚨 Résolution de Problèmes

### Problème 1 : "Authentication failed"

**Cause :** Mot de passe incorrect ou validation 2 étapes non activée

**Solution :**
1. Vérifier que la validation 2 étapes est active
2. Regénérer un mot de passe d'application
3. Copier-coller sans espaces

### Problème 2 : "Network is unreachable"

**Cause :** Le conteneur Docker ne peut pas accéder à Internet

**Solution :**
```bash
# Tester la connectivité réseau
podman exec findpharma_backend ping -c 3 google.com

# Si ça ne fonctionne pas, redémarrer le conteneur
podman restart findpharma_backend
```

### Problème 3 : Email dans les Spams

**Cause :** Gmail marque les emails de nouveaux expéditeurs comme spam

**Solution :**
1. Vérifier le dossier spam
2. Marquer comme "Non spam"
3. Ajouter l'expéditeur aux contacts

### Problème 4 : "SMTPAuthenticationError"

**Cause :** Gmail bloque l'accès des "applications moins sécurisées"

**Solution :**
1. Utiliser un **mot de passe d'application** (pas le mot de passe Gmail)
2. Vérifier que la validation 2 étapes est active
3. Si le problème persiste, utiliser Mailtrap ou SendGrid

---

## 📊 Temps d'Envoi

| Provider | Temps d'Envoi | Fiabilité |
|----------|---------------|-----------|
| **Gmail** | 2-5 secondes | ⭐⭐⭐⭐⭐ |
| **Mailtrap** | Instantané | ⭐⭐⭐⭐⭐ (test) |
| **SendGrid** | 1-3 secondes | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 2-4 secondes | ⭐⭐⭐⭐ |

---

## 🎯 Recommandations

### Pour le Développement
- **Mailtrap** : Tester sans polluer votre vraie boîte mail
- OU **Gmail** : Si vous voulez voir les vrais emails

### Pour la Production
- **SendGrid** : Meilleure délivrabilité, statistiques
- OU **Mailgun** : Alternative solide

---

## 🔐 Sécurité

### ⚠️ Ne JAMAIS commiter les credentials

Ajouter au `.gitignore` :

```bash
# .gitignore
.env
*.env
backend/.env
EMAIL_PASSWORD
SMTP_PASSWORD
```

### ✅ Utiliser des Variables d'Environnement

```bash
# Bonne pratique
export EMAIL_HOST_USER="votre-email@gmail.com"
export EMAIL_HOST_PASSWORD="mot-de-passe-application"

# Lancer le backend
python manage.py runserver
```

---

## 📝 Résumé

**Pour envoyer de vrais emails en temps réel :**

1. ✅ Choisir un provider SMTP (Gmail recommandé pour dev)
2. ✅ Créer un mot de passe d'application
3. ✅ Configurer le fichier `.env` avec les credentials
4. ✅ Mettre `EMAIL_MODE=smtp` dans settings.py
5. ✅ Redémarrer le backend
6. ✅ Tester l'inscription

**Temps total : 5-10 minutes**

**Résultat : Emails reçus en 2-5 secondes** ⚡

---

**Date :** 3 décembre 2025  
**Statut :** Guide complet - Prêt à utiliser
