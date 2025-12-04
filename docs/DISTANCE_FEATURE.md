# Affichage des Distances

## Vue d'ensemble
Chaque pharmacie affiche maintenant sa distance par rapport à la position de l'utilisateur, calculée automatiquement en temps réel.

## Fonctionnement

### 1. Calcul de Distance (Formule de Haversine)
Le fichier `frontend/src/utils/distance.js` contient :

#### `calculateDistance(lat1, lon1, lat2, lon2)`
Calcule la distance entre deux points GPS en utilisant la formule de Haversine :
- Prend en compte la courbure de la Terre (rayon = 6371 km)
- Retourne la distance en kilomètres
- Précision : ±0.5% pour les distances courtes (<500 km)

**Exemple** :
```javascript
const distance = calculateDistance(
  48.8566, 2.3522,  // Paris (utilisateur)
  45.764, 4.8357    // Lyon (pharmacie)
);
// Retourne: ~392.2 km
```

#### `formatDistance(distanceInKm)`
Formate la distance pour un affichage lisible :
- **< 1 km** : affiche en mètres (ex: "850 m")
- **1-10 km** : affiche avec 1 décimale (ex: "2.5 km")
- **> 10 km** : affiche sans décimale (ex: "15 km")

**Exemples** :
```javascript
formatDistance(0.567)  // "567 m"
formatDistance(2.345)  // "2.3 km"
formatDistance(15.789) // "16 km"
```

### 2. Intégration dans ResultsDisplay.js

```javascript
// Calcul automatique des distances avec useMemo
const resultsWithDistance = useMemo(() => {
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    return results;
  }
  
  return results.map(pharmacy => {
    // Garde la distance existante (données statiques)
    if (pharmacy.distance) {
      return pharmacy;
    }
    
    // Calcule la distance pour les données API
    if (pharmacy.lat && pharmacy.lng) {
      const distanceInKm = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        pharmacy.lat,
        pharmacy.lng
      );
      
      return {
        ...pharmacy,
        distance: formatDistance(distanceInKm),
        distanceValue: distanceInKm // Pour tri futur
      };
    }
    
    return pharmacy;
  });
}, [results, userLocation]);
```

**Optimisation avec useMemo** :
- Recalcule uniquement si `results` ou `userLocation` change
- Évite les calculs inutiles à chaque re-render
- Performance : O(n) où n = nombre de pharmacies

### 3. Affichage dans PharmaciesList.js

La distance s'affiche automatiquement si elle existe :

```javascript
{pharmacy.distance && (
  <span className="distance">
    <i className="fas fa-walking"></i> {pharmacy.distance}
  </span>
)}
```

**Icône** : 🚶 `fa-walking` (Font Awesome)
**Emplacement** : Sous les informations de contact

### 4. Affichage dans les Popups

Sur la carte, les popups affichent également la distance :

```javascript
<Popup>
  <b>{pharmacy.name}</b><br/>
  {pharmacy.medicineName && <><i className="fas fa-pills"></i> {pharmacy.medicineName}<br/></>}
  {pharmacy.stock && <>Stock: {pharmacy.stock}<br/></>}
  {pharmacy.price && <>Prix: {pharmacy.price}<br/></>}
  {pharmacy.distance && <><i className="fas fa-walking"></i> {pharmacy.distance}</>}
</Popup>
```

## Flux de Données

```
App.js
  ├─ userLocation (state) ──────────┐
  │                                  │
  ├─ SearchSection                  │
  │    └─ Géolocalisation ──> setUserLocation
  │                                  │
  └─ ResultsDisplay ←───────────────┘
       │  (props: results, userLocation)
       │
       ├─ calculateDistance()
       │    └─ Formule de Haversine
       │
       ├─ formatDistance()
       │    └─ Format lisible
       │
       └─ resultsWithDistance
            ├─ Map markers (avec distance)
            └─ PharmaciesList (avec distance)
```

## Cas d'Usage

### 1. Géolocalisation Activée
```
Utilisateur à Yaoundé (3.8480, 11.5021)
Pharmacie à 2.5 km
→ Affiche: "2.5 km"
```

### 2. Recherche de Médicament
```
API retourne pharmacies avec coordonnées
Distance calculée pour chacune
→ Affiche dans liste et sur carte
```

### 3. Données Statiques (nearbyPharmacies)
```
Pharmacies avec distance pré-définie: "1.2 km"
→ Distance conservée telle quelle (pas de recalcul)
```

### 4. Sans Géolocalisation
```
userLocation = DEFAULT_CENTER (Yaoundé)
Distance calculée depuis Yaoundé
→ Distances peuvent être grandes si pharmacies ailleurs
```

## Styles CSS

### Distance dans la Liste
```css
.distance {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.distance i {
  color: var(--primary-medical);
}
```

### Distance dans le Popup
Utilise les styles par défaut de Leaflet avec icône Font Awesome.

## Propriétés Ajoutées aux Pharmacies

Chaque objet pharmacy reçoit :

```javascript
{
  // Propriétés existantes
  id: 1,
  name: "Pharmacie Centrale",
  lat: 48.8566,
  lng: 2.3522,
  // ... autres propriétés
  
  // Propriétés ajoutées
  distance: "2.3 km",      // String formatée pour affichage
  distanceValue: 2.345     // Number pour tri/filtrage futur
}
```

## Précision et Limites

### Précision
- **Formule de Haversine** : Suppose la Terre est une sphère parfaite
- **Erreur** : ±0.5% pour distances < 500 km
- **Exemple** : Pour 10 km réels, affiche entre 9.95 km et 10.05 km

### Limites
- Ne prend pas en compte les routes (distance "à vol d'oiseau")
- Ne considère pas le relief ou obstacles
- Pas de calcul d'itinéraire (pas de temps de trajet)

### Comparaison avec Distance Réelle
```
Distance Haversine : 2.3 km
Distance en voiture : ~3.1 km (routes sinueuses)
Temps de marche : ~28 minutes (4 km/h)
```

## Améliorations Futures

### 1. Tri par Distance
```javascript
const sortedResults = [...resultsWithDistance].sort((a, b) => 
  (a.distanceValue || Infinity) - (b.distanceValue || Infinity)
);
```

### 2. Filtre par Rayon
```javascript
const nearbyPharmacies = resultsWithDistance.filter(p => 
  p.distanceValue && p.distanceValue <= 5 // 5 km maximum
);
```

### 3. Temps de Trajet
Intégration avec API de routing (Google Maps, Mapbox, OSRM) :
```javascript
// Futur
distance: "2.3 km"
walkingTime: "28 min"
drivingTime: "8 min"
```

### 4. Itinéraire
```javascript
// Bouton "Itinéraire" qui ouvre Google Maps/Waze
<a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}>
  <i className="fas fa-directions"></i> Itinéraire
</a>
```

### 5. Distance en Temps Réel
Pour les pharmacies avec delivery :
```javascript
// Temps de livraison estimé
deliveryTime: calculateDeliveryTime(distanceValue)
// Ex: 2.3 km → "15-20 min"
```

## Tests

### Test Unitaire (distance.js)
```javascript
describe('calculateDistance', () => {
  test('Paris-Lyon = ~392 km', () => {
    const dist = calculateDistance(48.8566, 2.3522, 45.764, 4.8357);
    expect(dist).toBeCloseTo(392, 0);
  });
  
  test('même position = 0 km', () => {
    const dist = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);
    expect(dist).toBe(0);
  });
});

describe('formatDistance', () => {
  test('< 1 km en mètres', () => {
    expect(formatDistance(0.567)).toBe('567 m');
  });
  
  test('1-10 km avec 1 décimale', () => {
    expect(formatDistance(2.345)).toBe('2.3 km');
  });
  
  test('> 10 km sans décimale', () => {
    expect(formatDistance(15.789)).toBe('16 km');
  });
});
```

### Test d'Intégration
```javascript
// Vérifier que la distance s'affiche
const pharmacy = {
  id: 1,
  name: "Test Pharmacy",
  lat: 48.8566,
  lng: 2.3522
};

const userLoc = { lat: 48.86, lng: 2.35 };

// La distance devrait être ~400m
```

## Documentation Technique

### Formule de Haversine
```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2(√a, √(1−a))
d = R ⋅ c
```

Où :
- **φ** = latitude en radians
- **λ** = longitude en radians
- **R** = rayon de la Terre (6371 km)
- **d** = distance en kilomètres

### Conversion Degrés → Radians
```
radians = degrees × (π / 180)
```

## Ressources

- [Formule de Haversine](https://en.wikipedia.org/wiki/Haversine_formula)
- [Calcul de distance sur Terre](https://www.movable-type.co.uk/scripts/latlong.html)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Font Awesome Icons](https://fontawesome.com/icons)

## Commit Message

```
feat: Ajouter affichage automatique des distances

Calcule et affiche la distance entre l'utilisateur et chaque pharmacie
en utilisant la formule de Haversine.

Fonctionnalités:
✅ Calcul automatique basé sur géolocalisation
✅ Format intelligent (mètres < 1km, décimales 1-10km)
✅ Affichage dans liste et popups carte
✅ Performance optimisée avec useMemo
✅ Propriété distanceValue pour tri futur

Fichiers modifiés:
- frontend/src/utils/distance.js (nouveau)
- frontend/src/ResultsDisplay.js
- frontend/src/App.js

Formule utilisée: Haversine (précision ±0.5%)
Icône: fa-walking pour représentation visuelle
```
