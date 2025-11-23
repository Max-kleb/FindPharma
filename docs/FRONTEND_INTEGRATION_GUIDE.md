# 🚀 Guide d'Intégration Frontend-Backend FindPharma

**Date** : 23 novembre 2025  
**Objectif** : Connecter le frontend React au backend Django REST

---

## 📋 Checklist Rapide

- [ ] Backend Django en cours d'exécution
- [ ] CORS configuré
- [ ] Frontend installé et testé
- [ ] Variables d'environnement configurées
- [ ] Première connexion API testée

---

## Étape 1 : Configuration CORS Backend (15 min)

### 1.1 Installer django-cors-headers

```bash
cd /home/mitou/FindPharma/FindPharma
source /home/mitou/FindPharma/venv_system/bin/activate
pip install django-cors-headers
pip freeze > requirements.txt
```

###1.2 Modifier `FindPharma/settings.py`

Ajouter `corsheaders` aux `INSTALLED_APPS` :
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',  # ← AJOUTER ICI
    'drf_spectacular',
    'leaflet',
    
    # Local apps
    'pharmacies',
    'medicines',
    'stocks',
    'users',
    'core',
]
```

Ajouter le middleware CORS (IMPORTANT : avant CommonMiddleware) :
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ← AJOUTER ICI (AVANT CommonMiddleware)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

Ajouter la configuration CORS à la fin du fichier :
```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### 1.3 Redémarrer le serveur Django

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis relancer
python manage.py runserver
```

---

## Étape 2 : Configuration Frontend (10 min)

### 2.1 Créer le fichier `.env`

```bash
cd /home/mitou/FindPharma/Front-end
cat > .env << 'EOF'
# API Backend
REACT_APP_API_URL=http://127.0.0.1:8000

# Coordonnées par défaut (Yaoundé)
REACT_APP_DEFAULT_LAT=3.8480
REACT_APP_DEFAULT_LNG=11.5021

# Rayon de recherche par défaut (en mètres)
REACT_APP_DEFAULT_RADIUS=5000
EOF
```

### 2.2 Installer les dépendances

```bash
npm install
```

### 2.3 Démarrer le frontend

```bash
npm start
```

Le frontend s'ouvrira sur : http://localhost:3000

---

## Étape 3 : Créer le Service API (30 min)

### 3.1 Créer `/Front-end/src/services/api.js`

```javascript
// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Recherche de médicaments
 * @param {string} query - Nom du médicament
 * @returns {Promise<Array>} Liste des pharmacies avec le médicament
 */
export const searchMedication = async (query) => {
  try {
    const response = await fetch(`${API_URL}/api/search/?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformer les données pour le frontend
    return transformSearchResults(data);
  } catch (error) {
    console.error('Erreur recherche médicament:', error);
    throw error;
  }
};

/**
 * Récupérer les pharmacies à proximité
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Rayon en mètres
 * @returns {Promise<Array>} Liste des pharmacies proches
 */
export const getNearbyPharmacies = async (lat, lon, radius = 5000) => {
  try {
    const response = await fetch(
      `${API_URL}/api/nearby/?lat=${lat}&lon=${lon}&radius=${radius}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformer les données pour le frontend
    return transformNearbyResults(data);
  } catch (error) {
    console.error('Erreur pharmacies proches:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les pharmacies
 * @returns {Promise<Array>} Liste de toutes les pharmacies
 */
export const getAllPharmacies = async () => {
  try {
    const response = await fetch(`${API_URL}/api/pharmacies/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Erreur liste pharmacies:', error);
    throw error;
  }
};

// === FONCTIONS DE TRANSFORMATION ===

/**
 * Transformer les résultats de recherche de médicaments
 */
function transformSearchResults(apiData) {
  if (!apiData.results || apiData.results.length === 0) {
    return [];
  }

  const pharmacies = [];
  
  // Pour chaque médicament trouvé
  apiData.results.forEach(medicine => {
    // Pour chaque pharmacie qui a ce médicament
    medicine.pharmacies?.forEach(pharmacy => {
      pharmacies.push({
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        stock: pharmacy.stock?.is_available ? "En Stock" : "Épuisé",
        price: pharmacy.stock?.price ? `${parseFloat(pharmacy.stock.price).toFixed(2)} XAF` : null,
        phone: pharmacy.phone,
        distance: pharmacy.distance ? formatDistance(pharmacy.distance) : null,
        lat: pharmacy.latitude,
        lng: pharmacy.longitude,
        medicine: {
          name: medicine.name,
          dosage: medicine.dosage,
          form: medicine.form
        }
      });
    });
  });

  return pharmacies;
}

/**
 * Transformer les résultats de pharmacies à proximité
 */
function transformNearbyResults(apiData) {
  if (!apiData.pharmacies || apiData.pharmacies.length === 0) {
    return [];
  }

  return apiData.pharmacies.map(pharmacy => ({
    id: pharmacy.id,
    name: pharmacy.name,
    address: pharmacy.address,
    stock: "Disponible", // Pour l'affichage général
    price: null,
    phone: pharmacy.phone,
    distance: formatDistance(pharmacy.distance),
    lat: pharmacy.latitude,
    lng: pharmacy.longitude
  }));
}

/**
 * Formater la distance (mètres → km)
 * @param {number} distanceInMeters - Distance en mètres
 * @returns {string} Distance formatée
 */
function formatDistance(distanceInMeters) {
  if (!distanceInMeters) return null;
  
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  }
  
  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

/**
 * Calculer la distance entre deux points (Haversine)
 * @param {object} point1 - {lat, lng}
 * @param {object} point2 - {lat, lng}
 * @returns {number} Distance en mètres
 */
export function calculateDistance(point1, point2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en mètres
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
```

---

## Étape 4 : Modifier SearchSection.js (20 min)

Remplacer la logique de recherche simulée par l'appel API :

```javascript
// src/SearchSection.js
import React, { useState } from 'react';
import GeolocationButton from './GeolocationButton';
import { searchMedication, getNearbyPharmacies } from './services/api';

function SearchSection({ setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Veuillez entrer un nom de médicament');
      return;
    }

    setLoading(true);
    setError(null);
    setLastSearch(inputValue);

    try {
      const results = await searchMedication(inputValue);
      
      if (results.length === 0) {
        setError(`Aucune pharmacie ne propose "${inputValue}" actuellement`);
        setPharmacies([]);
      } else {
        setPharmacies(results);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors de la recherche. Vérifiez que le serveur est lancé.');
      console.error(err);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = async (position) => {
    const { latitude, longitude } = position.coords;
    
    setUserLocation({ lat: latitude, lng: longitude });
    setLoading(true);
    setError(null);

    try {
      const results = await getNearbyPharmacies(latitude, longitude);
      setPharmacies(results);
      setLastSearch(''); // Reset search
    } catch (err) {
      setError('Erreur lors de la récupération des pharmacies proches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="search-section">
      <h2>Trouvez votre médicament</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Ex: Paracétamol, Aspirine..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          🔍 Rechercher
        </button>
      </form>

      <GeolocationButton 
        onLocationFound={handleGeolocation}
        onError={(err) => setError(err.message)}
      />
    </section>
  );
}

export default SearchSection;
```

---

## Étape 5 : Tester l'Intégration (15 min)

### 5.1 Vérifier que les deux serveurs sont lancés

**Terminal 1 - Backend** :
```bash
cd /home/mitou/FindPharma/FindPharma
source /home/mitou/FindPharma/venv_system/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend** :
```bash
cd /home/mitou/FindPharma/Front-end
npm start
```

### 5.2 Tests à effectuer

1. **Test de connexion** :
   - Ouvrir http://localhost:3000
   - Ouvrir la console du navigateur (F12)
   - Vérifier qu'il n'y a pas d'erreurs CORS

2. **Test de recherche** :
   - Chercher "Paracétamol"
   - Vérifier que des résultats s'affichent
   - Vérifier la carte et les marqueurs

3. **Test de géolocalisation** :
   - Cliquer sur le bouton de géolocalisation
   - Autoriser l'accès
   - Vérifier que les pharmacies proches s'affichent

### 5.3 Debugger les erreurs

**Si erreur CORS** :
```bash
# Vérifier que corsheaders est installé
pip list | grep cors

# Redémarrer Django
python manage.py runserver
```

**Si "Failed to fetch"** :
```bash
# Vérifier que Django tourne
curl http://127.0.0.1:8000/api/pharmacies/

# Vérifier les variables d'environnement
cat /home/mitou/FindPharma/Front-end/.env
```

**Si données vides** :
```bash
# Vérifier la base de données
python manage.py shell
>>> from pharmacies.models import Pharmacy
>>> Pharmacy.objects.count()
>>> from medicines.models import Medicine
>>> Medicine.objects.count()
```

---

## Étape 6 : Commit et Push (10 min)

```bash
cd /home/mitou/FindPharma

# Ajouter CORS
cd FindPharma
git add FindPharma/settings.py requirements.txt
git commit -m "feat: Configure CORS for frontend integration"

# Ajouter les guides
cd ..
git add FRONTEND_ANALYSIS.md FRONTEND_INTEGRATION_GUIDE.md
git commit -m "docs: Add frontend integration guides"

# Push
git push origin main
```

---

## 🎯 Résultat Attendu

Après avoir suivi ce guide :

✅ **Backend** :
- CORS configuré
- APIs accessibles depuis React
- Serveur sur port 8000

✅ **Frontend** :
- Connecté à l'API Django
- Recherche de médicaments fonctionnelle
- Géolocalisation opérationnelle
- Carte interactive avec données réelles

✅ **Intégration** :
- User Story 1 complète
- User Story 2 complète
- Données réelles affichées

---

## 📚 Prochaines Étapes

1. **User Story 3 Frontend** :
   - Page de connexion
   - Dashboard pharmacie
   - Gestion des stocks

2. **Améliorations** :
   - Cache des résultats
   - Pagination
   - Filtres avancés
   - Mode hors-ligne

3. **Déploiement** :
   - Build de production
   - Hébergement frontend
   - Configuration domaine

---

## 🆘 Support

**Si problème** :
1. Vérifier que les deux serveurs tournent
2. Vérifier les logs de la console (F12)
3. Tester les APIs directement avec curl
4. Consulter FRONTEND_ANALYSIS.md

**Contacts** :
- Backend : Max-kleb
- Frontend : Équipe Frontend
- Documentation : Ce guide

---

**Créé par** : Max-kleb  
**Date** : 23 novembre 2025  
**Version** : 1.0.0
