# 🛠️ Guide du Développeur - FindPharma

Ce guide fournit toutes les informations nécessaires pour développer, tester et déployer FindPharma.

---

## 📑 Table des Matières

1. [Configuration de l'Environnement](#1-configuration-de-lenvironnement)
2. [Structure du Code](#2-structure-du-code)
3. [Conventions de Code](#3-conventions-de-code)
4. [Workflow de Développement](#4-workflow-de-développement)
5. [API Reference](#5-api-reference)
6. [Base de Données](#6-base-de-données)
7. [Frontend React](#7-frontend-react)
8. [Tests](#8-tests)
9. [Déploiement](#9-déploiement)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Configuration de l'Environnement

### 1.1 Prérequis

| Outil | Version Minimum | Installation |
|-------|-----------------|--------------|
| Docker | 20.10+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | 2.0+ | Inclus avec Docker Desktop |
| Git | 2.30+ | `apt install git` / `brew install git` |
| Node.js (dev local) | 18+ | [nodejs.org](https://nodejs.org/) |
| Python (dev local) | 3.11+ | [python.org](https://python.org/) |

### 1.2 Installation Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/Max-kleb/FindPharma.git
cd FindPharma

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Démarrer avec Docker
./start.sh  # Linux/macOS
# ou
start.bat   # Windows
```

### 1.3 Développement Local (Sans Docker)

#### Backend
```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer la base de données
# (Assurez-vous d'avoir PostgreSQL + PostGIS installés)
export DATABASE_URL="postgis://user:pass@localhost:5432/findpharma"

# Migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Peupler la base
python scripts/populate_cameroon_pharmacies.py

# Lancer le serveur
python manage.py runserver
```

#### Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'API URL
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env.local

# Lancer le serveur de développement
npm start
```

### 1.4 Variables d'Environnement

```bash
# .env

# ============ DATABASE ============
POSTGRES_DB=findpharma
POSTGRES_USER=findpharmauser
POSTGRES_PASSWORD=votre_mot_de_passe_securise
DATABASE_URL=postgis://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# ============ DJANGO ============
SECRET_KEY=votre_secret_key_tres_long_et_aleatoire
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,findpharma.cm

# ============ JWT ============
JWT_ACCESS_TOKEN_LIFETIME=24  # heures
JWT_REFRESH_TOKEN_LIFETIME=7  # jours

# ============ EMAIL ============
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre_email@gmail.com
EMAIL_HOST_PASSWORD=votre_app_password
EMAIL_USE_TLS=True

# ============ CORS ============
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://findpharma.cm
```

---

## 2. Structure du Code

### 2.1 Arborescence Complète

```
FindPharma/
│
├── 📁 backend/                    # Django REST API
│   ├── 📁 FindPharma/            # Configuration Django
│   │   ├── settings.py           # Paramètres globaux
│   │   ├── urls.py               # URLs racine
│   │   ├── wsgi.py               # WSGI pour production
│   │   └── asgi.py               # ASGI pour async
│   │
│   ├── 📁 core/                  # App centrale
│   │   ├── views.py              # Stats admin, contact
│   │   └── urls.py
│   │
│   ├── 📁 pharmacies/            # Gestion pharmacies
│   │   ├── models.py             # Pharmacy, PharmacyReview
│   │   ├── views.py              # ViewSets
│   │   ├── serializers.py        # Sérialiseurs
│   │   ├── urls.py               # Routes
│   │   └── admin.py              # Admin Django
│   │
│   ├── 📁 medicines/             # Gestion médicaments
│   │   ├── models.py             # Medicine
│   │   ├── views.py              # ViewSets + autocomplete
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── 📁 stocks/                # Gestion stocks
│   │   ├── models.py             # Stock
│   │   ├── views.py              # Nested ViewSet
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── 📁 users/                 # Authentification
│   │   ├── models.py             # User, EmailVerification
│   │   ├── views.py              # Auth views
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── 📁 cart/                  # Panier + Réservations
│   │   ├── models.py             # Cart, CartItem, Reservation
│   │   ├── views.py              # Cart + Reservation ViewSets
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── 📁 scripts/               # Scripts utilitaires
│   │   ├── populate_cameroon_pharmacies.py
│   │   └── export_data.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-entrypoint.sh
│
├── 📁 frontend/                   # React SPA
│   ├── 📁 public/
│   │   ├── index.html
│   │   └── manifest.json
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/        # Composants réutilisables
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── SearchSection.js
│   │   │   ├── Cart.js
│   │   │   ├── NotificationSystem.js
│   │   │   └── ...
│   │   │
│   │   ├── 📁 pages/             # Pages/Routes
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   └── ...
│   │   │
│   │   ├── 📁 services/          # Appels API
│   │   │   └── api.js
│   │   │
│   │   ├── 📁 contexts/          # State global
│   │   │   ├── LanguageContext.js
│   │   │   └── ThemeContext.js
│   │   │
│   │   ├── 📁 hooks/             # Hooks personnalisés
│   │   │   └── usePWA.js
│   │   │
│   │   ├── 📁 i18n/              # Traductions
│   │   │   ├── i18n.js
│   │   │   └── locales/
│   │   │
│   │   ├── 📁 styles/            # CSS
│   │   │
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── 📁 docs/                       # Documentation
│   ├── API_TESTING_GUIDE.md
│   └── ...
│
├── docker-compose.yml             # Orchestration Docker
├── docker-compose.dev.yml         # Config développement
├── .env.example                   # Template variables
├── start.sh                       # Script Linux/macOS
├── start.ps1                      # Script Windows PowerShell
├── start.bat                      # Script Windows CMD
├── README.md                      # Documentation principale
└── RAPPORT_TECHNIQUE.md           # Rapport technique complet
```

---

## 3. Conventions de Code

### 3.1 Python (Backend)

```python
# ✅ Bon exemple
class PharmacyViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des pharmacies.
    
    Endpoints:
        - GET /api/pharmacies/ - Liste des pharmacies
        - POST /api/pharmacies/ - Créer une pharmacie
        - GET /api/pharmacies/{id}/ - Détails
    """
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Retourne les pharmacies actives."""
        return Pharmacy.objects.filter(is_active=True)
    
    @action(detail=True, methods=['get'])
    def stocks(self, request, pk=None):
        """Retourne les stocks d'une pharmacie."""
        pharmacy = self.get_object()
        stocks = Stock.objects.filter(pharmacy=pharmacy)
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)
```

**Règles :**
- Docstrings pour toutes les classes et méthodes publiques
- PEP 8 pour le formatage
- Type hints recommandés
- Noms explicites en anglais

### 3.2 JavaScript/React (Frontend)

```javascript
// ✅ Bon exemple
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { searchMedication } from '../services/api';

/**
 * Composant de recherche de médicaments.
 * 
 * @param {Object} props
 * @param {Function} props.onResults - Callback avec les résultats
 * @param {Object} props.userLocation - Position de l'utilisateur
 */
const SearchSection = ({ onResults, userLocation }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchMedication(query, userLocation);
      onResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, userLocation, onResults]);
  
  return (
    <div className="search-section">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search.placeholder')}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? t('common.loading') : t('search.button')}
      </button>
    </div>
  );
};

export default SearchSection;
```

**Règles :**
- Composants fonctionnels avec hooks
- PropTypes ou JSDoc pour la documentation
- Destructuring des props
- useCallback/useMemo pour l'optimisation
- Noms en PascalCase pour les composants

### 3.3 CSS

```css
/* ✅ Bon exemple - BEM naming */
.search-section {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.search-section__input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.search-section__input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.search-section__button {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.search-section__button--loading {
  opacity: 0.7;
  cursor: wait;
}
```

**Règles :**
- Méthodologie BEM (Block__Element--Modifier)
- Variables CSS pour les couleurs et espacements
- Mobile-first avec media queries

---

## 4. Workflow de Développement

### 4.1 Branches Git

```
main                    # Production stable
├── develop             # Développement principal
│   ├── feature/xxx     # Nouvelles fonctionnalités
│   ├── bugfix/xxx      # Corrections de bugs
│   └── hotfix/xxx      # Corrections urgentes
```

### 4.2 Workflow de Feature

```bash
# 1. Créer une branche
git checkout develop
git pull origin develop
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et committer
git add .
git commit -m "feat: ajoute la fonctionnalité X"

# 3. Pousser et créer une PR
git push origin feature/nouvelle-fonctionnalite
# Créer une Pull Request sur GitHub

# 4. Après merge, nettoyer
git checkout develop
git pull origin develop
git branch -d feature/nouvelle-fonctionnalite
```

### 4.3 Convention de Commits

```
type(scope): description

Types:
- feat: Nouvelle fonctionnalité
- fix: Correction de bug
- docs: Documentation
- style: Formatage (pas de changement de code)
- refactor: Refactoring
- test: Ajout/modification de tests
- chore: Maintenance (deps, config)

Exemples:
- feat(auth): ajoute la vérification email
- fix(cart): corrige le calcul du total
- docs(api): met à jour la documentation Swagger
- refactor(pharmacy): simplifie le queryset
```

---

## 5. API Reference

### 5.1 Authentification

```bash
# Login
POST /api/auth/login/
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}

# Réponse
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@email.com",
    "user_type": "customer"
  }
}
```

### 5.2 Utilisation du Token

```bash
# Toutes les requêtes authentifiées
GET /api/auth/profile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 5.3 Refresh Token

```bash
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

# Réponse
{
  "access": "nouveau_access_token..."
}
```

### 5.4 Exemples de Requêtes Courantes

```bash
# Recherche de médicaments
GET /api/search/?q=paracetamol&latitude=3.848&longitude=11.502&radius=5

# Pharmacies proches
GET /api/nearby/?latitude=3.848&longitude=11.502&radius=10

# Liste des médicaments avec pagination
GET /api/medicines/?page=1&page_size=20

# Autocomplétion
GET /api/medicines/autocomplete/?q=para

# Créer une réservation
POST /api/reservations/
Authorization: Bearer <token>
Content-Type: application/json

{
  "pharmacy_id": 1,
  "items": [
    {"medicine_id": 42, "quantity": 2}
  ],
  "contact_name": "Jean Dupont",
  "contact_phone": "+237 690 123 456",
  "contact_email": "jean@email.com",
  "pickup_date": "2025-12-20"
}
```

---

## 6. Base de Données

### 6.1 Migrations

```bash
# Créer une migration après modification de models.py
docker compose exec backend python manage.py makemigrations

# Appliquer les migrations
docker compose exec backend python manage.py migrate

# Voir les migrations en attente
docker compose exec backend python manage.py showmigrations
```

### 6.2 Accès Direct à PostgreSQL

```bash
# Shell PostgreSQL
docker compose exec db psql -U findpharmauser -d findpharma

# Quelques commandes SQL utiles
\dt                    # Liste des tables
\d pharmacies_pharmacy # Structure d'une table
SELECT COUNT(*) FROM pharmacies_pharmacy;
```

### 6.3 Backup et Restore

```bash
# Backup
docker compose exec db pg_dump -U findpharmauser findpharma > backup.sql

# Restore
cat backup.sql | docker compose exec -T db psql -U findpharmauser -d findpharma
```

---

## 7. Frontend React

### 7.1 Ajouter un Nouveau Composant

```bash
# 1. Créer le fichier
touch frontend/src/components/MonComposant.js
touch frontend/src/components/MonComposant.css

# 2. Structure de base
```

```javascript
// MonComposant.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './MonComposant.css';

const MonComposant = ({ prop1, prop2 }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mon-composant">
      {/* Contenu */}
    </div>
  );
};

export default MonComposant;
```

### 7.2 Ajouter une Nouvelle Page

```javascript
// 1. Créer la page dans src/pages/MaNouvellePage.js

// 2. Ajouter la route dans App.js
import MaNouvellePage from './pages/MaNouvellePage';

// Dans le Router :
<Route path="/ma-nouvelle-page" element={<MaNouvellePage />} />
```

### 7.3 Ajouter une Traduction

```json
// src/i18n/locales/fr.json
{
  "maNouvellePage": {
    "title": "Ma Nouvelle Page",
    "description": "Description de la page"
  }
}

// src/i18n/locales/en.json
{
  "maNouvellePage": {
    "title": "My New Page",
    "description": "Page description"
  }
}
```

### 7.4 Appeler l'API

```javascript
// 1. Ajouter la fonction dans api.js
export const maNouvelleFonction = async (param, token) => {
  const response = await fetch(`${API_BASE_URL}/endpoint/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ param })
  });
  
  if (!response.ok) {
    throw new Error('Erreur API');
  }
  
  return response.json();
};

// 2. Utiliser dans un composant
import { maNouvelleFonction } from '../services/api';

const handleAction = async () => {
  try {
    const result = await maNouvelleFonction(data, token);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
```

---

## 8. Tests

### 8.1 Tests Backend

```python
# pharmacies/tests.py
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Pharmacy

class PharmacyAPITest(APITestCase):
    def setUp(self):
        self.pharmacy = Pharmacy.objects.create(
            name="Test Pharmacy",
            address="123 Test St",
            latitude=3.848,
            longitude=11.502
        )
    
    def test_list_pharmacies(self):
        response = self.client.get('/api/pharmacies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_pharmacy_detail(self):
        response = self.client.get(f'/api/pharmacies/{self.pharmacy.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Test Pharmacy")
```

```bash
# Lancer les tests
docker compose exec backend python manage.py test

# Avec couverture
docker compose exec backend coverage run --source='.' manage.py test
docker compose exec backend coverage report -m
```

### 8.2 Tests Frontend

```javascript
// src/components/__tests__/SearchSection.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import SearchSection from '../SearchSection';

describe('SearchSection', () => {
  test('renders search input', () => {
    render(<SearchSection onResults={() => {}} />);
    const input = screen.getByPlaceholderText(/rechercher/i);
    expect(input).toBeInTheDocument();
  });
  
  test('calls onResults when searching', async () => {
    const mockOnResults = jest.fn();
    render(<SearchSection onResults={mockOnResults} />);
    
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'paracetamol' } });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Attendre le résultat async
  });
});
```

```bash
# Lancer les tests
cd frontend && npm test

# Mode watch
npm test -- --watch

# Avec couverture
npm test -- --coverage
```

---

## 9. Déploiement

### 9.1 Build de Production

```bash
# Backend (aucun build nécessaire, géré par Docker)

# Frontend
cd frontend
npm run build
# Le dossier build/ contient les fichiers statiques
```

### 9.2 Déploiement avec Docker

```bash
# 1. Build et push des images
docker compose -f docker-compose.prod.yml build
docker tag findpharma-backend:latest registry.example.com/findpharma-backend:v1.0
docker push registry.example.com/findpharma-backend:v1.0

# 2. Sur le serveur de production
docker compose -f docker-compose.prod.yml up -d
```

### 9.3 Checklist de Production

- [ ] `DEBUG=False` dans settings.py
- [ ] `SECRET_KEY` sécurisée (générée aléatoirement)
- [ ] `ALLOWED_HOSTS` configuré correctement
- [ ] `CORS_ALLOWED_ORIGINS` limité aux domaines autorisés
- [ ] HTTPS configuré (certificat SSL)
- [ ] Base de données PostgreSQL en production
- [ ] Backups automatiques configurés
- [ ] Monitoring et alertes en place
- [ ] Rate limiting activé

---

## 10. Troubleshooting

### 10.1 Problèmes Courants

#### Le backend ne démarre pas

```bash
# Vérifier les logs
docker compose logs backend

# Erreur de migration ?
docker compose exec backend python manage.py migrate

# Erreur de dépendance ?
docker compose exec backend pip install -r requirements.txt
```

#### Le frontend ne se connecte pas à l'API

```bash
# Vérifier que l'API est accessible
curl http://localhost:8000/api/

# Vérifier la variable d'environnement
cat frontend/.env.local
# REACT_APP_API_URL=http://localhost:8000/api

# Problème CORS ?
# Vérifier CORS_ALLOWED_ORIGINS dans settings.py
```

#### Erreur PostGIS

```bash
# Vérifier que PostGIS est installé
docker compose exec db psql -U findpharmauser -d findpharma -c "SELECT PostGIS_Version();"

# Si erreur, recréer le conteneur
docker compose down -v
docker compose up -d
```

#### Problème de permissions

```bash
# Erreur "Permission denied" sur docker-entrypoint.sh
chmod +x backend/docker-entrypoint.sh

# Erreur "Permission denied" sur les volumes
sudo chown -R $(whoami):$(whoami) backend/ frontend/
```

### 10.2 Reset Complet

```bash
# ⚠️ ATTENTION : Supprime toutes les données !

# Arrêter et supprimer tout
docker compose down -v --rmi all

# Nettoyer Docker
docker system prune -af

# Redémarrer proprement
./start.sh
```

### 10.3 Logs Utiles

```bash
# Tous les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Logs avec timestamp
docker compose logs -f -t backend
```

---

## 📞 Aide

En cas de problème non résolu :

1. Consulter les [issues GitHub](https://github.com/Max-kleb/FindPharma/issues)
2. Créer une nouvelle issue avec :
   - Description du problème
   - Logs pertinents
   - Étapes pour reproduire
   - Environnement (OS, versions Docker)

---

**Happy Coding! 🚀**
