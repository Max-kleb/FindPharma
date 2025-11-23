# 🗺️ Problème d'affichage des marqueurs sur la carte

## Date: 23 novembre 2025

## 🔴 Problème identifié

**Symptôme**: Lors de la recherche d'un médicament, les pharmacies apparaissent dans la liste mais leurs marqueurs ne s'affichent PAS sur la carte.

**Comportement actuel**:
- ✅ Recherche de médicament → Liste des pharmacies s'affiche
- ❌ Recherche de médicament → Marqueurs ABSENTS sur la carte
- ✅ Clic sur "Me localiser" → Marqueurs s'affichent (pharmacies par défaut)

## 🔍 Diagnostic

### 1. Vérifications effectuées

#### ✅ Backend - Sérialiseur
```python
# backend/pharmacies/serializers.py - PharmacyWithStockSerializer
fields = ['id', 'name', 'address', 'phone', 'email',
          'latitude', 'longitude', 'opening_hours',  # ← Coordonnées incluses
          'distance', 'stock']
```
**Résultat**: Le backend DEVRAIT retourner `latitude` et `longitude` ✅

#### ✅ Frontend - Transformation
```javascript
// frontend/src/services/api.js - transformSearchResults()
pharmacies.push({
    id: pharmacy.id,
    name: pharmacy.name,
    lat: pharmacy.latitude,  // ← Transformation latitude → lat
    lng: pharmacy.longitude, // ← Transformation longitude → lng
    // ...
});
```
**Résultat**: La transformation est correcte ✅

#### ✅ Frontend - Rendu des marqueurs
```javascript
// frontend/src/ResultsDisplay.js
{results
    .filter(pharmacy => pharmacy.lat && pharmacy.lng)
    .map((pharmacy) => (
        <Marker 
            position={[pharmacy.lat, pharmacy.lng]}
            icon={pharmacyIcon}
        >
```
**Résultat**: Le code de rendu filtre et affiche correctement ✅

### 2. Hypothèses

#### Hypothèse 1: L'API ne retourne PAS les coordonnées
**Probabilité**: 🔴 ÉLEVÉE

**Raison**: Les pharmacies dans la base de données n'ont peut-être pas de coordonnées `latitude` et `longitude` renseignées.

**Test**: Vérifier la réponse brute de l'API avec `test_api_response.html`

#### Hypothèse 2: Problème de CSS de la carte
**Probabilité**: 🟡 MOYENNE (déjà corrigé)

**Solution appliquée**:
```css
.map-area {
    height: 500px; /* Hauteur fixe au lieu de min-height */
}
```

#### Hypothèse 3: Problème de transformation asynchrone
**Probabilité**: 🟢 FAIBLE

**Raison**: Les logs montrent que la transformation est appelée correctement

## 🛠️ Solutions appliquées

### Solution 1: Amélioration du CSS de la carte
```css
.map-area {
    height: 500px;
    min-height: 400px;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.map-canvas, .leaflet-container {
    height: 100% !important;
    width: 100% !important;
}
```

### Solution 2: Ajout de logs de débogage
```javascript
// Dans api.js
console.log('🔍 API Search Response:', data);
console.log('✨ Transformed Results:', transformed);
transformed.forEach((p, index) => {
    console.log(`  ${index + 1}. ${p.name}: lat=${p.lat}, lng=${p.lng}`);
});

// Dans ResultsDisplay.js
console.log('ResultsDisplay - Results:', results);
console.log(`Marker for ${pharmacy.name}:`, {lat: pharmacy.lat, lng: pharmacy.lng});
```

### Solution 3: Filtrage des pharmacies sans coordonnées
```javascript
{results
    .filter(pharmacy => pharmacy.lat && pharmacy.lng)
    .map((pharmacy) => ( ... ))
}
```

### Solution 4: Popup enrichie avec plus d'infos
```javascript
<Popup>
    <b>{pharmacy.name}</b><br/>
    {pharmacy.medicineName && <><i className="fas fa-pills"></i> {pharmacy.medicineName}<br/></>}
    {pharmacy.stock && <>Stock: {pharmacy.stock}<br/></>}
    {pharmacy.price && <>Prix: {pharmacy.price}<br/></>}
    {pharmacy.distance && <><i className="fas fa-map-marker-alt"></i> {pharmacy.distance}</>}
</Popup>
```

## 📋 Checklist de débogage

### Étape 1: Vérifier la base de données
```bash
cd /home/mitou/FindPharma/backend
python manage.py shell
```

```python
from pharmacies.models import Pharmacy

# Vérifier combien de pharmacies ont des coordonnées
total = Pharmacy.objects.count()
with_coords = Pharmacy.objects.filter(
    latitude__isnull=False,
    longitude__isnull=False
).count()

print(f"Total pharmacies: {total}")
print(f"Avec coordonnées: {with_coords}")
print(f"Sans coordonnées: {total - with_coords}")

# Afficher quelques pharmacies
for p in Pharmacy.objects.all()[:5]:
    print(f"{p.name}: lat={p.latitude}, lng={p.longitude}")
```

### Étape 2: Tester l'API directement
```bash
curl -s "http://127.0.0.1:8000/api/search/?q=doliprane" | python3 -m json.tool > search_response.json
cat search_response.json | grep -A2 "latitude"
```

### Étape 3: Utiliser la page de test
1. Ouvrir: `http://localhost:3000/test_api_response.html`
2. Cliquer sur "Tester recherche doliprane"
3. Vérifier si `latitude` et `longitude` sont présents
4. Vérifier si les valeurs sont valides (non null, non undefined)

### Étape 4: Console du navigateur
1. Ouvrir l'application: `http://localhost:3000`
2. Ouvrir DevTools (F12)
3. Onglet Console
4. Taper "doliprane" dans la recherche
5. Observer les logs:
   - "🔍 API Search Response"
   - "✨ Transformed Results"
   - "ResultsDisplay - Results"
   - "Marker for..."

## 🎯 Solution probable

Si après toutes ces vérifications, les coordonnées sont absentes de la base de données:

### Option A: Mettre à jour les pharmacies existantes

```python
# backend/scripts/update_pharmacy_coords.py
from pharmacies.models import Pharmacy

# Exemple: Mettre des coordonnées pour Yaoundé
pharmacies_yaoundé = [
    {"name": "Pharmacie Centrale", "lat": 3.8480, "lng": 11.5021},
    {"name": "Pharmacie du Marché", "lat": 3.8500, "lng": 11.5100},
    # ...
]

for data in pharmacies_yaoundé:
    pharmacy = Pharmacy.objects.filter(name__icontains=data["name"]).first()
    if pharmacy:
        pharmacy.latitude = data["lat"]
        pharmacy.longitude = data["lng"]
        pharmacy.save()
        print(f"✅ {pharmacy.name} mis à jour")
```

### Option B: Utiliser un service de géocodage

```python
# Utiliser l'API Nominatim (OpenStreetMap) pour obtenir les coordonnées
import requests

def geocode_address(address):
    url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json"
    response = requests.get(url, headers={"User-Agent": "FindPharma/1.0"})
    data = response.json()
    if data:
        return float(data[0]['lat']), float(data[0]['lon'])
    return None, None

# Mettre à jour toutes les pharmacies
for pharmacy in Pharmacy.objects.filter(latitude__isnull=True):
    lat, lng = geocode_address(f"{pharmacy.address}, {pharmacy.city}")
    if lat and lng:
        pharmacy.latitude = lat
        pharmacy.longitude = lng
        pharmacy.save()
```

## 📊 Résultat attendu

Après correction, vous devriez voir:

1. **Console du navigateur**:
```
🔍 API Search Response: {results: [...]}
✨ Transformed Results: [{name: "Pharmacie...", lat: 3.848, lng: 11.502}, ...]
📊 2 pharmacies avec coordonnées
  1. Pharmacie Centrale: lat=3.848, lng=11.502
  2. Pharmacie du Marché: lat=3.85, lng=11.51
ResultsDisplay - Results: (2) [{...}, {...}]
Marker for Pharmacie Centrale: {lat: 3.848, lng: 11.502}
Marker for Pharmacie du Marché: {lat: 3.85, lng: 11.51}
```

2. **Sur la carte**: Marqueurs verts visibles pour chaque pharmacie

3. **Au clic sur un marqueur**: Popup avec infos de la pharmacie

## 🚀 Actions immédiates

1. ✅ Ouvrir `http://localhost:3000/test_api_response.html`
2. ✅ Cliquer sur "Tester recherche doliprane"
3. ✅ Vérifier si `latitude` et `longitude` sont présents et valides
4. ⏳ Si ABSENTS → Mettre à jour la base de données
5. ⏳ Si PRÉSENTS mais carte vide → Vérifier console navigateur

## 📝 Notes

- Les pharmacies par défaut dans App.js ont des coordonnées hardcodées, c'est pourquoi elles s'affichent
- Les pharmacies de l'API doivent avoir leurs coordonnées dans la base de données PostgreSQL
- Le composant `MapResizer` force la carte à se redessiner après le rendu initial

## 🔗 Fichiers concernés

- `backend/pharmacies/serializers.py` - Sérialiseur avec latitude/longitude
- `backend/pharmacies/views.py` - Vue search_medicine
- `frontend/src/services/api.js` - Transformation des données
- `frontend/src/ResultsDisplay.js` - Rendu de la carte et marqueurs
- `frontend/src/App.css` - Style de la carte
- `test_api_response.html` - Page de diagnostic
