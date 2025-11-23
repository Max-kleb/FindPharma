# 📍 Fonctionnalité : Recherche de Pharmacies Proches avec Rayon Personnalisable

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de se géolocaliser et de trouver les pharmacies les plus proches en choisissant un rayon de recherche personnalisé.

## Fonctionnalités implémentées

### 1. Sélecteur de rayon de recherche ✅

**Interface** :
- Menu déroulant avec 7 options de rayon
- Texte clair : "1 km autour de moi", "2 km autour de moi", etc.
- Icône de carte pour identification visuelle
- Message informatif : "Utilisé lors de la localisation"

**Options disponibles** :
- 1 km (zone très proche)
- 2 km (quartier)
- 3 km (plusieurs quartiers)
- 5 km (défaut - bonne couverture)
- 10 km (ville entière)
- 20 km (agglomération)
- 50 km (région élargie)

### 2. Intégration avec géolocalisation ✅

**Flux utilisateur** :
1. Utilisateur choisit un rayon (ex: 3 km)
2. Utilisateur clique sur "Me localiser"
3. Navigateur demande la permission de géolocalisation
4. Application récupère les coordonnées GPS
5. Backend cherche les pharmacies dans le rayon choisi
6. Résultats affichés avec distances

### 3. Messages informatifs ✅

**Succès** :
```
Console: ✅ 5 pharmacie(s) trouvée(s) dans un rayon de 3 km
```

**Aucun résultat** :
```
UI: ⚠️ Aucune pharmacie trouvée dans un rayon de 3 km. 
    Essayez d'augmenter le rayon de recherche.
```

### 4. Design amélioré ✅

**Styles ajoutés** :
- Container avec dégradé vert/violet subtil
- Hover effect sur le sélecteur
- Border animé au focus
- Icône d'information pour le hint
- Responsive design

## Code modifié

### 1. SearchSection.js

**Modifications** :
```javascript
// Sélecteur avec 7 options au lieu de 6
<select 
  id="search-radius"
  value={searchRadius} 
  onChange={(e) => setSearchRadius(Number(e.target.value))}
  className="radius-select"
  title="Choisissez la distance maximale pour trouver des pharmacies proches"
>
  <option value="1000">1 km autour de moi</option>
  <option value="2000">2 km autour de moi</option>
  <option value="3000">3 km autour de moi</option>
  <option value="5000">5 km autour de moi</option>
  <option value="10000">10 km autour de moi</option>
  <option value="20000">20 km autour de moi</option>
  <option value="50000">50 km autour de moi</option>
</select>

// Span informatif
<span className="radius-info">
  <i className="fas fa-info-circle"></i> Utilisé lors de la localisation
</span>
```

**Message d'erreur amélioré** :
```javascript
if (results.length === 0) {
  setError(`Aucune pharmacie trouvée dans un rayon de ${searchRadius / 1000} km. Essayez d'augmenter le rayon de recherche.`);
  setPharmacies([]);
}
```

### 2. App.css

**Nouveau style** :
```css
.radius-info {
    font-size: 12px;
    color: var(--gray-600);
    display: flex;
    align-items: center;
    gap: 4px;
    font-style: italic;
}

.radius-info i {
    color: var(--primary-blue);
    font-size: 14px;
}
```

## Cas d'usage

### Scénario 1 : Urgence médicale (rayon court)

**Contexte** : Utilisateur a besoin d'un médicament rapidement

**Actions** :
1. Sélectionne "1 km autour de moi"
2. Se localise
3. Voit les 2-3 pharmacies les plus proches
4. Peut s'y rendre à pied en 10-15 minutes

**Avantages** :
- Résultats très ciblés
- Pharmacies accessibles rapidement
- Moins de choix = décision plus rapide

### Scénario 2 : Recherche classique (rayon moyen)

**Contexte** : Utilisateur cherche une pharmacie ouverte ou un médicament spécifique

**Actions** :
1. Sélectionne "5 km autour de moi" (défaut)
2. Se localise
3. Voit 8-12 pharmacies dans son quartier et environs
4. Compare les prix, stocks, distances

**Avantages** :
- Bon équilibre entre proximité et choix
- Couvre la plupart des besoins urbains
- Distance raisonnable en voiture (10-15 min)

### Scénario 3 : Zone rurale/isolée (rayon large)

**Contexte** : Utilisateur dans une zone peu dense en pharmacies

**Actions** :
1. Sélectionne "20 km autour de moi" ou "50 km autour de moi"
2. Se localise
3. Voit toutes les pharmacies accessibles dans la région
4. Planifie un déplacement

**Avantages** :
- Assure de trouver au moins quelques pharmacies
- Vision globale de l'offre régionale
- Peut combiner avec d'autres courses

## API Backend (déjà implémentée)

```python
# backend/pharmacies/views.py

def nearby_pharmacies(request):
    """
    GET /api/nearby/?latitude=3.848&longitude=11.502&radius=5
    
    Paramètres:
    - latitude: Position de l'utilisateur
    - longitude: Position de l'utilisateur
    - radius: Rayon en KILOMÈTRES (ex: 5 pour 5 km)
    
    Note: Le frontend envoie en MÈTRES (5000) mais l'API 
    attend en KM, donc conversion faite côté frontend.
    """
    user_lat = float(request.query_params.get('latitude'))
    user_lon = float(request.query_params.get('longitude'))
    radius = float(request.query_params.get('radius', 5))
    
    # Calcul avec formule de Haversine
    # Retourne uniquement les pharmacies à distance <= radius
```

**Conversion frontend → backend** :
```javascript
// Frontend: searchRadius = 5000 (mètres)
// API call: getNearbyPharmacies(lat, lng, 5000)

// Dans api.js:
export const getNearbyPharmacies = async (lat, lon, radius = 5000) => {
  // radius en mètres, convertir en km pour l'API
  const radiusKm = radius / 1000; // 5000 / 1000 = 5 km
  
  const response = await fetch(
    `${API_URL}/api/nearby/?latitude=${lat}&longitude=${lon}&radius=${radiusKm}`
  );
  // ...
}
```

## Interface utilisateur

### Layout

```
┌─────────────────────────────────────────────┐
│  [🔍] Rechercher un médicament...   [X] [→] │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🗺️ Rayon de recherche: [5 km autour...▼]   │
│    ℹ️ Utilisé lors de la localisation       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         📍 Me localiser                     │
└─────────────────────────────────────────────┘
```

### États visuels

**Défaut** :
- Border vert clair
- Background gradient léger
- Texte gris foncé

**Hover** :
- Border vert plus foncé
- Background gradient plus prononcé
- Cursor pointer

**Focus** :
- Border vert vif
- Box-shadow verte
- Outline visible

**Disabled** :
- Opacity réduite (si nécessaire)
- Cursor not-allowed

## Tests à effectuer

### Test 1 : Rayon court (1 km)
```
1. Sélectionner "1 km autour de moi"
2. Cliquer "Me localiser"
3. Vérifier : Seulement 1-2 pharmacies (si en ville)
4. Vérifier : Toutes distances < 1 km
```

### Test 2 : Rayon moyen (5 km)
```
1. Sélectionner "5 km autour de moi"
2. Cliquer "Me localiser"
3. Vérifier : 5-10 pharmacies
4. Vérifier : Toutes distances < 5 km
```

### Test 3 : Rayon large (20 km)
```
1. Sélectionner "20 km autour de moi"
2. Cliquer "Me localiser"
3. Vérifier : 10-19 pharmacies (toutes dans la BDD)
4. Vérifier : Distances variées jusqu'à 20 km
```

### Test 4 : Aucun résultat
```
1. Sélectionner "1 km autour de moi"
2. Se localiser dans une zone isolée (simuler avec coordonnées)
3. Vérifier : Message d'erreur suggère d'augmenter le rayon
```

### Test 5 : Changement dynamique
```
1. Sélectionner "1 km", localiser → Voir 2 résultats
2. Changer pour "10 km"
3. Relocaliser
4. Vérifier : Voir 10-15 résultats maintenant
```

## Améliorations futures possibles

### 1. Slider visuel
```javascript
<input 
  type="range" 
  min="1000" 
  max="50000" 
  step="1000"
  value={searchRadius}
  onChange={(e) => setSearchRadius(Number(e.target.value))}
/>
<span>{searchRadius / 1000} km</span>
```

### 2. Indicateur visuel sur la carte
```javascript
// Cercle montrant le rayon de recherche
<Circle
  center={[userLocation.lat, userLocation.lng]}
  radius={searchRadius} // en mètres
  pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
/>
```

### 3. Sauvegarde de la préférence
```javascript
// LocalStorage
useEffect(() => {
  const saved = localStorage.getItem('searchRadius');
  if (saved) setSearchRadius(Number(saved));
}, []);

useEffect(() => {
  localStorage.setItem('searchRadius', searchRadius);
}, [searchRadius]);
```

### 4. Auto-ajustement intelligent
```javascript
// Si aucun résultat, proposer d'élargir automatiquement
if (results.length === 0 && searchRadius < 50000) {
  const suggestion = searchRadius * 2;
  setError(
    `Aucune pharmacie trouvée. 
     Voulez-vous chercher dans un rayon de ${suggestion / 1000} km ?`
  );
  // Bouton pour appliquer automatiquement
}
```

### 5. Statistiques de couverture
```javascript
// Afficher le nombre de pharmacies par rayon AVANT de se localiser
const getCoverageStats = async () => {
  // Appel API pour avoir les stats
  // "1 km : ~2 pharmacies, 5 km : ~8 pharmacies, ..."
}
```

## Résumé

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| **Sélecteur de rayon** | ✅ Implémenté | 7 options de 1 à 50 km |
| **Intégration géolocalisation** | ✅ Implémenté | Utilise le rayon choisi |
| **Messages informatifs** | ✅ Implémenté | Succès et erreurs clairs |
| **Design responsive** | ✅ Implémenté | Styles hover/focus |
| **Cercle sur carte** | ⏳ À faire | Amélioration visuelle |
| **Sauvegarde préférence** | ⏳ À faire | LocalStorage |
| **Auto-ajustement** | ⏳ À faire | UX intelligente |

**La fonctionnalité de base est complète et prête à l'emploi ! 🎉**
