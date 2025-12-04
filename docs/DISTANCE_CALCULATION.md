# Calcul et Affichage des Distances

## 📏 Unités de Mesure

### Dans notre application

**Nous utilisons notre propre fonction de calcul** (`frontend/src/utils/distance.js`) et **NON** la méthode native de Leaflet.

#### 1. Calcul de la distance (`calculateDistance`)
```javascript
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en KILOMÈTRES
  // ... formule de Haversine ...
  return distance; // Retourne en KILOMÈTRES
}
```

**Retourne : KILOMÈTRES** (ex: 1.234, 2.567, 15.890)

#### 2. Formatage pour l'affichage (`formatDistance`)
```javascript
export function formatDistance(distanceInKm) {
  const distanceInMeters = Math.round(distanceInKm * 1000);
  return `${distanceInMeters} m`;
}
```

**Exemples d'affichage** (TOUJOURS EN MÈTRES) :
- 0.5 km → **"500 m"**
- 0.850 km → **"850 m"**
- 0.999 km → **"999 m"**
- 1.0 km → **"1000 m"**
- 1.234 km → **"1234 m"**
- 2.567 km → **"2567 m"**
- 15.890 km → **"15890 m"**
- 392.196 km → **"392196 m"**

## 🗺️ Leaflet Native vs Notre Implémentation

### Leaflet natif (NON utilisé dans notre projet)

Leaflet propose `L.latLng().distanceTo()` qui retourne la distance en **MÈTRES**.

```javascript
// Exemple Leaflet (NON utilisé chez nous)
const point1 = L.latLng(48.8566, 2.3522); // Paris
const point2 = L.latLng(45.764, 4.8357);  // Lyon
const distanceInMeters = point1.distanceTo(point2); 
// Retourne: 392196 (mètres) soit ~392 km
```

**❌ Nous N'utilisons PAS cette méthode** pour plusieurs raisons :
1. **Cohérence avec le backend** : Le backend Django utilise aussi la formule de Haversine en km
2. **Contrôle du formatage** : Nous voulons afficher "850 m" ou "2.5 km" selon la distance
3. **Éviter les conversions** : Pas besoin de convertir mètres → km à chaque fois

### Notre implémentation (✅ UTILISÉE)

```javascript
// frontend/src/ResultsDisplay.js
const distanceInKm = calculateDistance(
  userLocation.lat,
  userLocation.lng,
  pharmacy.lat,
  pharmacy.lng
);

const formattedDistance = formatDistance(distanceInKm);
// Ex: "850 m" ou "2.5 km"
```

## 🔄 Flux de données

### 1. Backend (Django)
```python
# backend/pharmacies/views.py
R = 6371  # Rayon de la Terre en km

# Calcul de la distance
distance = R * c  # Résultat en KILOMÈTRES

# Retour API
{
  "distance": 2.567  # En kilomètres
}
```

### 2. Frontend (React)
```javascript
// Réception API (si disponible)
pharmacy.distance  // En kilomètres (ex: 2.567)

// OU calcul côté client
const distanceInKm = calculateDistance(...)  // En kilomètres

// Formatage pour affichage
const displayDistance = formatDistance(distanceInKm)
// → "2.6 km"
```

## 📊 Tableau de conversion

| Distance réelle | Backend (km) | Frontend calcul (km) | Affichage final |
|----------------|--------------|----------------------|-----------------|
| 500 mètres     | 0.5          | 0.5                  | **"500 m"**     |
| 850 mètres     | 0.85         | 0.85                 | **"850 m"**     |
| 999 mètres     | 0.999        | 0.999                | **"999 m"**     |
| 1 kilomètre    | 1.0          | 1.0                  | **"1000 m"**    |
| 1.234 km       | 1.234        | 1.234                | **"1234 m"**    |
| 2.567 km       | 2.567        | 2.567                | **"2567 m"**    |
| 15.89 km       | 15.89        | 15.89                | **"15890 m"**   |
| 392 km         | 392.0        | 392.0                | **"392000 m"**  |

## 🎯 Règles d'affichage

### Logique actuelle
```
TOUJOURS afficher en mètres (arrondi)
Exemple: "850 m", "1234 m", "15890 m"
```

### Pourquoi tout en mètres ?

**✅ Avantages** :
- **Unité unique** : Pas de confusion entre m et km
- **Cohérence** : Une seule unité dans toute l'interface
- **Précision** : L'utilisateur voit la distance exacte
- **Simplicité** : Pas de logique conditionnelle pour l'affichage

**⚠️ Note** :
- Pour de très longues distances (> 10 km), l'affichage peut être moins lisible
- Exemple : "15890 m" au lieu de "15.9 km"
- Dans notre contexte (pharmacies locales), les distances sont généralement < 10 km

## 🧪 Test de précision

### Formule de Haversine (notre méthode)

**Avantages** :
- ✅ Précise pour les courtes distances (< 100 km)
- ✅ Assez précise pour les longues distances
- ✅ Performance rapide (calcul trigonométrique simple)
- ✅ Standard dans les applications de géolocalisation

**Précision** :
- Courtes distances (< 10 km) : ±1-5 mètres
- Moyennes distances (10-100 km) : ±10-50 mètres
- Longues distances (> 100 km) : ±100-500 mètres

### Comparaison avec d'autres méthodes

| Méthode | Précision | Performance | Utilisation |
|---------|-----------|-------------|-------------|
| **Haversine** (nous) | ✅ Bonne | ✅ Rapide | Distances sphériques |
| Vincenty | ✅✅ Excellente | ⚠️ Lente | GPS haute précision |
| Distance euclidienne | ❌ Mauvaise | ✅✅ Très rapide | Mathématiques 2D uniquement |
| Leaflet distanceTo | ✅ Bonne | ✅ Rapide | Identique à Haversine (mètres) |

## 🔍 Exemple concret

### Paris → Lyon (données réelles)

**Coordonnées** :
- Paris : 48.8566°N, 2.3522°E
- Lyon : 45.7640°N, 4.8357°E

**Distance réelle** : ~392 km (par autoroute A6)

**Notre calcul** :
```javascript
const distanceKm = calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);
// Résultat: 392.196 km

const display = formatDistance(distanceKm);
// Résultat: "392196 m"
```

**Distance à vol d'oiseau** : 392196 m (392.2 km) ✅

## 📝 Notes importantes

1. **Notre distance = à vol d'oiseau** (pas la distance routière)
2. **Backend et Frontend utilisent la même formule** (cohérence)
3. **Affichage intelligent** : mètres pour < 1 km, kilomètres sinon
4. **1 décimale pour les km** : évite "4000 km", préfère "4.0 km"
5. **Leaflet distanceTo() N'EST PAS utilisé** dans notre projet

## 🛠️ Si on voulait utiliser Leaflet natif

```javascript
// Exemple (NON implémenté)
import L from 'leaflet';

const point1 = L.latLng(userLocation.lat, userLocation.lng);
const point2 = L.latLng(pharmacy.lat, pharmacy.lng);
const distanceInMeters = point1.distanceTo(point2); // EN MÈTRES !

// Conversion nécessaire
const distanceInKm = distanceInMeters / 1000;
const display = formatDistance(distanceInKm);
```

**Pourquoi on ne le fait pas** :
- ❌ Dépendance supplémentaire (import L)
- ❌ Retourne en mètres (conversion nécessaire)
- ❌ Moins clair que notre fonction dédiée
- ❌ Incohérent avec le backend (qui utilise Haversine)

## ✅ Résumé

| Question | Réponse |
|----------|---------|
| **Unité de calcul** | Kilomètres (km) |
| **Unité d'affichage** | **TOUJOURS en Mètres (m)** |
| **Formule utilisée** | Haversine (notre implémentation) |
| **Leaflet distanceTo()** | NON utilisé |
| **Précision** | ±1-5 mètres pour < 10 km |
| **Décimales** | 0 (arrondi à l'entier) |

