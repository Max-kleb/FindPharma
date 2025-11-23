# 📦 Guide d'Installation FindPharma

**Version**: 1.0  
**Date**: 23 novembre 2025  
**Pour**: Équipes Backend & Frontend

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Backend](#installation-backend)
3. [Installation Frontend](#installation-frontend)
4. [Vérification de l'Installation](#vérification)
5. [Problèmes Courants](#problèmes-courants)

---

## 🎯 Prérequis

### Pour l'Équipe Backend

- **Python 3.11+** (recommandé: 3.13)
- **PostgreSQL 16+** avec extension **PostGIS 3.4+**
- **Git**
- **Système**: Linux, macOS, ou Windows avec WSL

Vérifier les versions:
```bash
python --version    # Doit afficher Python 3.11 ou supérieur
psql --version      # PostgreSQL 16.x
git --version       # Git 2.x
```

### Pour l'Équipe Frontend

- **Node.js 18+** (recommandé: 20.x)
- **npm 9+** ou **yarn 1.22+**
- **Git**

Vérifier les versions:
```bash
node --version      # v18.x ou supérieur
npm --version       # 9.x ou supérieur
git --version       # Git 2.x
```

---

## 🐍 Installation Backend (Django)

### Étape 1: Cloner le Repository

```bash
# Cloner le projet
git clone https://github.com/Max-kleb/FindPharma.git
cd FindPharma

# Se placer sur la branche restructure-project
git checkout restructure-project
```

### Étape 2: Créer l'Environnement Virtuel Python

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Linux/macOS:
source venv/bin/activate

# Sur Windows:
venv\Scripts\activate

# Vous devriez voir (venv) au début de votre ligne de commande
```

### Étape 3: Installer les Dépendances Python

```bash
# Installer toutes les dépendances
pip install -r requirements.txt

# Vérifier l'installation
pip list | grep Django    # Django 5.2.7
pip list | grep djangorestframework    # 3.16.1
pip list | grep psycopg2    # Pour PostgreSQL
```

### Étape 4: Configurer PostgreSQL

#### 4.1 Installer PostgreSQL + PostGIS

**Sur Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

**Sur macOS (avec Homebrew):**
```bash
brew install postgresql postgis
brew services start postgresql
```

**Sur Windows:**
Télécharger depuis: https://www.postgresql.org/download/windows/

#### 4.2 Créer la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans le shell PostgreSQL:
CREATE DATABASE findpharma;
CREATE USER findpharma_user WITH PASSWORD 'votre_mot_de_passe_securise';
ALTER ROLE findpharma_user SET client_encoding TO 'utf8';
ALTER ROLE findpharma_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE findpharma_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE findpharma TO findpharma_user;

# Activer PostGIS
\c findpharma
CREATE EXTENSION postgis;

# Vérifier PostGIS
SELECT PostGIS_version();

# Quitter
\q
```

### Étape 5: Configurer les Variables d'Environnement

Créer un fichier `.env` dans le dossier `FindPharma/`:

```bash
# Créer le fichier .env
nano FindPharma/.env
```

Ajouter le contenu suivant:

```env
# Base de données
DB_NAME=findpharma
DB_USER=findpharma_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=votre-cle-secrete-django-tres-longue-et-aleatoire
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS (pour le frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

> ⚠️ **Important**: Remplacez `votre_mot_de_passe_securise` et `votre-cle-secrete-django` par vos propres valeurs!

### Étape 6: Migrations de la Base de Données

```bash
# Aller dans le dossier FindPharma (où se trouve manage.py)
cd FindPharma

# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Vérifier que tout s'est bien passé
python manage.py showmigrations
```

### Étape 7: Créer un Superutilisateur (Administrateur)

```bash
python manage.py createsuperuser

# Suivre les instructions:
# Username: admin
# Email: admin@findpharma.com
# Password: [votre mot de passe]
```

### Étape 8: Peupler la Base de Données (Optionnel)

```bash
# Importer les données de test
python manage.py loaddata test_data.json

# Ou utiliser le script de population
python ../scripts/populate_pharmacies.py
```

### Étape 9: Démarrer le Serveur Backend

```bash
# Démarrer le serveur Django
python manage.py runserver

# Le serveur démarre sur: http://127.0.0.1:8000/
```

#### Vérifier que le Backend Fonctionne:

Ouvrir dans votre navigateur:
- **API**: http://127.0.0.1:8000/api/
- **Admin**: http://127.0.0.1:8000/admin/
- **Documentation API**: http://127.0.0.1:8000/api/docs/

✅ **Backend installé avec succès!**

---

## ⚛️ Installation Frontend (React)

### Étape 1: Naviguer vers le Dossier Frontend

```bash
# Depuis la racine du projet
cd frontend
```

### Étape 2: Installer les Dépendances Node.js

```bash
# Installer toutes les dépendances
npm install

# Ou avec yarn:
yarn install

# Vérifier l'installation
npm list react    # react@19.2.0
npm list leaflet  # leaflet@1.9.4
```

### Étape 3: Configurer les Variables d'Environnement

Créer un fichier `.env` dans le dossier `frontend/`:

```bash
# Créer le fichier .env
nano .env
```

Ajouter le contenu suivant:

```env
# URL de l'API Backend
REACT_APP_API_URL=http://127.0.0.1:8000

# Port du serveur de développement (optionnel)
PORT=3000
```

### Étape 4: Démarrer le Serveur Frontend

```bash
# Démarrer le serveur React
npm start

# Ou avec yarn:
yarn start

# Le serveur démarre sur: http://localhost:3000/
```

Le navigateur devrait s'ouvrir automatiquement sur http://localhost:3000/

✅ **Frontend installé avec succès!**

---

## ✅ Vérification de l'Installation

### Vérifier le Backend

**Terminal 1** (Backend):
```bash
cd FindPharma
source ../venv/bin/activate  # Activer venv
python manage.py runserver
```

Vérifier dans le navigateur:
- [ ] http://127.0.0.1:8000/api/ → Page API Root
- [ ] http://127.0.0.1:8000/admin/ → Page de connexion admin
- [ ] http://127.0.0.1:8000/api/pharmacies/ → Liste des pharmacies (JSON)
- [ ] http://127.0.0.1:8000/api/search/?q=Paracétamol → Résultats de recherche

### Vérifier le Frontend

**Terminal 2** (Frontend):
```bash
cd frontend
npm start
```

Vérifier dans le navigateur:
- [ ] http://localhost:3000/ → Page d'accueil FindPharma
- [ ] Logo "FindPharma" visible
- [ ] Champ de recherche présent
- [ ] Bouton "Rechercher" visible
- [ ] Bouton géolocalisation visible
- [ ] Carte Leaflet s'affiche

### Tester l'Intégration Backend ↔ Frontend

1. **Ouvrir la console du navigateur** (F12 → Console)
2. **Taper "Paracétamol"** dans le champ de recherche
3. **Cliquer sur "Rechercher"**

Résultats attendus:
- [ ] Aucune erreur CORS dans la console
- [ ] Requête `GET http://127.0.0.1:8000/api/search/?q=Paracétamol` réussie (200 OK)
- [ ] Liste de pharmacies s'affiche
- [ ] Marqueurs apparaissent sur la carte

4. **Cliquer sur le bouton géolocalisation** 📍

Résultats attendus:
- [ ] Popup navigateur demande autorisation
- [ ] Requête `GET http://127.0.0.1:8000/api/nearby/?latitude=...` réussie
- [ ] Liste de pharmacies proches s'affiche
- [ ] Carte centrée sur votre position

✅ **Installation complète vérifiée!**

---

## 🐛 Problèmes Courants

### Erreur: `ModuleNotFoundError: No module named 'django'`

**Solution:**
```bash
# Vérifier que le venv est activé
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate  # Windows

# Réinstaller les dépendances
pip install -r requirements.txt
```

### Erreur: `FATAL: database "findpharma" does not exist`

**Solution:**
```bash
# Créer la base de données
sudo -u postgres psql
CREATE DATABASE findpharma;
\q

# Réessayer les migrations
python manage.py migrate
```

### Erreur CORS: `Access to fetch... has been blocked by CORS policy`

**Solution:**
```python
# Dans FindPharma/settings.py
CORS_ALLOW_ALL_ORIGINS = True  # Pour le développement

# Ou spécifique:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Redémarrer le serveur Django
```

### Erreur: `npm ERR! code ENOENT`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 ou 8000 déjà utilisé

**Solution:**
```bash
# Trouver le processus qui utilise le port
lsof -i :3000  # ou :8000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
npm start -- --port 3001  # Pour React
python manage.py runserver 8001  # Pour Django
```

### Leaflet: Marqueurs ne s'affichent pas

**Solution:**
```bash
# Vérifier que Leaflet CSS est chargé dans public/index.html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

# Vider le cache du navigateur: Ctrl+Shift+R
```

---

## 📚 Ressources Supplémentaires

- **Guide de Test Complet**: `docs/GUIDE_TEST_INTEGRATION.md`
- **Documentation API**: http://127.0.0.1:8000/api/docs/
- **Troubleshooting**: `TROUBLESHOOTING.md` (à venir)
- **Architecture du Projet**: `docs/DOCUMENTATION_INDEX.md`

---

## 💡 Conseils pour les Équipes

### Équipe Backend:
- Toujours activer le `venv` avant de travailler
- Créer une nouvelle branche pour chaque fonctionnalité
- Tester les endpoints avec Postman ou curl
- Documenter les nouvelles APIs dans Swagger

### Équipe Frontend:
- Utiliser `npm start` pour le développement (hot reload)
- Vérifier la console navigateur (F12) pour les erreurs
- Tester sur différents navigateurs (Chrome, Firefox)
- Respecter le thème médical (couleurs, icônes)

### Communication Backend ↔ Frontend:
- Backend doit toujours être lancé en premier
- Vérifier CORS si erreurs de connexion
- Utiliser le fichier `.env` pour les URLs
- Communiquer les changements d'API

---

## ✅ Checklist d'Installation Complète

### Backend:
- [ ] Python 3.11+ installé
- [ ] PostgreSQL + PostGIS installés
- [ ] Environnement virtuel créé et activé
- [ ] Dépendances installées (`pip install -r requirements.txt`)
- [ ] Base de données créée (`findpharma`)
- [ ] Fichier `.env` configuré
- [ ] Migrations appliquées (`python manage.py migrate`)
- [ ] Superutilisateur créé
- [ ] Serveur démarre sans erreur (port 8000)
- [ ] API accessible à http://127.0.0.1:8000/api/

### Frontend:
- [ ] Node.js 18+ installé
- [ ] npm/yarn installé
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` configuré
- [ ] Serveur démarre sans erreur (port 3000)
- [ ] Application accessible à http://localhost:3000/
- [ ] Carte Leaflet s'affiche correctement

### Intégration:
- [ ] Backend et Frontend lancés simultanément
- [ ] Pas d'erreur CORS
- [ ] Recherche de médicament fonctionne
- [ ] Géolocalisation fonctionne
- [ ] Marqueurs s'affichent sur la carte

---

**🎉 Installation terminée! Vous êtes prêt à développer sur FindPharma!**

Pour toute question ou problème, consultez:
- Le fichier `TROUBLESHOOTING.md`
- La documentation dans `docs/`
- Ou contactez le lead technique

---

*Guide d'installation créé pour FindPharma - Version 1.0*
