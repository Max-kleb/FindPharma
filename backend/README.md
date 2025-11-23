# 🏥 FindPharma - API de Gestion des Pharmacies# FindPharma - Backend



## 📋 DescriptionApplication web permettant de trouver rapidement une pharmacie proche disposant d'un médicament recherché.



FindPharma est une plateforme API REST complète permettant de gérer un réseau de pharmacies au Cameroun. Le système offre des fonctionnalités de recherche de médicaments, localisation de pharmacies, gestion des stocks et interface d'administration pour les pharmacies.## Technologies



## 🚀 Fonctionnalités- **Backend** : Django REST Framework

- **Base de données** : PostgreSQL

### User Story 1 : Recherche de Médicaments- **Documentation API** : Swagger (drf-spectacular)

- ✅ Recherche de médicaments par nom- **Cartographie** : Leaflet (pour l'admin)

- ✅ Filtrage par disponibilité

- ✅ Recherche dans les descriptions et dosages## User Stories Complétées

- ✅ Affichage des pharmacies disposant du médicament

### ✅ User Story 1 : Géolocalisation des pharmacies

### User Story 2 : Localisation des Pharmacies- Localisation des pharmacies

- ✅ Recherche de pharmacies à proximité (rayon configurable)- Recherche par proximité (rayon en km)

- ✅ Intégration PostGIS pour calculs géospatiaux- Calcul de distance avec formule Haversine

- ✅ Filtrage par statut (ouvert/fermé)- API REST complète

- ✅ Tri par distance

## Installation

### User Story 3 : Gestion des Stocks (Backend)

- ✅ Authentification par token### Prérequis

- ✅ Modèle utilisateur personnalisé (admin/pharmacy/customer)- Python 3.11+

- ✅ CRUD complet pour la gestion des stocks- PostgreSQL 14+

- ✅ Interface d'administration pharmacie- PostGIS extension

  - Dashboard avec statistiques en temps réel

  - Gestion du profil pharmacie### Installation

  - Statistiques de stock détaillées

  - Historique des modifications1. **Cloner le repository**

- ✅ Permissions et sécurité (une pharmacie ne peut gérer que ses propres stocks)```bash

git clone <url-du-repo>

## 🛠️ Technologies Utiliséescd FindPharma

```

### Backend

- **Django 5.2.7** - Framework web Python2. **Créer un environnement virtuel**

- **Django REST Framework 3.16.1** - API REST```bash

- **PostgreSQL + PostGIS** - Base de données avec support géospatialpython -m venv venv

- **Token Authentication** - Système d'authentification sécurisésource venv/bin/activate  # Linux/Mac

- **drf-spectacular** - Documentation API automatique (Swagger/ReDoc)# ou

venv\Scripts\activate  # Windows

### Outils```

- **Python 3.13** - Langage de programmation

- **psycopg2** - Adaptateur PostgreSQL3. **Installer les dépendances**

- **python-decouple** - Gestion de la configuration```bash

pip install -r requirements.txt

## 📦 Installation```



### Prérequis4. **Configurer PostgreSQL**

- Python 3.13+```bash

- PostgreSQL 12+ avec extension PostGISsudo -u postgres psql

- GDAL/GEOS (pour les fonctionnalités géospatiales)CREATE DATABASE findpharma;

\c findpharma

### Étapes d'installationCREATE EXTENSION postgis;

\q

1. **Cloner le repository**```

```bash

git clone https://github.com/Max-kleb/FindPharma.git5. **Configurer les variables d'environnement**

cd FindPharma```bash

```cp .env.example .env

# Modifiez .env avec vos paramètres

2. **Créer et activer l'environnement virtuel**```

```bash

python -m venv venv_system6. **Appliquer les migrations**

source venv_system/bin/activate  # Linux/Mac```bash

# oupython manage.py migrate

venv_system\Scripts\activate  # Windows```

```

7. **Créer un superutilisateur**

3. **Installer les dépendances**```bash

```bashpython manage.py createsuperuser

pip install -r requirements.txt```

```

8. **Charger les données de test**

4. **Configurer PostgreSQL**```bash

```bashpython scripts/populate_pharmacies.py

# Créer la base de données```

sudo -u postgres psql

CREATE DATABASE findpharma;9. **Lancer le serveur**

CREATE USER findpharmauser WITH PASSWORD 'root';```bash

GRANT ALL PRIVILEGES ON DATABASE findpharma TO findpharmauser;python manage.py runserver

\c findpharma```

CREATE EXTENSION postgis;

ALTER DATABASE findpharma OWNER TO findpharmauser;## Endpoints API

\q

```### Pharmacies



5. **Configuration du fichier .env**- **Liste** : `GET /api/pharmacies/`

```bash- **Détails** : `GET /api/pharmacies/{id}/`

# Créer un fichier .env à la racine du projet- **Créer** : `POST /api/pharmacies/`

USE_SQLITE=False- **Modifier** : `PUT/PATCH /api/pharmacies/{id}/`

DATABASE_NAME=findpharma- **Supprimer** : `DELETE /api/pharmacies/{id}/`

DATABASE_USER=findpharmauser- **Proximité** : `GET /api/pharmacies/nearby/?latitude=X&longitude=Y&radius=Z`

DATABASE_PASSWORD=root

DATABASE_HOST=localhost### Documentation

DATABASE_PORT=5432

SECRET_KEY=your-secret-key-here- **Swagger UI** : http://localhost:8000/api/docs/

DEBUG=True- **ReDoc** : http://localhost:8000/api/redoc/

```- **Admin Django** : http://localhost:8000/admin/



6. **Appliquer les migrations**## Exemples d'utilisation

```bash

cd FindPharma### Rechercher des pharmacies proches

python manage.py migrate```bash

```curl "http://localhost:8000/api/pharmacies/nearby/?latitude=3.8480&longitude=11.5021&radius=5"

```

7. **Créer un superutilisateur**

```bash### Réponse

python manage.py createsuperuser```json

```{

  "count": 3,

8. **Charger les données de test (optionnel)**  "user_location": {

```bash    "latitude": 3.848,

python manage.py shell    "longitude": 11.5021

>>> exec(open('scripts/populate_pharmacies.py').read())  },

```  "radius_km": 5,

  "results": [

9. **Lancer le serveur**    {

```bash      "id": 1,

python manage.py runserver      "name": "Pharmacie Centrale",

```      "address": "Avenue Kennedy, Yaoundé",

      "phone": "+237 222 23 45 67",

Le serveur démarre sur : http://127.0.0.1:8000/      "latitude": 3.848,

      "longitude": 11.5021,

## 📚 Documentation de l'API      "distance": 0.0

    }

### URLs Principales  ]

}

- **API Root** : http://127.0.0.1:8000/api/```

- **Documentation Swagger** : http://127.0.0.1:8000/api/docs/

- **Documentation ReDoc** : http://127.0.0.1:8000/api/redoc/## Structure du projet

- **Interface Admin** : http://127.0.0.1:8000/admin/```

FindPharma/

### Endpoints Disponibles├── FindPharma/          # Configuration principale

│   ├── settings.py

#### Authentification│   ├── urls.py

```│   └── wsgi.py

POST /api/token-auth/          # Obtenir un token d'authentification├── pharmacies/          # App pharmacies

```│   ├── models.py

│   ├── views.py

#### Recherche│   ├── serializers.py

```│   ├── urls.py

GET /api/search/?q={query}     # Recherche de médicaments│   └── admin.py

GET /api/nearby/?lat={lat}&lon={lon}&radius={radius}  # Pharmacies à proximité├── scripts/             # Scripts utilitaires

```│   ├── populate_pharmacies.py

│   └── update_locations.py

#### Pharmacies├── requirements.txt

```└── manage.py

GET /api/pharmacies/           # Liste des pharmacies```

GET /api/pharmacies/{id}/      # Détails d'une pharmacie

GET /api/pharmacies/nearby/    # Pharmacies proches (avec coords)## Tests

``````bash

python manage.py test

#### Administration Pharmacie (Authentification requise)```

```

GET /api/my-pharmacy/dashboard/      # Dashboard avec statistiques## Auteurs

GET /api/my-pharmacy/profile/        # Profil de la pharmacie

PUT /api/my-pharmacy/profile/        # Modifier le profil- Votre équipe

PATCH /api/my-pharmacy/profile/      # Modification partielle

GET /api/my-pharmacy/stock-stats/    # Statistiques détaillées## Licence

GET /api/my-pharmacy/stock-history/  # Historique des modifications

```MIT

EOFcat > README.md << 'EOF'

#### Gestion des Stocks (Authentification requise)# FindPharma - Backend

```

GET    /api/pharmacies/{id}/stocks/              # Liste des stocksApplication web permettant de trouver rapidement une pharmacie proche disposant d'un médicament recherché.

POST   /api/pharmacies/{id}/stocks/              # Créer un stock

GET    /api/pharmacies/{id}/stocks/{stock_id}/   # Détails d'un stock## Technologies

PUT    /api/pharmacies/{id}/stocks/{stock_id}/   # Modifier un stock

PATCH  /api/pharmacies/{id}/stocks/{stock_id}/   # Modification partielle- **Backend** : Django REST Framework

DELETE /api/pharmacies/{id}/stocks/{stock_id}/   # Supprimer un stock- **Base de données** : PostgreSQL

POST   /api/pharmacies/{id}/stocks/{stock_id}/mark_available/     # Marquer disponible- **Documentation API** : Swagger (drf-spectacular)

POST   /api/pharmacies/{id}/stocks/{stock_id}/mark_unavailable/   # Marquer indisponible- **Cartographie** : Leaflet (pour l'admin)

```

## User Stories Complétées

## 🔐 Authentification

### ✅ User Story 1 : Géolocalisation des pharmacies

L'API utilise l'authentification par token. Pour obtenir un token :- Localisation des pharmacies

- Recherche par proximité (rayon en km)

```bash- Calcul de distance avec formule Haversine

curl -X POST http://127.0.0.1:8000/api/token-auth/ \- API REST complète

  -H "Content-Type: application/json" \

  -d '{"username": "your_username", "password": "your_password"}'## Installation

```

### Prérequis

Réponse :- Python 3.11+

```json- PostgreSQL 14+

{- PostGIS extension

  "token": "9e55758872d9cd58869fa9b4adc0327efc2a7e39"

}### Installation

```

1. **Cloner le repository**

Utiliser le token dans les requêtes :```bash

```bashgit clone <url-du-repo>

curl -X GET http://127.0.0.1:8000/api/my-pharmacy/dashboard/ \cd FindPharma

  -H "Authorization: Token 9e55758872d9cd58869fa9b4adc0327efc2a7e39"```

```

2. **Créer un environnement virtuel**

## 👥 Modèle Utilisateur```bash

python -m venv venv

Le système utilise un modèle utilisateur personnalisé avec 3 types :source venv/bin/activate  # Linux/Mac

# ou

- **admin** : Accès complet au systèmevenv\Scripts\activate  # Windows

- **pharmacy** : Gestion de sa propre pharmacie et stocks```

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
