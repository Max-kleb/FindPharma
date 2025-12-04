# 📏 Organisation du Calcul de Distance

## ✅ État Actuel (Nettoyé)

### 1️⃣ **`/frontend/src/utils/distance.js`** (Source principale)

**Fonction : `calculateDistance(lat1, lon1, lat2, lon2)`**
- **Paramètres** : 4 nombres (latitude1, longitude1, latitude2, longitude2)
- **Retour** : Distance en **kilomètres** (Number)
- **Formule** : Haversine avec rayon = 6371 km
- **Usage** : Calcul côté client entre position utilisateur et pharmacies

**Fonction : `formatDistance(distanceInKm)`**
- **Paramètre** : Distance en kilomètres
- **Retour** : String formatée (ex: "500 m" ou "1.5 km")
- **Logique** :
  - < 1 km → affiche en mètres (ex: "850 m")
  - ≥ 1 km → affiche en km avec 1 décimale (ex: "2.3 km")

**Utilisée par** : `ResultsDisplay.js`

---

### 2️⃣ **`/frontend/src/services/api.js`**

**Fonction : `formatDistance(distanceInMeters)` (privée)**
- **Paramètre** : Distance en **mètres** (depuis le backend)
- **Retour** : String formatée (ex: "500 m" ou "1.5 km")
- **Logique** : Identique à celle de utils/distance.js mais reçoit des mètres
- **Usage interne** : Formater les distances reçues du backend dans :
  - `searchMedication()` - ligne 125
  - `getNearbyPharmacies()` - ligne 165

**Note** : Cette fonction n'est PAS exportée, elle est privée au module api.js

---

## 🔄 Flux de Calcul de Distance

### Scénario 1 : Recherche de médicament avec position utilisateur

```
1. Utilisateur cherche "Paracétamol" avec sa position GPS
2. Frontend → Backend : GET /api/medicines/search/?name=Paracétamol&lat=3.866&lng=11.516&radius=5000
3. Backend calcule les distances en mètres (Haversine en Python)
4. Backend retourne : { pharmacies: [{distance: 1250}, ...] }  ← en mètres
5. api.js reçoit la réponse et appelle formatDistance(1250) → "1.3 km"
6. ResultsDisplay affiche : "🚶 1.3 km"
```

### Scénario 2 : Pharmacies proches sans recherche de médicament

```
1. Utilisateur clique sur "Pharmacies à proximité"
2. Frontend → Backend : GET /api/pharmacies/nearby/?lat=3.866&lng=11.516&radius=5000
3. Backend calcule et retourne distances en mètres
4. api.js formate avec formatDistance(mètres) → "850 m"
5. ResultsDisplay affiche : "🚶 850 m"
```

### Scénario 3 : Calcul côté client (données statiques)

```
1. Données statiques chargées (sans position backend)
2. ResultsDisplay détecte : userLocation existe mais pharmacy.distance est null
3. Appelle utils/distance.calculateDistance(lat1, lon1, lat2, lon2) → 2.45 km
4. Appelle utils/distance.formatDistance(2.45) → "2.5 km"
5. Affiche : "🚶 2.5 km"
```

---

## 🎯 Pourquoi Deux `formatDistance` ?

### `utils/distance.formatDistance(km)`
- ✅ **Entrée** : Kilomètres (résultat de calculateDistance)
- ✅ **Contexte** : Calcul côté client
- ✅ **Usage** : Affichage après calcul JavaScript

### `api.formatDistance(km)` (privée)
- ✅ **Entrée** : Kilomètres (depuis le backend Django)
- ✅ **Contexte** : Parsing des réponses API
- ✅ **Usage** : Formater les distances du backend

**Conclusion** : Les deux sont nécessaires car elles sont dans des modules différents avec des responsabilités séparées !

⚠️ **BUG CORRIGÉ (3 déc 2025)** : Cette fonction croyait recevoir des mètres mais le backend envoie des km, causant des distances 1000x trop petites. Voir `/docs/BUG_DISTANCES_TROP_PETITES.md`

---

## ✅ Vérifications Effectuées

### ❌ Code Supprimé (Dupliqué & Inutilisé)
- `api.js : calculateDistance(point1, point2)` - Jamais utilisé
- `api.js : toRad(degrees)` - Jamais utilisé

### ✅ Code Conservé
- `utils/distance.js : calculateDistance(4 params)` - Utilisé dans ResultsDisplay.js
- `utils/distance.js : formatDistance(km)` - Utilisé dans ResultsDisplay.js
- `api.js : formatDistance(m)` (privée) - Utilisé en interne dans api.js

---

## 📋 Imports Actuels

```javascript
// ResultsDisplay.js
import { calculateDistance, formatDistance } from './utils/distance';
```

**Aucun autre fichier n'importe ces fonctions** ✅

---

## 🧪 Tests de Validation

### Test 1 : Backend retourne 500m
```
Backend: { distance: 500 }
api.formatDistance(500) → "500 m" ✅
```

### Test 2 : Backend retourne 2500m
```
Backend: { distance: 2500 }
api.formatDistance(2500) → "2.5 km" ✅
```

### Test 3 : Calcul client entre deux points
```
User: lat=3.866, lng=11.516
Pharmacy: lat=3.876, lng=11.526
calculateDistance(3.866, 11.516, 3.876, 11.526) → 1.524 km
formatDistance(1.524) → "1.5 km" ✅
```

---

## 📊 Résumé

| Fonction | Fichier | Paramètre | Retour | Usage |
|----------|---------|-----------|--------|-------|
| `calculateDistance` | utils/distance.js | 4 nombres (lat/lng) | Number (km) | Calcul client |
| `formatDistance` | utils/distance.js | Number (km) | String | Affichage client |
| `formatDistance` | api.js (privée) | Number (m) | String | Parser API |

**État** : ✅ **Nettoyé et optimisé**
- Pas de duplication de logique de calcul
- Séparation claire des responsabilités
- Unités cohérentes (backend=mètres, client=km)

**Date** : 3 décembre 2025
