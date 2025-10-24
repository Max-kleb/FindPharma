# FindPharma - Backend

Application web permettant de trouver rapidement une pharmacie proche disposant d'un médicament recherché.

## Technologies

- **Backend** : Django REST Framework
- **Base de données** : PostgreSQL
- **Documentation API** : Swagger (drf-spectacular)
- **Cartographie** : Leaflet (pour l'admin)

## User Stories Complétées

### ✅ User Story 1 : Géolocalisation des pharmacies
- Localisation des pharmacies
- Recherche par proximité (rayon en km)
- Calcul de distance avec formule Haversine
- API REST complète

## Installation

### Prérequis
- Python 3.11+
- PostgreSQL 14+
- PostGIS extension

### Installation

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd FindPharma
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE findpharma;
\c findpharma
CREATE EXTENSION postgis;
\q
```

5. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Modifiez .env avec vos paramètres
```

6. **Appliquer les migrations**
```bash
python manage.py migrate
```

7. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```

8. **Charger les données de test**
```bash
python scripts/populate_pharmacies.py
```

9. **Lancer le serveur**
```bash
python manage.py runserver
```

## Endpoints API

### Pharmacies

- **Liste** : `GET /api/pharmacies/`
- **Détails** : `GET /api/pharmacies/{id}/`
- **Créer** : `POST /api/pharmacies/`
- **Modifier** : `PUT/PATCH /api/pharmacies/{id}/`
- **Supprimer** : `DELETE /api/pharmacies/{id}/`
- **Proximité** : `GET /api/pharmacies/nearby/?latitude=X&longitude=Y&radius=Z`

### Documentation

- **Swagger UI** : http://localhost:8000/api/docs/
- **ReDoc** : http://localhost:8000/api/redoc/
- **Admin Django** : http://localhost:8000/admin/

## Exemples d'utilisation

### Rechercher des pharmacies proches
```bash
curl "http://localhost:8000/api/pharmacies/nearby/?latitude=3.8480&longitude=11.5021&radius=5"
```

### Réponse
```json
{
  "count": 3,
  "user_location": {
    "latitude": 3.848,
    "longitude": 11.5021
  },
  "radius_km": 5,
  "results": [
    {
      "id": 1,
      "name": "Pharmacie Centrale",
      "address": "Avenue Kennedy, Yaoundé",
      "phone": "+237 222 23 45 67",
      "latitude": 3.848,
      "longitude": 11.5021,
      "distance": 0.0
    }
  ]
}
```

## Structure du projet
```
FindPharma/
├── FindPharma/          # Configuration principale
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── pharmacies/          # App pharmacies
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── scripts/             # Scripts utilitaires
│   ├── populate_pharmacies.py
│   └── update_locations.py
├── requirements.txt
└── manage.py
```

## Tests
```bash
python manage.py test
```

## Auteurs

- Votre équipe

## Licence

MIT
EOFcat > README.md << 'EOF'
# FindPharma - Backend

Application web permettant de trouver rapidement une pharmacie proche disposant d'un médicament recherché.

## Technologies

- **Backend** : Django REST Framework
- **Base de données** : PostgreSQL
- **Documentation API** : Swagger (drf-spectacular)
- **Cartographie** : Leaflet (pour l'admin)

## User Stories Complétées

### ✅ User Story 1 : Géolocalisation des pharmacies
- Localisation des pharmacies
- Recherche par proximité (rayon en km)
- Calcul de distance avec formule Haversine
- API REST complète

## Installation

### Prérequis
- Python 3.11+
- PostgreSQL 14+
- PostGIS extension

### Installation

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd FindPharma
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE findpharma;
\c findpharma
CREATE EXTENSION postgis;
\q
```

5. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Modifiez .env avec vos paramètres
```

6. **Appliquer les migrations**
```bash
python manage.py migrate
```

7. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```

8. **Charger les données de test**
```bash
python scripts/populate_pharmacies.py
```

9. **Lancer le serveur**
```bash
python manage.py runserver
```

## Endpoints API

### Pharmacies

- **Liste** : `GET /api/pharmacies/`
- **Détails** : `GET /api/pharmacies/{id}/`
- **Créer** : `POST /api/pharmacies/`
- **Modifier** : `PUT/PATCH /api/pharmacies/{id}/`
- **Supprimer** : `DELETE /api/pharmacies/{id}/`
- **Proximité** : `GET /api/pharmacies/nearby/?latitude=X&longitude=Y&radius=Z`

### Documentation

- **Swagger UI** : http://localhost:8000/api/docs/
- **ReDoc** : http://localhost:8000/api/redoc/
- **Admin Django** : http://localhost:8000/admin/

## Exemples d'utilisation

### Rechercher des pharmacies proches
```bash
curl "http://localhost:8000/api/pharmacies/nearby/?latitude=3.8480&longitude=11.5021&radius=5"
```

### Réponse
```json
{
  "count": 3,
  "user_location": {
    "latitude": 3.848,
    "longitude": 11.5021
  },
  "radius_km": 5,
  "results": [
    {
      "id": 1,
      "name": "Pharmacie Centrale",
      "address": "Avenue Kennedy, Yaoundé",
      "phone": "+237 222 23 45 67",
      "latitude": 3.848,
      "longitude": 11.5021,
      "distance": 0.0
    }
  ]
}
```

## Structure du projet
```
FindPharma/
├── FindPharma/          # Configuration principale
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── pharmacies/          # App pharmacies
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── scripts/             # Scripts utilitaires
│   ├── populate_pharmacies.py
│   └── update_locations.py
├── requirements.txt
└── manage.py
```

## Tests
```bash
python manage.py test
```

## Auteurs

- Votre équipe

## Licence

MIT
