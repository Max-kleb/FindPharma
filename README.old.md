# 🏥 FindPharma - Plateforme de Localisation de Médicaments# 🏥 FindPharma - API de Gestion des Pharmacies# FindPharma - Backend



**Système de géolocalisation de pharmacies et recherche de médicaments en temps réel**



[![Django](https://img.shields.io/badge/Django-5.2.7-green)](https://www.djangoproject.com/)## 📋 DescriptionApplication web permettant de trouver rapidement une pharmacie proche disposant d'un médicament recherché.

[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev/)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-orange)](https://postgis.net/)

FindPharma est une plateforme API REST complète permettant de gérer un réseau de pharmacies au Cameroun. Le système offre des fonctionnalités de recherche de médicaments, localisation de pharmacies, gestion des stocks et interface d'administration pour les pharmacies.## Technologies

---



## 📁 Structure du Projet

## 🚀 Fonctionnalités- **Backend** : Django REST Framework

```

FindPharma/- **Base de données** : PostgreSQL

├── backend/                    # 🐍 Backend Django REST Framework

│   ├── manage.py              # Script principal Django### User Story 1 : Recherche de Médicaments- **Documentation API** : Swagger (drf-spectacular)

│   ├── FindPharma/            # Configuration projet

│   ├── core/                  # App core (models, utils)- ✅ Recherche de médicaments par nom- **Cartographie** : Leaflet (pour l'admin)

│   ├── pharmacies/            # Gestion pharmacies

│   ├── medicines/             # Gestion médicaments- ✅ Filtrage par disponibilité

│   ├── stocks/                # Gestion stocks (User Story 3)

│   ├── users/                 # Authentification custom- ✅ Recherche dans les descriptions et dosages## User Stories Complétées

│   └── requirements.txt       # Dépendances Python

│- ✅ Affichage des pharmacies disposant du médicament

├── frontend/                   # ⚛️ Frontend React

│   ├── src/                   # Code source React### ✅ User Story 1 : Géolocalisation des pharmacies

│   │   ├── App.js            # Composant principal

│   │   ├── SearchSection.js  # Interface recherche### User Story 2 : Localisation des Pharmacies- Localisation des pharmacies

│   │   ├── ResultsDisplay.js # Affichage carte/résultats

│   │   └── services/         # API calls (à créer)- ✅ Recherche de pharmacies à proximité (rayon configurable)- Recherche par proximité (rayon en km)

│   ├── public/               # Assets statiques

│   └── package.json          # Dépendances Node- ✅ Intégration PostGIS pour calculs géospatiaux- Calcul de distance avec formule Haversine

│

├── docs/                       # 📚 Documentation- ✅ Filtrage par statut (ouvert/fermé)- API REST complète

│   ├── API_TESTING_GUIDE.md           # Guide tests API

│   ├── TEST_REPORT.md                 # Rapports de tests- ✅ Tri par distance

│   ├── FRONTEND_ANALYSIS.md           # Analyse frontend

│   ├── FRONTEND_INTEGRATION_GUIDE.md  # Guide intégration## Installation

│   └── DOCUMENTATION_INDEX.md         # Index documentation

│### User Story 3 : Gestion des Stocks (Backend)

├── scripts/                    # 🔧 Scripts utilitaires

│   ├── migrate_complete.sh    # Migration complète DB- ✅ Authentification par token### Prérequis

│   ├── start_server.sh        # Démarrage serveur Django

│   ├── populate_postgres.sh   # Peuplement DB- ✅ Modèle utilisateur personnalisé (admin/pharmacy/customer)- Python 3.11+

│   └── test_auth.sh          # Tests authentification

│- ✅ CRUD complet pour la gestion des stocks- PostgreSQL 14+

├── environments/               # 🌍 Environnements virtuels

│   ├── venv_system/          # Python venv principal- ✅ Interface d'administration pharmacie- PostGIS extension

│   └── env/                  # Env alternatif

│  - Dashboard avec statistiques en temps réel

├── .gitignore                  # Fichiers ignorés Git

└── README.md                   # Ce fichier  - Gestion du profil pharmacie### Installation

```

  - Statistiques de stock détaillées

---

  - Historique des modifications1. **Cloner le repository**

## 🚀 Démarrage Rapide

- ✅ Permissions et sécurité (une pharmacie ne peut gérer que ses propres stocks)```bash

### Prérequis

git clone <url-du-repo>

- **Python** 3.13+

- **Node.js** 18+ et npm## 🛠️ Technologies Utiliséescd FindPharma

- **PostgreSQL** 16+ avec **PostGIS** 3.4+

- **Git**```



### Installation Complète### Backend



#### 1. Cloner le Repository- **Django 5.2.7** - Framework web Python2. **Créer un environnement virtuel**



```bash- **Django REST Framework 3.16.1** - API REST```bash

git clone https://github.com/Max-kleb/FindPharma.git

cd FindPharma- **PostgreSQL + PostGIS** - Base de données avec support géospatialpython -m venv venv

```

- **Token Authentication** - Système d'authentification sécurisésource venv/bin/activate  # Linux/Mac

#### 2. Configuration Backend

- **drf-spectacular** - Documentation API automatique (Swagger/ReDoc)# ou

```bash

# Activer l'environnement virtuelvenv\Scripts\activate  # Windows

source environments/venv_system/bin/activate

### Outils```

# Installer les dépendances

cd backend- **Python 3.13** - Langage de programmation

pip install -r requirements.txt

- **psycopg2** - Adaptateur PostgreSQL3. **Installer les dépendances**

# Configurer la base de données

cd ../scripts- **python-decouple** - Gestion de la configuration```bash

chmod +x migrate_complete.sh

./migrate_complete.shpip install -r requirements.txt



# Revenir au backend et démarrer le serveur## 📦 Installation```

cd ../backend

python manage.py runserver

```

### Prérequis4. **Configurer PostgreSQL**

Le backend sera accessible sur : **http://127.0.0.1:8000/**

- Python 3.13+```bash

#### 3. Configuration Frontend

- PostgreSQL 12+ avec extension PostGISsudo -u postgres psql

```bash

# Dans un nouveau terminal- GDAL/GEOS (pour les fonctionnalités géospatiales)CREATE DATABASE findpharma;

cd frontend

\c findpharma

# Installer les dépendances

npm install### Étapes d'installationCREATE EXTENSION postgis;



# Démarrer le serveur de développement\q

npm start

```1. **Cloner le repository**```



Le frontend sera accessible sur : **http://localhost:3000/**```bash



---git clone https://github.com/Max-kleb/FindPharma.git5. **Configurer les variables d'environnement**



## 📖 User Stories Implémentéescd FindPharma```bash



### ✅ User Story 1 : Pharmacies à Proximité```cp .env.example .env



**En tant qu'utilisateur**, je veux voir les pharmacies proches de ma position.# Modifiez .env avec vos paramètres



**Endpoints** :2. **Créer et activer l'environnement virtuel**```

- `GET /api/nearby/?lat={lat}&lon={lon}&radius={radius}`

```bash

**Status** : Implémentée (Backend + Frontend)

python -m venv venv_system6. **Appliquer les migrations**

### ✅ User Story 2 : Recherche de Médicaments

source venv_system/bin/activate  # Linux/Mac```bash

**En tant qu'utilisateur**, je veux rechercher un médicament et voir les pharmacies qui le proposent.

# oupython manage.py migrate

**Endpoints** :

- `GET /api/search/?q={medication_name}`venv_system\Scripts\activate  # Windows```



**Status** : Implémentée (Backend + Frontend)```



### ✅ User Story 3 : Interface Pharmacie7. **Créer un superutilisateur**



**En tant que pharmacien**, je veux gérer mes stocks de médicaments.3. **Installer les dépendances**```bash



**Endpoints** :```bashpython manage.py createsuperuser

- `POST /api/token-auth/` - Authentification

- `GET /api/pharmacies/dashboard/` - Dashboardpip install -r requirements.txt```

- `GET /api/pharmacies/profile/` - Profil

- `GET /api/pharmacies/stats/` - Statistiques```

- `GET /api/pharmacies/stock-history/` - Historique

- `GET /api/pharmacies/{id}/stocks/` - Liste stocks8. **Charger les données de test**

- `POST /api/pharmacies/{id}/stocks/` - Créer stock

- `PUT /api/pharmacies/{id}/stocks/{stock_id}/` - Modifier stock4. **Configurer PostgreSQL**```bash

- `DELETE /api/pharmacies/{id}/stocks/{stock_id}/` - Supprimer stock

- `POST /api/pharmacies/{id}/stocks/{stock_id}/mark_available/` - Marquer disponible```bashpython scripts/populate_pharmacies.py

- `POST /api/pharmacies/{id}/stocks/{stock_id}/mark_unavailable/` - Marquer indisponible

# Créer la base de données```

**Status** : Implémentée (Backend uniquement, Frontend à venir)

sudo -u postgres psql

---

CREATE DATABASE findpharma;9. **Lancer le serveur**

## 🔐 Authentification

CREATE USER findpharmauser WITH PASSWORD 'root';```bash

### Compte Test Pharmacie

GRANT ALL PRIVILEGES ON DATABASE findpharma TO findpharmauser;python manage.py runserver

```

Username: pharma1\c findpharma```

Password: test123

Pharmacy: Pharmacie BastosCREATE EXTENSION postgis;

Token: 9e55758872d9cd58869fa9b4adc0327efc2a7e39

```ALTER DATABASE findpharma OWNER TO findpharmauser;## Endpoints API



### Utilisation du Token\q



```bash```### Pharmacies

curl -H "Authorization: Token 9e55758872d9cd58869fa9b4adc0327efc2a7e39" \

     http://127.0.0.1:8000/api/pharmacies/dashboard/

```

5. **Configuration du fichier .env**- **Liste** : `GET /api/pharmacies/`

---

```bash- **Détails** : `GET /api/pharmacies/{id}/`

## 🧪 Tests

# Créer un fichier .env à la racine du projet- **Créer** : `POST /api/pharmacies/`

### Tests Backend

USE_SQLITE=False- **Modifier** : `PUT/PATCH /api/pharmacies/{id}/`

```bash

cd backendDATABASE_NAME=findpharma- **Supprimer** : `DELETE /api/pharmacies/{id}/`

python manage.py test

DATABASE_USER=findpharmauser- **Proximité** : `GET /api/pharmacies/nearby/?latitude=X&longitude=Y&radius=Z`

# Tests spécifiques

python manage.py test pharmaciesDATABASE_PASSWORD=root

python manage.py test stocks

python manage.py test usersDATABASE_HOST=localhost### Documentation

```

DATABASE_PORT=5432

### Tests API (Manuel)

SECRET_KEY=your-secret-key-here- **Swagger UI** : http://localhost:8000/api/docs/

```bash

# Utiliser le script de testsDEBUG=True- **ReDoc** : http://localhost:8000/api/redoc/

cd scripts

chmod +x test_auth.sh```- **Admin Django** : http://localhost:8000/admin/

./test_auth.sh

```



Ou consulter : `docs/API_TESTING_GUIDE.md`6. **Appliquer les migrations**## Exemples d'utilisation



### Tests Frontend```bash



```bashcd FindPharma### Rechercher des pharmacies proches

cd frontend

npm testpython manage.py migrate```bash

```

```curl "http://localhost:8000/api/pharmacies/nearby/?latitude=3.8480&longitude=11.5021&radius=5"

---

```

## 📊 Base de Données

7. **Créer un superutilisateur**

### Schéma Principal

```bash### Réponse

- **pharmacies** : Informations pharmacies (nom, adresse, coordonnées GPS, contact)

- **medicines** : Catalogue médicaments (nom, dosage, forme, description)python manage.py createsuperuser```json

- **stocks** : Stocks médicaments par pharmacie (quantité, prix, disponibilité)

- **users** : Utilisateurs custom (admin, pharmacy, customer)```{



### Connexion PostgreSQL  "count": 3,



```bash8. **Charger les données de test (optionnel)**  "user_location": {

psql -U findpharmauser -d findpharma -h localhost

``````bash    "latitude": 3.848,



### Données de Testpython manage.py shell    "longitude": 11.5021



Le projet contient actuellement :>>> exec(open('scripts/populate_pharmacies.py').read())  },

- **8 pharmacies** (Yaoundé, Douala)

- **23 médicaments** (Paracétamol, Aspirine, Amoxicilline, etc.)```  "radius_km": 5,

- **151 stocks** (relations pharmacie-médicament)

  "results": [

---

9. **Lancer le serveur**    {

## 🛠️ Scripts Utilitaires

```bash      "id": 1,

### Démarrer le Serveur

python manage.py runserver      "name": "Pharmacie Centrale",

```bash

cd scripts```      "address": "Avenue Kennedy, Yaoundé",

./start_server.sh

```      "phone": "+237 222 23 45 67",



### Migration ComplèteLe serveur démarre sur : http://127.0.0.1:8000/      "latitude": 3.848,



```bash      "longitude": 11.5021,

cd scripts

./migrate_complete.sh## 📚 Documentation de l'API      "distance": 0.0

```

    }

### Peupler la Base de Données

### URLs Principales  ]

```bash

cd scripts}

./populate_postgres.sh

```- **API Root** : http://127.0.0.1:8000/api/```



---- **Documentation Swagger** : http://127.0.0.1:8000/api/docs/



## 📚 Documentation Complète- **Documentation ReDoc** : http://127.0.0.1:8000/api/redoc/## Structure du projet



| Document | Description |- **Interface Admin** : http://127.0.0.1:8000/admin/```

|----------|-------------|

| [API Testing Guide](docs/API_TESTING_GUIDE.md) | Guide complet de test des API avec exemples curl |FindPharma/

| [Test Report](docs/TEST_REPORT.md) | Rapport détaillé des tests effectués |

| [Frontend Analysis](docs/FRONTEND_ANALYSIS.md) | Analyse de l'architecture frontend React |### Endpoints Disponibles├── FindPharma/          # Configuration principale

| [Frontend Integration Guide](docs/FRONTEND_INTEGRATION_GUIDE.md) | Guide d'intégration Frontend-Backend |

| [Documentation Index](docs/DOCUMENTATION_INDEX.md) | Index de toute la documentation |│   ├── settings.py



---#### Authentification│   ├── urls.py



## 🌐 Configuration CORS```│   └── wsgi.py



Pour connecter le frontend au backend, CORS est déjà configuré pour :POST /api/token-auth/          # Obtenir un token d'authentification├── pharmacies/          # App pharmacies



```python```│   ├── models.py

CORS_ALLOWED_ORIGINS = [

    "http://localhost:3000",│   ├── views.py

    "http://127.0.0.1:3000",

]#### Recherche│   ├── serializers.py

```

```│   ├── urls.py

---

GET /api/search/?q={query}     # Recherche de médicaments│   └── admin.py

## 🔧 Technologies Utilisées

GET /api/nearby/?lat={lat}&lon={lon}&radius={radius}  # Pharmacies à proximité├── scripts/             # Scripts utilitaires

### Backend

- **Django** 5.2.7```│   ├── populate_pharmacies.py

- **Django REST Framework** 3.15.2

- **PostgreSQL** 16 avec **PostGIS** 3.4│   └── update_locations.py

- **Token Authentication**

- **django-cors-headers** (pour CORS)#### Pharmacies├── requirements.txt



### Frontend```└── manage.py

- **React** 19.2.0

- **Leaflet** 1.9.4 (cartes interactives)GET /api/pharmacies/           # Liste des pharmacies```

- **react-leaflet** 5.0.0

- **Create React App** (boilerplate)GET /api/pharmacies/{id}/      # Détails d'une pharmacie



### DevOpsGET /api/pharmacies/nearby/    # Pharmacies proches (avec coords)## Tests

- **Git** (versioning)

- **GitHub** (hébergement code)``````bash

- **PostgreSQL** (base de données)

- **PostGIS** (extension géospatiale)python manage.py test



---#### Administration Pharmacie (Authentification requise)```



## 📋 Variables d'Environnement```



### Backend (`backend/.env`)GET /api/my-pharmacy/dashboard/      # Dashboard avec statistiques## Auteurs



```envGET /api/my-pharmacy/profile/        # Profil de la pharmacie

DEBUG=True

SECRET_KEY=your-secret-keyPUT /api/my-pharmacy/profile/        # Modifier le profil- Votre équipe

DATABASE_NAME=findpharma

DATABASE_USER=findpharmauserPATCH /api/my-pharmacy/profile/      # Modification partielle

DATABASE_PASSWORD=your-password

DATABASE_HOST=localhostGET /api/my-pharmacy/stock-stats/    # Statistiques détaillées## Licence

DATABASE_PORT=5432

```GET /api/my-pharmacy/stock-history/  # Historique des modifications



### Frontend (`frontend/.env`)```MIT



```envEOFcat > README.md << 'EOF'

REACT_APP_API_URL=http://127.0.0.1:8000

REACT_APP_DEFAULT_LAT=3.8480#### Gestion des Stocks (Authentification requise)# FindPharma - Backend

REACT_APP_DEFAULT_LNG=11.5021

REACT_APP_DEFAULT_RADIUS=5000```

```

GET    /api/pharmacies/{id}/stocks/              # Liste des stocksApplication web permettant de trouver rapidement une pharmacie proche disposant d'un médicament recherché.

---

POST   /api/pharmacies/{id}/stocks/              # Créer un stock

## 🚧 Prochaines Étapes

GET    /api/pharmacies/{id}/stocks/{stock_id}/   # Détails d'un stock## Technologies

### Phase 1 : Intégration Frontend-Backend ⏳

- [ ] Configurer CORSPUT    /api/pharmacies/{id}/stocks/{stock_id}/   # Modifier un stock

- [ ] Créer service API frontend (`services/api.js`)

- [ ] Connecter SearchSection à `/api/search/`PATCH  /api/pharmacies/{id}/stocks/{stock_id}/   # Modification partielle- **Backend** : Django REST Framework

- [ ] Connecter géolocalisation à `/api/nearby/`

- [ ] Tests intégration complèteDELETE /api/pharmacies/{id}/stocks/{stock_id}/   # Supprimer un stock- **Base de données** : PostgreSQL



### Phase 2 : User Story 3 Frontend 📱POST   /api/pharmacies/{id}/stocks/{stock_id}/mark_available/     # Marquer disponible- **Documentation API** : Swagger (drf-spectacular)

- [ ] Page de connexion pharmacie

- [ ] Dashboard pharmaciePOST   /api/pharmacies/{id}/stocks/{stock_id}/mark_unavailable/   # Marquer indisponible- **Cartographie** : Leaflet (pour l'admin)

- [ ] Interface gestion stocks

- [ ] Statistiques visuelles```



### Phase 3 : User Story 4 📦## User Stories Complétées

- [ ] Gestion avancée des stocks

- [ ] Notifications## 🔐 Authentification

- [ ] Historique détaillé

### ✅ User Story 1 : Géolocalisation des pharmacies

### Phase 4 : Déploiement 🌍

- [ ] Build production frontendL'API utilise l'authentification par token. Pour obtenir un token :- Localisation des pharmacies

- [ ] Configuration serveur web (Nginx)

- [ ] Configuration domaine- Recherche par proximité (rayon en km)

- [ ] SSL/HTTPS

- [ ] Monitoring```bash- Calcul de distance avec formule Haversine



---curl -X POST http://127.0.0.1:8000/api/token-auth/ \- API REST complète



## 🤝 Contribution  -H "Content-Type: application/json" \



### Branches Git  -d '{"username": "your_username", "password": "your_password"}'## Installation



- `main` : Production stable```

- `restructure-project` : Restructuration du projet (en cours)

- `feature/user-story-X` : Développement user stories### Prérequis



### WorkflowRéponse :- Python 3.11+



1. Créer une branche feature```json- PostgreSQL 14+

2. Développer et tester localement

3. Commit avec messages clairs{- PostGIS extension

4. Push et créer Pull Request

5. Review et merge  "token": "9e55758872d9cd58869fa9b4adc0327efc2a7e39"



---}### Installation



## 👥 Équipe```



- **Backend** : Max-kleb1. **Cloner le repository**

- **Frontend** : Équipe Frontend

- **Database** : Max-klebUtiliser le token dans les requêtes :```bash

- **DevOps** : Max-kleb

```bashgit clone <url-du-repo>

---

curl -X GET http://127.0.0.1:8000/api/my-pharmacy/dashboard/ \cd FindPharma

## 📄 Licence

  -H "Authorization: Token 9e55758872d9cd58869fa9b4adc0327efc2a7e39"```

Ce projet est développé dans le cadre d'un projet académique/professionnel.

```

---

2. **Créer un environnement virtuel**

## 📞 Support

## 👥 Modèle Utilisateur```bash

Pour toute question ou problème :

python -m venv venv

1. Consulter la [documentation](docs/DOCUMENTATION_INDEX.md)

2. Vérifier les [issues GitHub](https://github.com/Max-kleb/FindPharma/issues)Le système utilise un modèle utilisateur personnalisé avec 3 types :source venv/bin/activate  # Linux/Mac

3. Contacter l'équipe de développement

# ou

---

- **admin** : Accès complet au systèmevenv\Scripts\activate  # Windows

**Dernière mise à jour** : 23 novembre 2025  

**Version** : 1.0.0 (Restructuration)  - **pharmacy** : Gestion de sa propre pharmacie et stocks```

**Statut** : En développement actif 🚀

- **customer** : Consultation uniquement (futur)

3. **Installer les dépendances**

### Créer un utilisateur pharmacie```bash

pip install -r requirements.txt

```python```

python manage.py shell

4. **Configurer PostgreSQL**

from users.models import User```bash

from pharmacies.models import Pharmacysudo -u postgres psql

CREATE DATABASE findpharma;

# Récupérer une pharmacie\c findpharma

pharmacy = Pharmacy.objects.get(id=1)CREATE EXTENSION postgis;

\q

# Créer l'utilisateur```

user = User.objects.create_user(

    username='pharma1',5. **Configurer les variables d'environnement**

    email='pharma1@example.com',```bash

    password='securepassword',cp .env.example .env

    user_type='pharmacy',# Modifiez .env avec vos paramètres

    pharmacy=pharmacy```

)

```6. **Appliquer les migrations**

```bash

## 📊 Structure du Projetpython manage.py migrate

```

```

FindPharma/7. **Créer un superutilisateur**

├── FindPharma/              # Configuration du projet```bash

│   ├── settings.py          # Paramètres Djangopython manage.py createsuperuser

│   ├── urls.py              # URLs principales```

│   └── wsgi.py              # Point d'entrée WSGI

├── users/                   # App de gestion des utilisateurs8. **Charger les données de test**

│   ├── models.py            # Modèle User personnalisé```bash

│   └── admin.py             # Configuration adminpython scripts/populate_pharmacies.py

├── pharmacies/              # App pharmacies```

│   ├── models.py            # Modèle Pharmacy

│   ├── serializers.py       # Serializers DRF9. **Lancer le serveur**

│   ├── views.py             # Views et endpoints```bash

│   └── urls.py              # URLs pharmaciespython manage.py runserver

├── medicines/               # App médicaments```

│   ├── models.py            # Modèle Medicine

│   └── serializers.py       # Serializers## Endpoints API

├── stocks/                  # App gestion des stocks

│   ├── models.py            # Modèle Stock### Pharmacies

│   ├── serializers.py       # Serializers

│   ├── views.py             # ViewSet CRUD- **Liste** : `GET /api/pharmacies/`

│   ├── permissions.py       # Permissions personnalisées- **Détails** : `GET /api/pharmacies/{id}/`

│   └── urls.py              # URLs stocks- **Créer** : `POST /api/pharmacies/`

├── scripts/                 # Scripts utilitaires- **Modifier** : `PUT/PATCH /api/pharmacies/{id}/`

│   ├── populate_pharmacies.py- **Supprimer** : `DELETE /api/pharmacies/{id}/`

│   └── init_db.py- **Proximité** : `GET /api/pharmacies/nearby/?latitude=X&longitude=Y&radius=Z`

├── requirements.txt         # Dépendances Python

└── manage.py               # Commandes Django### Documentation

```

- **Swagger UI** : http://localhost:8000/api/docs/

## 🧪 Tests- **ReDoc** : http://localhost:8000/api/redoc/

- **Admin Django** : http://localhost:8000/admin/

Pour lancer les tests :

## Exemples d'utilisation

```bash

python manage.py test### Rechercher des pharmacies proches

``````bash

curl "http://localhost:8000/api/pharmacies/nearby/?latitude=3.8480&longitude=11.5021&radius=5"

Tests disponibles :```

- Tests unitaires des modèles

- Tests des endpoints API### Réponse

- Tests de permissions```json

- Tests d'authentification{

  "count": 3,

Consultez `TEST_REPORT.md` pour les résultats détaillés.  "user_location": {

    "latitude": 3.848,

## 📖 Guides Complémentaires    "longitude": 11.5021

  },

- **API_TESTING_GUIDE.md** - Guide complet de test de l'API avec exemples curl  "radius_km": 5,

- **TEST_REPORT.md** - Rapport de test détaillé avec résultats  "results": [

    {

## 🗃️ Données de Démonstration      "id": 1,

      "name": "Pharmacie Centrale",

Le système inclut des données de test :      "address": "Avenue Kennedy, Yaoundé",

- 8 pharmacies réparties à Yaoundé      "phone": "+237 222 23 45 67",

- 23 médicaments courants (antipaludiques, antibiotiques, analgésiques, etc.)      "latitude": 3.848,

- 151 stocks avec prix et quantités réalistes      "longitude": 11.5021,

      "distance": 0.0

## 🔧 Configuration Avancée    }

  ]

### Mode SQLite (Développement sans PostGIS)}

```

Pour un développement rapide sans PostGIS :

## Structure du projet

```bash```

# Dans .envFindPharma/

USE_SQLITE=True├── FindPharma/          # Configuration principale

```│   ├── settings.py

│   ├── urls.py

⚠️ **Note** : Les fonctionnalités géospatiales seront limitées en mode SQLite.│   └── wsgi.py

├── pharmacies/          # App pharmacies

### Variables d'environnement│   ├── models.py

│   ├── views.py

| Variable | Description | Défaut |│   ├── serializers.py

|----------|-------------|--------|│   ├── urls.py

| `USE_SQLITE` | Utiliser SQLite au lieu de PostgreSQL | `False` |│   └── admin.py

| `DATABASE_NAME` | Nom de la base PostgreSQL | `findpharma` |├── scripts/             # Scripts utilitaires

| `DATABASE_USER` | Utilisateur PostgreSQL | `findpharmauser` |│   ├── populate_pharmacies.py

| `DATABASE_PASSWORD` | Mot de passe PostgreSQL | `root` |│   └── update_locations.py

| `DATABASE_HOST` | Hôte PostgreSQL | `localhost` |├── requirements.txt

| `DATABASE_PORT` | Port PostgreSQL | `5432` |└── manage.py

| `SECRET_KEY` | Clé secrète Django | (généré) |```

| `DEBUG` | Mode debug | `True` |

## Tests

## 🚦 Statut du Projet```bash

python manage.py test

### ✅ Fonctionnalités Implémentées```

- [x] User Story 1 : Recherche de médicaments

- [x] User Story 2 : Localisation des pharmacies## Auteurs

- [x] User Story 3 : Gestion des stocks (Backend)

  - [x] Authentification- Votre équipe

  - [x] CRUD Stocks

  - [x] Interface Admin## Licence

  - [x] Permissions

MIT

### 🔄 En Cours
- [ ] Frontend Web (React/Vue.js)
- [ ] Application Mobile
- [ ] Système de notifications
- [ ] Gestion des commandes

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Auteur

**Max-kleb**
- GitHub: [@Max-kleb](https://github.com/Max-kleb)

## 🙏 Remerciements

- Django REST Framework pour l'excellent framework API
- PostGIS pour les capacités géospatiales
- La communauté open-source

---

**Version** : 1.0.0  
**Dernière mise à jour** : 23 novembre 2025
