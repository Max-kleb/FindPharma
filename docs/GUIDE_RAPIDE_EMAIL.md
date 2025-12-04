# 🚀 Guide Rapide : Recevoir des Emails en Temps Réel

## ⚡ Solution Express (5 minutes)

Pour que l'utilisateur reçoive le code de vérification **par email en temps réel**, suivez ces étapes :

---

## 📧 Option Recommandée : Gmail SMTP

### Étape 1 : Créer un Mot de Passe d'Application Gmail (2 min)

1. Aller sur : **https://myaccount.google.com/security**
2. Activer la **"Validation en 2 étapes"** (si pas déjà fait)
3. Revenir sur la page Sécurité
4. Cliquer sur **"Mots de passe des applications"**
5. Sélectionner **"Autre (nom personnalisé)"**
6. Entrer : **"FindPharma Backend"**
7. Cliquer sur **"Générer"**
8. **Copier le mot de passe** affiché (format: `xxxx xxxx xxxx xxxx`)

---

### Étape 2 : Configurer le Backend (1 min)

**Option A : Script Automatique (Recommandé)**

```bash
cd /home/mitou/FindPharma
./setup_email.sh
```

Choisir l'option **1 (Gmail)** et suivre les instructions.

**Option B : Manuel**

Créer/éditer le fichier `backend/.env` :

```bash
# backend/.env

DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production

# Base de données
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root

# 📧 CONFIGURATION EMAIL - Gmail SMTP
EMAIL_MODE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=xxxxyyyyzzzzwwww
DEFAULT_FROM_EMAIL=FindPharma <votre-email@gmail.com>

# Durée de validité du code (15 minutes)
EMAIL_VERIFICATION_CODE_EXPIRY=15
```

**⚠️ Remplacer :**
- `votre-email@gmail.com` par votre email Gmail
- `xxxxyyyyzzzzwwww` par le mot de passe d'application (sans espaces)

---

### Étape 3 : Redémarrer le Backend (30 sec)

```bash
cd /home/mitou/FindPharma
podman restart findpharma_backend
```

Attendre 5 secondes pour que le conteneur démarre.

---

### Étape 4 : Tester l'Envoi (1 min)

```bash
curl -X POST http://localhost:8000/api/auth/send-verification-code/ \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email@gmail.com", "username": "test"}'
```

**Résultat attendu :**
```json
{
  "message": "Code de vérification envoyé",
  "email": "votre-email@gmail.com",
  "expires_in": 900
}
```

---

### Étape 5 : Vérifier la Réception (immédiat)

1. Ouvrir votre boîte Gmail
2. Chercher l'email de "FindPharma"
3. **Temps de réception : 2-5 secondes** ⚡

**Email reçu :**
```
De: FindPharma <votre-email@gmail.com>
Objet: 🔐 FindPharma - Code de vérification

Bonjour test,

Votre code de vérification est :

┌─────────────┐
│   ABC123    │
└─────────────┘

Ce code expire dans 15 minutes.
```

---

## ✅ C'est Tout !

Maintenant, quand un utilisateur s'inscrit sur l'application :

1. Il entre son email
2. Clique sur "S'inscrire"
3. **Reçoit le code par email en 2-5 secondes** ⚡
4. Entre le code dans l'application
5. Son compte est créé ✅

---

## 🔍 Vérification des Logs

Pour voir ce qui se passe en arrière-plan :

```bash
podman logs findpharma_backend -f
```

**Logs attendus lors de l'envoi :**
```
✅ Code généré pour votre-email@gmail.com: ABC123 (expire dans 15 min)
💾 Stocké dans cache avec clé: verification_code_votre-email@gmail.com
✅ Email de vérification envoyé à votre-email@gmail.com
[03/Dec/2025 05:30:42] "POST /api/auth/send-verification-code/ HTTP/1.1" 200 89
```

---

## 🚨 Résolution de Problèmes

### ❌ "SMTPAuthenticationError"

**Cause :** Mot de passe incorrect ou validation 2 étapes non activée

**Solution :**
1. Vérifier que la validation 2 étapes est **active**
2. Regénérer un **nouveau** mot de passe d'application
3. Copier le mot de passe **sans les espaces**
4. Redémarrer le backend : `podman restart findpharma_backend`

---

### ❌ Email dans les Spams

**Cause :** Gmail marque parfois les nouveaux expéditeurs comme spam

**Solution :**
1. Vérifier le dossier **Spam**
2. Marquer l'email comme **"Non spam"**
3. Les prochains emails arriveront dans la boîte principale

---

### ❌ "Network is unreachable"

**Cause :** Le conteneur Docker ne peut pas accéder à Internet

**Solution :**
```bash
# Tester la connectivité
podman exec findpharma_backend ping -c 3 google.com

# Si ça ne fonctionne pas
podman restart findpharma_backend
```

---

## 🎯 Récapitulatif

| Étape | Temps | Statut |
|-------|-------|--------|
| 1. Créer mot de passe d'application Gmail | 2 min | ⏳ |
| 2. Configurer backend/.env | 1 min | ⏳ |
| 3. Redémarrer backend | 30 sec | ⏳ |
| 4. Tester l'envoi | 1 min | ⏳ |
| 5. Vérifier réception | 5 sec | ⏳ |
| **TOTAL** | **< 5 minutes** | ✅ |

---

## 📱 Test Complet de l'Inscription

1. Aller sur : **http://localhost:3000/register**
2. Remplir le formulaire :
   - Username : `testuser`
   - Email : `votre-email@gmail.com`
   - Mot de passe : `Test1234!`
3. Cliquer sur **"S'inscrire"**
4. **Attendre 2-5 secondes**
5. Ouvrir votre boîte Gmail
6. Copier le code reçu (ex: `ABC123`)
7. Coller le code dans l'application
8. ✅ **Compte créé avec succès !**

---

## 🚀 Alternatives

Si Gmail ne fonctionne pas, utilisez :

### Option 2 : Mailtrap (Tests)
- Emails de test (pas de vrai envoi)
- Gratuit, illimité
- Configuration : `./setup_email.sh` → Choisir option 2

### Option 3 : SendGrid (Production)
- 100 emails/jour gratuits
- Statistiques et tracking
- Configuration : `./setup_email.sh` → Choisir option 3

---

## 📞 Support

**Problème persistant ?**

1. Vérifier les logs : `podman logs findpharma_backend -f`
2. Consulter : `CONFIGURATION_EMAIL_SMTP.md`
3. Tester avec Mailtrap pour isoler le problème

---

**Date :** 3 décembre 2025  
**Temps de configuration :** < 5 minutes  
**Temps d'envoi email :** 2-5 secondes ⚡

**C'est parti ! 🚀**
