# 📧 GUIDE : Recevoir les Emails de Vérification

## Problème
En mode développement, les emails s'affichent dans la console Django au lieu d'être envoyés.

## Solution 1 : Voir le Code dans la Console (Actuel - Simple)

**Le code s'affiche déjà dans votre terminal Django !**

1. Ouvrir le terminal où tourne `python manage.py runserver`
2. Après avoir cliqué sur "Vérifier mon email" dans le frontend
3. Chercher dans le terminal un bloc comme :

```
Content-Type: text/plain; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Subject: [FindPharma] Code de =?utf-8?q?v=C3=A9rification?= email
From: FindPharma <noreply@findpharma.cm>
To: votre@email.com
Date: ...

Votre code de vérification : ABC123

Ce code expire dans 15 minutes.
```

4. Copier le code (ex: `ABC123`)
5. Le coller dans le modal de vérification

---

## Solution 2 : Recevoir de Vrais Emails via Gmail

### Étape 1 : Créer un App Password Gmail

1. **Aller sur** : https://myaccount.google.com/apppasswords
2. **Se connecter** avec votre compte Gmail
3. **Créer un mot de passe d'application** :
   - Application : "Autre (nom personnalisé)"
   - Nom : "FindPharma"
4. **Copier le mot de passe** généré (16 caractères, ex: `abcd efgh ijkl mnop`)
5. **Retirer les espaces** : `abcdefghijklmnop`

### Étape 2 : Configurer le .env

Éditer `/home/mitou/FindPharma/backend/.env` :

```bash
# Remplacer par vos vraies valeurs
EMAIL_HOST_USER=votre.email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=FindPharma <votre.email@gmail.com>
```

### Étape 3 : Redémarrer Django

```bash
# Arrêter le serveur (Ctrl+C)
cd /home/mitou/FindPharma/backend
python manage.py runserver

# Les emails seront maintenant envoyés réellement !
```

### Étape 4 : Tester

```bash
# Test rapide dans le shell Django
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test FindPharma',
    'Ceci est un email de test',
    'noreply@findpharma.cm',
    ['votre@email.com'],
    fail_silently=False,
)
# Si ça fonctionne, vous verrez "1" (1 email envoyé)
```

---

## Solution 3 : Utiliser Mailtrap (Pour les Tests)

**Mailtrap** est un service qui capture tous les emails en dev.

1. Créer un compte sur : https://mailtrap.io (gratuit)
2. Copier les identifiants SMTP
3. Modifier `.env` :

```bash
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_HOST_USER=votre_username_mailtrap
EMAIL_HOST_PASSWORD=votre_password_mailtrap
```

4. Tous les emails seront visibles dans Mailtrap !

---

## ⚠️ Important

**J'ai déjà modifié `settings.py`** pour forcer l'envoi SMTP (ligne 265) :

```python
if False:  # Au lieu de "if DEBUG:"
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Donc **il suffit maintenant de** :
1. Éditer `/home/mitou/FindPharma/backend/.env`
2. Ajouter vos identifiants Gmail
3. Redémarrer Django
4. Tester l'inscription !

---

## 🎯 Commandes Utiles

```bash
# Éditer le fichier .env
nano /home/mitou/FindPharma/backend/.env

# Redémarrer Django
cd /home/mitou/FindPharma/backend
python manage.py runserver

# Tester l'envoi d'email
python manage.py shell -c "
from django.core.mail import send_mail
send_mail('Test', 'Test message', 'from@example.com', ['votre@email.com'])
print('Email envoyé !')
"
```

---

## 📧 Exemple de Configuration Gmail Complète

**Fichier : `/home/mitou/FindPharma/backend/.env`**

```bash
USE_SQLITE=False
DEBUG=True
SECRET_KEY=une_cle_secrete_locale_pour_dev_12345

DATABASE_NAME=findpharma
DATABASE_USER=findpharmauser
DATABASE_PASSWORD=root
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Configuration Email Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=john.doe@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=FindPharma <john.doe@gmail.com>
```

Remplacez :
- `john.doe@gmail.com` → Votre vrai email Gmail
- `abcdefghijklmnop` → Votre App Password Gmail (16 caractères sans espaces)

---

**Besoin d'aide ?** Dites-moi quelle solution vous préférez !
