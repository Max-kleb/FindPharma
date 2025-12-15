# 📋 Rapport Technique Complet - FindPharma

**Plateforme de Localisation de Pharmacies et Médicaments au Cameroun**

---

| Métadonnées | Valeur |
|-------------|--------|
| **Nom du projet** | FindPharma |
| **Version** | 1.0.0 |
| **Date du rapport** | 15 décembre 2025 |
| **Auteur** | Équipe FindPharma |
| **Licence** | MIT |

---

## 📑 Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Architecture Technique](#2-architecture-technique)
3. [Backend Django](#3-backend-django)
4. [Frontend React](#4-frontend-react)
5. [Base de Données](#5-base-de-données)
6. [API REST](#6-api-rest)
7. [Authentification et Sécurité](#7-authentification-et-sécurité)
8. [Internationalisation](#8-internationalisation)
9. [Docker et Déploiement](#9-docker-et-déploiement)
10. [Tests](#10-tests)
11. [Fonctionnalités Métier](#11-fonctionnalités-métier)
12. [Statistiques du Projet](#12-statistiques-du-projet)
13. [Roadmap et Évolutions](#13-roadmap-et-évolutions)

---

## 1. Vue d'Ensemble

### 1.1 Description du Projet

FindPharma est une application web fullstack qui révolutionne l'accès aux médicaments au Cameroun. Elle permet aux citoyens de :

- 🔍 **Rechercher des médicaments** et trouver instantanément les pharmacies qui les ont en stock
- 📍 **Localiser les pharmacies proches** avec géolocalisation GPS et rayon personnalisable
- 💰 **Comparer les prix** et consulter la disponibilité en temps réel
- 🗺️ **Visualiser sur une carte interactive** avec marqueurs colorés
- 🛒 **Réserver des médicaments** et gérer son panier
- 🌐 **Utiliser en 3 langues** : Français, Anglais, Espagnol

### 1.2 Problématique Résolue

Au Cameroun, trouver un médicament spécifique peut être un véritable parcours du combattant :
- Pas de système centralisé d'information sur la disponibilité
- Déplacements inutiles vers des pharmacies en rupture de stock
- Difficulté à comparer les prix entre pharmacies
- Manque de visibilité sur les pharmacies de garde

FindPharma résout ces problèmes en offrant une plateforme unique et moderne.

### 1.3 Public Cible

| Type d'Utilisateur | Besoins |
|-------------------|---------|
| **Patients/Citoyens** | Trouver rapidement un médicament, comparer les prix, réserver |
| **Pharmacies** | Gérer leur stock, recevoir des réservations, être visible |
| **Administrateurs** | Superviser la plateforme, gérer les utilisateurs |

---

## 2. Architecture Technique

### 2.1 Vue Globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UTILISATEUR                                 │
│                          (Navigateur Web / Mobile)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19)                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Pages     │  │  Components  │  │   Services  │  │    i18n       │  │
│  │   (13)      │  │    (30+)     │  │   (API)     │  │  (FR/EN/ES)   │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘  │
│                              Leaflet Maps                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                              HTTPS / REST
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                               │
│              Port 80 → Frontend | /api/* → Backend:8000                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Django REST Framework)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Apps      │  │    Views     │  │ Serializers │  │  Permissions  │  │
│  │  (8 apps)   │  │   (REST)     │  │   (DRF)     │  │   (JWT)       │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘  │
│                              62 Endpoints API                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL + PostGIS)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Pharmacies  │  │  Medicines   │  │   Stocks    │  │    Users      │  │
│  │   + GIS     │  │ + Wikipedia  │  │  + Price    │  │   + JWT       │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘  │
│                     11 Modèles | PostGIS Extensions                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Stack Technologique

#### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.11 | Langage principal |
| Django | 5.2.7 | Framework web |
| Django REST Framework | 3.16.1 | API REST |
| PostgreSQL | 15 | Base de données |
| PostGIS | 3.3 | Extensions géospatiales |
| djangorestframework-simplejwt | 5.5.1 | Authentification JWT |
| django-cors-headers | 4.9.0 | Gestion CORS |
| drf-spectacular | 0.28.0 | Documentation Swagger |
| Gunicorn | 21.2.0 | Serveur WSGI production |

#### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.2.0 | Framework UI |
| React Router DOM | 7.9.6 | Routage SPA |
| Leaflet | 1.9.4 | Cartes interactives |
| react-leaflet | 5.0.0 | Intégration Leaflet/React |
| i18next | 22.5.1 | Internationalisation |
| react-i18next | 12.3.1 | Bindings React pour i18n |
| Recharts | 3.5.1 | Graphiques et statistiques |

#### Infrastructure
| Technologie | Rôle |
|-------------|------|
| Docker | Conteneurisation |
| Docker Compose | Orchestration |
| Nginx | Reverse proxy / Serveur web |
| GitHub Actions | CI/CD |

---

## 3. Backend Django

### 3.1 Structure des Applications

```
backend/
├── FindPharma/          # Configuration Django
│   ├── settings.py      # Paramètres globaux
│   ├── urls.py          # URLs racine
│   └── wsgi.py          # Point d'entrée WSGI
│
├── core/                # Fonctionnalités centrales
│   ├── views.py         # Stats admin, contact
│   └── urls.py
│
├── pharmacies/          # Gestion des pharmacies
│   ├── models.py        # Pharmacy, PharmacyReview
│   ├── views.py         # CRUD + recherche géographique
│   ├── serializers.py
│   └── urls.py
│
├── medicines/           # Gestion des médicaments
│   ├── models.py        # Medicine
│   ├── views.py         # CRUD + autocomplétion
│   ├── serializers.py
│   └── urls.py
│
├── stocks/              # Gestion des stocks
│   ├── models.py        # Stock
│   ├── views.py         # CRUD stock par pharmacie
│   ├── serializers.py
│   └── urls.py
│
├── users/               # Authentification
│   ├── models.py        # User, SearchHistory, EmailVerification
│   ├── views.py         # Auth, profil, admin users
│   ├── serializers.py
│   └── urls.py
│
├── cart/                # Panier et réservations
│   ├── models.py        # Cart, CartItem, Reservation, ReservationItem
│   ├── views.py         # Gestion panier et réservations
│   ├── serializers.py
│   └── urls.py
│
├── manage.py            # CLI Django
├── requirements.txt     # Dépendances Python
├── Dockerfile           # Image Docker
└── docker-entrypoint.sh # Script de démarrage
```

### 3.2 Modèles de Données

#### 3.2.1 Pharmacy (pharmacies/models.py)

```python
class Pharmacy(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    location = models.PointField(geography=True, null=True)  # PostGIS
    opening_hours = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def average_rating(self):
        # Calcul de la note moyenne
        
    @property
    def reviews_count(self):
        # Nombre d'avis
```

#### 3.2.2 Medicine (medicines/models.py)

```python
class Medicine(models.Model):
    CATEGORY_CHOICES = [
        ('analgesique', 'Analgésique'),
        ('antibiotique', 'Antibiotique'),
        ('antipaludeen', 'Antipaludéen'),
        ('antiviral', 'Antiviral'),
        # ... 18 catégories au total
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    dosage = models.CharField(max_length=100)
    form = models.CharField(max_length=100)  # comprimé, sirop, etc.
    average_price = models.DecimalField(max_digits=10, decimal_places=2)
    requires_prescription = models.BooleanField(default=False)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    indications = models.TextField(blank=True)
    contraindications = models.TextField(blank=True)
    posology = models.TextField(blank=True)
    side_effects = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    wikipedia_url = models.URLField(blank=True)
```

#### 3.2.3 Stock (stocks/models.py)

```python
class Stock(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['pharmacy', 'medicine']
```

#### 3.2.4 User (users/models.py)

```python
class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Administrator'),
        ('pharmacy', 'Pharmacy User'),
        ('customer', 'Customer'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    pharmacy = models.ForeignKey(Pharmacy, null=True, on_delete=models.SET_NULL)
    phone = models.CharField(max_length=20, blank=True)
    
    def is_pharmacy_user(self):
        return self.user_type == 'pharmacy'
    
    def can_manage_pharmacy(self, pharmacy):
        return self.user_type == 'admin' or self.pharmacy == pharmacy
```

#### 3.2.5 Reservation (cart/models.py)

```python
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('ready', 'Prête'),
        ('collected', 'Récupérée'),
        ('cancelled', 'Annulée'),
        ('expired', 'Expirée'),
    ]
    
    reservation_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    contact_name = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    pickup_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def confirm(self):
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()
```

### 3.3 Diagramme Entité-Relation

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│     User      │       │   Pharmacy    │       │   Medicine    │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id            │       │ id            │       │ id            │
│ username      │       │ name          │       │ name          │
│ email         │  ┌────│ address       │       │ description   │
│ password      │  │    │ latitude      │       │ dosage        │
│ user_type     │──┘    │ longitude     │       │ category      │
│ phone         │       │ location(GIS) │       │ average_price │
│ pharmacy_id ──┼───────│ opening_hours │       │ wikipedia_url │
└───────────────┘       │ is_active     │       └───────────────┘
        │               └───────────────┘               │
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    Cart       │       │    Stock      │◄──────│ ReservationItem│
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id            │       │ id            │       │ id            │
│ user_id ──────┼───┐   │ pharmacy_id───┼───┐   │ reservation_id│
│ status        │   │   │ medicine_id───┼───┼───│ medicine_id   │
│ created_at    │   │   │ quantity      │   │   │ quantity      │
└───────────────┘   │   │ price         │   │   │ unit_price    │
        │           │   │ is_available  │   │   └───────────────┘
        │           │   └───────────────┘   │           │
        ▼           │           │           │           │
┌───────────────┐   │           │           │           ▼
│  CartItem     │   │           │           │   ┌───────────────┐
├───────────────┤   │           │           │   │  Reservation  │
│ id            │   │           │           │   ├───────────────┤
│ cart_id       │   │           │           │   │ id            │
│ medicine_id   │   │           │           │   │ number (uniq) │
│ pharmacy_id───┼───┼───────────┼───────────┘   │ user_id ──────│
│ stock_id      │   │           │               │ pharmacy_id   │
│ quantity      │   │           │               │ status        │
│ unit_price    │   │           │               │ pickup_date   │
└───────────────┘   │           │               │ expires_at    │
                    │           │               └───────────────┘
                    │           │
                    │           ▼
                    │   ┌───────────────┐
                    │   │PharmacyReview │
                    │   ├───────────────┤
                    │   │ id            │
                    └───│ user_id       │
                        │ pharmacy_id   │
                        │ rating (1-5)  │
                        │ comment       │
                        │ is_approved   │
                        └───────────────┘
```

---

## 4. Frontend React

### 4.1 Structure du Projet

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json      # PWA manifest
│   └── icons/             # Icônes PWA
│
├── src/
│   ├── components/        # Composants réutilisables (30+)
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── SearchSection.js
│   │   ├── SearchAutocomplete.js
│   │   ├── PharmaciesList.js
│   │   ├── Cart.js
│   │   ├── ReservationModal.js
│   │   ├── StockManager.js
│   │   ├── MedicineManager.js
│   │   ├── NotificationSystem.js
│   │   ├── AdminDashboard.js
│   │   └── ...
│   │
│   ├── pages/             # Pages de l'application (13)
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── ProfilePage.js
│   │   ├── DashboardClient.js
│   │   ├── MesReservationsPage.js
│   │   ├── StockManagementPage.js
│   │   ├── AdminDashboardPage.js
│   │   └── ...
│   │
│   ├── services/          # Services API
│   │   ├── api.js         # ~1000 lignes, 40+ fonctions
│   │   └── notificationService.js
│   │
│   ├── contexts/          # Contextes React
│   │   ├── LanguageContext.js
│   │   └── ThemeContext.js
│   │
│   ├── hooks/             # Hooks personnalisés
│   │   └── usePWA.js
│   │
│   ├── i18n/              # Internationalisation
│   │   ├── i18n.js
│   │   └── locales/
│   │       ├── fr.json    # Français
│   │       ├── en.json    # English
│   │       └── es.json    # Español
│   │
│   ├── styles/            # Styles CSS
│   │   ├── App.css
│   │   ├── Header.css
│   │   ├── SearchSection.css
│   │   └── ...
│   │
│   ├── App.js             # Composant racine + routage
│   └── index.js           # Point d'entrée
│
├── package.json
├── Dockerfile             # Multi-stage build
└── nginx.conf             # Configuration Nginx
```

### 4.2 Pages de l'Application

| Page | Route | Description | Accès |
|------|-------|-------------|-------|
| HomePage | `/` | Accueil avec recherche et carte | Public |
| LoginPage | `/login` | Connexion utilisateur | Public |
| RegisterPage | `/register` | Inscription | Public |
| ProfilePage | `/profile` | Profil utilisateur | Authentifié |
| DashboardClient | `/dashboard` | Dashboard client | Customer |
| MesReservationsPage | `/reservations` | Liste des réservations | Authentifié |
| StockManagementPage | `/stock-management` | Gestion des stocks | Pharmacy |
| AdminDashboardPage | `/admin` | Dashboard administrateur | Admin |
| MedicineDetailPage | `/medicine/:id` | Détails médicament | Public |
| FaqPage | `/faq` | Questions fréquentes | Public |
| AboutPage | `/about` | À propos | Public |
| ContactPage | `/contact` | Formulaire de contact | Public |
| LegalPage | `/legal` | Mentions légales | Public |

### 4.3 Composants Principaux

#### Layout
| Composant | Description |
|-----------|-------------|
| `Header.js` | Navigation, authentification, langue, thème |
| `Footer.js` | Liens, copyright, réseaux sociaux |
| `App.js` | Routage, providers (Theme, Language, Notification) |

#### Recherche
| Composant | Description |
|-----------|-------------|
| `SearchSection.js` | Barre de recherche principale |
| `SearchAutocomplete.js` | Suggestions en temps réel |
| `FilterControls.js` | Filtres (prix, distance, disponibilité) |
| `GeolocationButton.js` | Bouton de géolocalisation GPS |

#### Pharmacies & Résultats
| Composant | Description |
|-----------|-------------|
| `PharmaciesList.js` | Liste des pharmacies |
| `ResultsDisplay.js` | Affichage des résultats de recherche |
| `PharmacyCard.js` | Carte individuelle pharmacie |

#### Panier & Réservation
| Composant | Description |
|-----------|-------------|
| `Cart.js` | Panier d'achat complet |
| `ReservationModal.js` | Modal de création de réservation |
| `ReviewModal.js` | Modal pour laisser un avis |

#### Administration Pharmacie
| Composant | Description |
|-----------|-------------|
| `StockManager.js` | CRUD complet des stocks |
| `StockManagerModern.js` | Version moderne avec DataTable |
| `MedicineManager.js` | CRUD des médicaments |

#### Administration Système
| Composant | Description |
|-----------|-------------|
| `AdminDashboard.js` | Dashboard avec statistiques |
| `AnalyticsDashboard.js` | Graphiques Recharts |

#### UI/UX
| Composant | Description |
|-----------|-------------|
| `NotificationSystem.js` | Toasts + ConfirmDialog |
| `PWAPrompt.js` | Prompt d'installation PWA |
| `LazyLoad.js` | Chargement différé |
| `HeroSection.js` | Section héro de l'accueil |

### 4.4 Service API (api.js)

Le fichier `api.js` centralise tous les appels API (~1000 lignes, 40+ fonctions) :

```javascript
// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Fonctions principales
export const searchMedication = async (query, userLocation) => { ... }
export const getNearbyPharmacies = async (lat, lon, radiusMeters) => { ... }
export const getAllPharmacies = async () => { ... }

// Gestion des stocks
export const fetchPharmacyStocks = async (pharmacyId, token) => { ... }
export const addStock = async (pharmacyId, stockData, token) => { ... }
export const updateStock = async (pharmacyId, stockId, updates, token) => { ... }
export const deleteStock = async (pharmacyId, stockId, token) => { ... }

// Gestion des médicaments
export const fetchMedicines = async () => { ... }
export const createMedicine = async (medicineData, token) => { ... }
export const updateMedicine = async (medicineId, medicineData, token) => { ... }
export const deleteMedicine = async (medicineId, token) => { ... }

// Réservations
export const submitReservation = async (reservationData, token) => { ... }
export const getMyReservations = async (token, status) => { ... }
export const cancelReservation = async (reservationId, reason, token) => { ... }

// Authentification
export const login = async (username, password) => { ... }
export const register = async (username, email, password, userType, extraData) => { ... }
export const refreshAccessToken = async (refreshToken) => { ... }

// Administration
export const getAdminStats = async (token) => { ... }
export const getAdminActivity = async (token) => { ... }
```

---

## 5. Base de Données

### 5.1 PostgreSQL + PostGIS

La base de données utilise PostgreSQL 15 avec l'extension PostGIS 3.3 pour les fonctionnalités géospatiales.

#### Configuration Docker
```yaml
db:
  image: postgis/postgis:15-3.3
  environment:
    POSTGRES_DB: findpharma
    POSTGRES_USER: findpharmauser
    POSTGRES_PASSWORD: findpharmapass
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U findpharmauser -d findpharma"]
```

### 5.2 Requêtes Géospatiales

PostGIS permet des requêtes géographiques performantes :

```python
# Recherche de pharmacies dans un rayon
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance

user_location = Point(longitude, latitude, srid=4326)

nearby_pharmacies = Pharmacy.objects.annotate(
    distance=Distance('location', user_location)
).filter(
    distance__lte=radius_meters
).order_by('distance')
```

### 5.3 Peuplement Automatique

Le script `docker-entrypoint.sh` peuple automatiquement la base au démarrage :

```bash
# Vérification et peuplement automatique
medicine_count=$(python manage.py shell -c "from medicines.models import Medicine; print(Medicine.objects.count())")
pharmacy_count=$(python manage.py shell -c "from pharmacies.models import Pharmacy; print(Pharmacy.objects.count())")
stock_count=$(python manage.py shell -c "from stocks.models import Stock; print(Stock.objects.count())")

if [ "$medicine_count" -lt "10" ] || [ "$pharmacy_count" -lt "5" ] || [ "$stock_count" -lt "100" ]; then
    python scripts/populate_cameroon_pharmacies.py
fi
```

---

## 6. API REST

### 6.1 Documentation Interactive

L'API est documentée avec Swagger (drf-spectacular) :

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI interactif |
| `/api/redoc/` | ReDoc documentation |
| `/api/schema/` | Schéma OpenAPI (JSON/YAML) |

### 6.2 Endpoints par Module

#### 🏥 Pharmacies (14 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/pharmacies/` | Liste des pharmacies |
| POST | `/api/pharmacies/` | Créer une pharmacie |
| GET | `/api/pharmacies/{id}/` | Détails pharmacie |
| PUT | `/api/pharmacies/{id}/` | Modifier pharmacie |
| DELETE | `/api/pharmacies/{id}/` | Supprimer pharmacie |
| GET | `/api/search/?q={query}` | Recherche médicaments |
| GET | `/api/nearby/?lat={lat}&lng={lng}&radius={km}` | Pharmacies proches |
| GET | `/api/pharmacy/{id}/` | Détail pharmacie |
| GET | `/api/my-pharmacy/dashboard/` | Dashboard pharmacie |
| GET | `/api/my-pharmacy/profile/` | Profil pharmacie |
| GET | `/api/my-pharmacy/stock-stats/` | Stats stocks |
| GET | `/api/my-pharmacy/stock-history/` | Historique stocks |
| GET | `/api/pharmacies/{id}/reviews/` | Avis pharmacie |
| POST | `/api/pharmacies/{id}/reviews/create/` | Créer avis |

#### 💊 Médicaments (10 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/medicines/` | Liste des médicaments |
| POST | `/api/medicines/` | Créer médicament |
| GET | `/api/medicines/{id}/` | Détails médicament |
| PUT | `/api/medicines/{id}/` | Modifier médicament |
| DELETE | `/api/medicines/{id}/` | Supprimer médicament |
| GET | `/api/medicines/search/?q={query}` | Recherche |
| GET | `/api/medicines/autocomplete/?q={query}` | Autocomplétion |
| GET | `/api/medicines/categories/` | Liste catégories |
| GET | `/api/medicines/by_category/?category={cat}` | Par catégorie |
| GET | `/api/medicines/{id}/wikipedia_info/` | Info Wikipedia |

#### 📦 Stocks (6 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/pharmacies/{id}/stocks/` | Liste stocks |
| POST | `/api/pharmacies/{id}/stocks/` | Ajouter stock |
| GET | `/api/pharmacies/{id}/stocks/{stock_id}/` | Détails stock |
| PUT | `/api/pharmacies/{id}/stocks/{stock_id}/` | Modifier stock |
| DELETE | `/api/pharmacies/{id}/stocks/{stock_id}/` | Supprimer stock |
| POST | `/api/pharmacies/{id}/stocks/{stock_id}/mark_unavailable/` | Marquer indisponible |

#### 👤 Utilisateurs (15 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register/` | Inscription |
| POST | `/api/auth/login/` | Connexion |
| POST | `/api/auth/logout/` | Déconnexion |
| POST | `/api/auth/token/refresh/` | Rafraîchir JWT |
| POST | `/api/auth/send-verification-code/` | Envoyer code email |
| POST | `/api/auth/verify-code/` | Vérifier code |
| POST | `/api/auth/resend-verification-code/` | Renvoyer code |
| GET | `/api/auth/profile/` | Profil utilisateur |
| PUT | `/api/auth/profile/update/` | Modifier profil |
| POST | `/api/auth/password/change/` | Changer mot de passe |
| GET | `/api/auth/admin/users/` | Admin: liste utilisateurs |
| GET | `/api/auth/admin/users/{id}/` | Admin: détail utilisateur |
| POST | `/api/auth/admin/users/create/` | Admin: créer utilisateur |
| PUT | `/api/auth/admin/users/{id}/update/` | Admin: modifier utilisateur |
| DELETE | `/api/auth/admin/users/{id}/delete/` | Admin: supprimer utilisateur |

#### 🛒 Panier (8 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/cart/carts/` | Liste paniers |
| POST | `/api/cart/carts/` | Créer panier |
| GET | `/api/cart/carts/{id}/` | Détails panier |
| DELETE | `/api/cart/carts/{id}/` | Supprimer panier |
| GET | `/api/cart/carts/active/` | Panier actif |
| POST | `/api/cart/carts/add_item/` | Ajouter article |
| PATCH | `/api/cart/items/{id}/` | Modifier quantité |
| DELETE | `/api/cart/items/{id}/` | Supprimer article |

#### 📅 Réservations (6 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reservations/` | Liste réservations |
| POST | `/api/reservations/` | Créer réservation |
| GET | `/api/reservations/{id}/` | Détails réservation |
| POST | `/api/reservations/{id}/cancel/` | Annuler |
| POST | `/api/reservations/{id}/update_status/` | Mettre à jour statut |
| GET | `/api/reservations/pharmacy/` | Réservations pharmacie |

#### 🔧 Core (3 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/stats/` | Statistiques admin |
| GET | `/api/admin/activity/` | Activité récente |
| POST | `/api/contact/` | Formulaire de contact |

### 6.3 Exemples de Requêtes/Réponses

#### Recherche de médicaments
```http
GET /api/search/?q=paracetamol&latitude=3.848&longitude=11.502&radius=5
```

```json
{
  "count": 15,
  "results": [
    {
      "pharmacy": {
        "id": 1,
        "name": "Pharmacie du Centre",
        "address": "Avenue Kennedy, Yaoundé",
        "latitude": 3.8523,
        "longitude": 11.5067,
        "distance": 0.8
      },
      "medicine": {
        "id": 42,
        "name": "Paracétamol 500mg",
        "dosage": "500mg",
        "form": "Comprimé"
      },
      "price": 1500,
      "quantity": 150,
      "is_available": true
    }
  ]
}
```

#### Création de réservation
```http
POST /api/reservations/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "pharmacy_id": 1,
  "items": [
    {"medicine_id": 42, "quantity": 2},
    {"medicine_id": 15, "quantity": 1}
  ],
  "contact_name": "Jean Dupont",
  "contact_phone": "+237 690 123 456",
  "contact_email": "jean@email.com",
  "pickup_date": "2025-12-20",
  "notes": "Préférence matin"
}
```

```json
{
  "id": 123,
  "reservation_number": "RES-20251215-ABC123",
  "status": "pending",
  "total_items": 3,
  "total_price": 5500,
  "pickup_date": "2025-12-20",
  "expires_at": "2025-12-20T23:59:59Z"
}
```

---

## 7. Authentification et Sécurité

### 7.1 Authentification JWT

L'application utilise JSON Web Tokens (JWT) via `djangorestframework-simplejwt` :

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### Flux d'authentification

```
┌─────────────────┐     POST /api/auth/login/     ┌─────────────────┐
│     Client      │ ──────────────────────────────▶│     Server      │
│                 │     {username, password}       │                 │
└─────────────────┘                                └─────────────────┘
         │                                                  │
         │                                                  ▼
         │                                         Vérification
         │                                         credentials
         │                                                  │
         │                                                  ▼
         │                                         Génération JWT
         │                                         (access + refresh)
         │                                                  │
         ◀──────────────────────────────────────────────────┘
         │     {access_token, refresh_token}
         │
         │     Requêtes suivantes:
         │     Authorization: Bearer <access_token>
         ▼
```

### 7.2 Types d'Utilisateurs et Permissions

| Type | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrateur | Accès total, gestion des utilisateurs |
| `pharmacy` | Utilisateur pharmacie | Gestion du stock de SA pharmacie |
| `customer` | Client | Recherche, panier, réservations |

### 7.3 Vérification Email

Un système de vérification par code à 6 chiffres :

```python
class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)  # Code à 6 chiffres
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # Expire après 15 minutes
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)  # Max 5 tentatives
```

### 7.4 Évaluation de Sécurité

**Score actuel : 5.5/10**

#### ✅ Points Positifs
- Utilisation de l'ORM Django (protection contre SQL injection)
- Validation des données avec les Serializers DRF
- JWT pour l'authentification
- Mots de passe hashés (PBKDF2)
- Vérification email avec expiration

#### ⚠️ Points à Améliorer

| Problème | Criticité | Solution |
|----------|-----------|----------|
| `CORS_ALLOW_ALL_ORIGINS = True` | 🔴 Critique | Limiter aux domaines autorisés |
| Pas de rate limiting | 🔴 Critique | Ajouter django-ratelimit |
| Token JWT 24h | 🟠 Élevé | Réduire à 15-30 minutes |
| Headers sécurité manquants | 🟠 Élevé | Ajouter CSP, HSTS, etc. |
| JWT en localStorage | ⚠️ Moyen | Utiliser httpOnly cookies |

### 7.5 Recommandations de Sécurité

```python
# settings.py - Améliorations recommandées

# CORS strict
CORS_ALLOWED_ORIGINS = [
    "https://findpharma.cm",
    "https://www.findpharma.cm",
]

# Headers sécurité
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# JWT plus court
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# Rate limiting (avec django-ratelimit)
@ratelimit(key='ip', rate='5/m', method='POST')
def login_view(request):
    pass
```

---

## 8. Internationalisation

### 8.1 Configuration i18next

```javascript
// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr, en, es },
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  });
```

### 8.2 Langues Supportées

| Code | Langue | Fichier | Couverture |
|------|--------|---------|------------|
| `fr` | Français | `fr.json` | 100% |
| `en` | English | `en.json` | 100% |
| `es` | Español | `es.json` | 100% |

### 8.3 Exemple de Traductions

```json
// fr.json
{
  "search": {
    "placeholder": "Rechercher un médicament...",
    "button": "Rechercher",
    "noResults": "Aucun résultat trouvé"
  },
  "pharmacy": {
    "inStock": "En stock",
    "outOfStock": "Rupture de stock",
    "limitedStock": "Stock limité"
  }
}

// en.json
{
  "search": {
    "placeholder": "Search for a medication...",
    "button": "Search",
    "noResults": "No results found"
  },
  "pharmacy": {
    "inStock": "In stock",
    "outOfStock": "Out of stock",
    "limitedStock": "Limited stock"
  }
}
```

### 8.4 Utilisation dans les Composants

```javascript
import { useTranslation } from 'react-i18next';

function SearchSection() {
  const { t } = useTranslation();
  
  return (
    <input 
      placeholder={t('search.placeholder')}
    />
  );
}
```

---

## 9. Docker et Déploiement

### 9.1 Architecture Docker

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          docker-compose.yml                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │       db         │  │     backend      │  │     frontend     │       │
│  │  postgis:15-3.3  │  │  python:3.11     │  │  nginx:alpine    │       │
│  │                  │  │                  │  │                  │       │
│  │  Port: 5432      │◀─│  Port: 8000      │◀─│  Port: 3000:80   │       │
│  │                  │  │                  │  │                  │       │
│  │  Volume:         │  │  Volumes:        │  │  Volumes:        │       │
│  │  postgres_data   │  │  - ./backend     │  │  - static        │       │
│  │                  │  │  - static_volume │  │                  │       │
│  │                  │  │  - media_volume  │  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
│                                                                          │
│  Network: findpharma_network (bridge)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Fichiers Docker

#### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.3
    container_name: findpharma_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-findpharma}
      POSTGRES_USER: ${POSTGRES_USER:-findpharmauser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-findpharmapass}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U findpharmauser -d findpharma"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: findpharma_backend
    environment:
      - DATABASE_URL=postgis://findpharmauser:findpharmapass@db:5432/findpharma
      - DEBUG=True
      - SECRET_KEY=${SECRET_KEY:-your-secret-key}
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: findpharma_frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

#### backend/Dockerfile
```dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Dépendances système (GDAL pour PostGIS)
RUN apt-get update && apt-get install -y \
    gcc postgresql-client libpq-dev \
    gdal-bin libgdal-dev python3-gdal \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/media

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

#### frontend/Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 9.3 Scripts de Démarrage

Le projet inclut des scripts multi-plateforme :

| Script | Plateforme | Description |
|--------|------------|-------------|
| `start.sh` | Linux/macOS | Script Bash |
| `start.ps1` | Windows PowerShell | Script PowerShell |
| `start.bat` | Windows CMD | Script Batch |

### 9.4 Commandes Utiles

```bash
# Démarrage
docker compose up -d --build

# Logs
docker compose logs -f

# Shell Django
docker compose exec backend python manage.py shell

# Migrations
docker compose exec backend python manage.py migrate

# Créer superuser
docker compose exec backend python manage.py createsuperuser

# Arrêt
docker compose down

# Nettoyage complet
docker compose down -v --rmi all
```

---

## 10. Tests

### 10.1 Tests Backend (Django)

```bash
# Lancer tous les tests
docker compose exec backend python manage.py test

# Tests d'une app spécifique
docker compose exec backend python manage.py test pharmacies

# Avec couverture
docker compose exec backend coverage run --source='.' manage.py test
docker compose exec backend coverage report
```

### 10.2 Tests Frontend (React)

```bash
# Lancer les tests
cd frontend && npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

### 10.3 Tests API (manuels)

```bash
# Santé de l'API
curl http://localhost:8000/api/

# Recherche de pharmacies
curl "http://localhost:8000/api/nearby/?latitude=3.848&longitude=11.502&radius=10"

# Login et récupération du token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 11. Fonctionnalités Métier

### 11.1 User Stories Implémentées

| US | Titre | Description | Statut |
|----|-------|-------------|--------|
| US1 | Recherche de pharmacies | Localisation GPS, carte Leaflet, rayon personnalisable | ✅ |
| US2 | Recherche de médicaments | Recherche par nom, autocomplétion, filtres | ✅ |
| US3 | Gestion des stocks | CRUD complet pour les pharmacies | ✅ |
| US4 | Authentification | Inscription, connexion, vérification email, JWT | ✅ |
| US5 | Panier d'achat | Ajout/suppression, calcul du total | ✅ |
| US6 | Réservation | Création, suivi de statut, annulation | ✅ |
| US7 | Avis et notations | Système 1-5 étoiles, commentaires | ✅ |
| US8 | Dashboard admin | Statistiques, activité récente, graphiques | ✅ |

### 11.2 Flux Utilisateur Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FLUX CLIENT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ Accueil │───▶│  Recherche  │───▶│  Résultats  │───▶│   Ajout     │   │
│  │         │    │ médicament  │    │  + carte    │    │  panier     │   │
│  └─────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                               │          │
│                                                               ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────┐   │
│  │ Récupération│◀───│  Suivi      │◀───│ Confirmation│◀───│  Panier │   │
│  │  pharmacie  │    │  réservation│    │  réservation│    │         │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Géolocalisation

```javascript
// Calcul de distance avec la formule Haversine
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

---

## 12. Statistiques du Projet

### 12.1 Métriques de Code

| Catégorie | Nombre |
|-----------|--------|
| **Fichiers Python** | 1 649 |
| **Fichiers JavaScript** | 272 |
| **Fichiers CSS** | 93 |
| **Fichiers Total** | ~2 100 |
| **Lignes de code (estimation)** | ~50 000+ |

### 12.2 Métriques API

| Catégorie | Nombre |
|-----------|--------|
| **Endpoints API** | **62** |
| **Modèles Django** | **11** |
| **Serializers** | ~15 |
| **Views** | ~30 |

### 12.3 Métriques Frontend

| Catégorie | Nombre |
|-----------|--------|
| **Pages React** | **13** |
| **Composants** | **30+** |
| **Hooks personnalisés** | 2 |
| **Contextes** | 2 |
| **Langues supportées** | 3 |

### 12.4 Données Peuplées

| Entité | Nombre |
|--------|--------|
| Pharmacies (Cameroun) | ~50 |
| Médicaments | ~200 |
| Stocks | ~1 000 |
| Catégories médicaments | 18 |

---

## 13. Roadmap et Évolutions

### 13.1 Version Actuelle (v1.0)

✅ Fonctionnalités de base complètes
✅ Authentification JWT
✅ Géolocalisation
✅ Panier et réservations
✅ Internationalisation (3 langues)
✅ Docker prêt pour la production
✅ Documentation API Swagger

### 13.2 Évolutions Prévues (v1.1)

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| 🔒 Sécurité renforcée | Haute | Rate limiting, CORS strict, headers sécurité |
| 📱 PWA complète | Haute | Mode hors-ligne, notifications push |
| 💳 Paiement mobile | Moyenne | Intégration Mobile Money (MTN, Orange) |
| 📊 Analytics avancés | Moyenne | Tableaux de bord plus détaillés |
| 🔔 Notifications temps réel | Moyenne | WebSockets pour les mises à jour |

### 13.3 Vision Long Terme (v2.0)

- 📱 Application mobile native (React Native)
- 🤖 Chatbot d'assistance
- 🔗 Intégration avec les systèmes de santé nationaux
- 📍 Extension à d'autres pays d'Afrique centrale
- 💊 Vérification des ordonnances numériques

---

## 📞 Contact et Support

| Canal | Information |
|-------|-------------|
| **Email** | support@findpharma.cm |
| **GitHub** | github.com/Max-kleb/FindPharma |
| **Documentation API** | http://localhost:8000/api/docs/ |

---

**© 2025 FindPharma - Tous droits réservés**

*Ce rapport a été généré automatiquement le 15 décembre 2025*
