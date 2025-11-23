# 🇨🇲 Guide de Repeuplement - Pharmacies Camerounaises

## Vue d'ensemble

Ce guide explique comment repeupler la base de données avec des pharmacies camerounaises au lieu des pharmacies françaises actuelles.

## Pharmacies créées

### 📍 Yaoundé (8 pharmacies)
- **Pharmacie Centrale de Yaoundé** - Avenue Kennedy, Centre-ville
- **Pharmacie du Mfoundi** - Rue de Nachtigal, Quartier Administratif
- **Pharmacie Bastos** - Quartier Bastos (près Ambassade de France)
- **Pharmacie Mokolo** - Marché Mokolo
- **Pharmacie Essos** - Quartier Essos
- **Pharmacie Mvog-Ada** - Quartier Mvog-Ada
- **Pharmacie Omnisport** - Face au Stade Omnisport
- **Pharmacie Melen** - Quartier Melen

### 📍 Douala (5 pharmacies)
- **Pharmacie Centrale de Douala** - Akwa
- **Pharmacie Akwa** - Quartier Akwa
- **Pharmacie Bonanjo** - Quartier Bonanjo
- **Pharmacie Bonabéri** - Bonabéri
- **Pharmacie New Bell** - Marché New Bell

### 📍 Autres villes (5 pharmacies)
- **Bafoussam** : 2 pharmacies
- **Garoua** : 1 pharmacie
- **Bamenda** : 1 pharmacie
- **Buea** : 1 pharmacie
- **Kribi** : 1 pharmacie

**Total : 20 pharmacies** couvrant les principales villes du Cameroun

## Médicaments disponibles

### Médicaments courants
- Doliprane 1000mg
- Ibuprofène 400mg
- Amoxicilline 500mg
- Efferalgan 1g
- Spasfon 80mg
- Flagyl 500mg
- Vitamine C 500mg

### Antipaludiques (important pour le Cameroun 🦟)
- **Artésunate 50mg** - Traitement rapide du paludisme
- **Coartem 20/120mg** - Combinaison thérapeutique
- **Nivaquine 100mg** - Chloroquine

## Étapes de repeuplement

### 1. Activer l'environnement virtuel

```bash
cd /home/mitou/FindPharma
source env/bin/activate
```

### 2. Arrêter le serveur Django (si lancé)

Si le serveur est en cours d'exécution, arrêtez-le avec `Ctrl+C`.

### 3. Exécuter le script de repeuplement

```bash
cd backend
python scripts/populate_cameroon_pharmacies.py
```

### 4. Vérifier les résultats

Vous devriez voir :
```
🇨🇲 Repeuplement de la base avec des pharmacies camerounaises

🗑️  Suppression des anciennes données...
   ✅ Stocks supprimés
   ✅ Pharmacies supprimées

📍 Création des pharmacies camerounaises...
   ✅ Pharmacie Centrale de Yaoundé (Yaoundé)
   ✅ Pharmacie du Mfoundi (Yaoundé)
   ...

✅ Total: 20 pharmacies créées

💊 Vérification des médicaments...
   ✅ Doliprane 1000mg
   ✅ Artésunate 50mg
   ...

✅ Total: 10 médicaments disponibles

📦 Création des stocks...
   ✅ 120 entrées de stock créées

======================================================================
✅ BASE DE DONNÉES REPEUPLÉE AVEC SUCCÈS
======================================================================
📍 Pharmacies: 20
💊 Médicaments: 10
📦 Stocks: 120

🇨🇲 Villes couvertes:
   • Yaoundé: 8 pharmacie(s)
   • Douala: 5 pharmacie(s)
   • Bafoussam: 2 pharmacie(s)
   • Garoua: 1 pharmacie(s)
   • Bamenda: 1 pharmacie(s)
   • Buea: 1 pharmacie(s)
   • Kribi: 1 pharmacie(s)

💡 Médicaments importants pour le Cameroun:
   • Artésunate: disponible dans 12 pharmacie(s)
   • Coartem: disponible dans 14 pharmacie(s)
   • Nivaquine: disponible dans 11 pharmacie(s)

🚀 Vous pouvez maintenant tester l'application!
======================================================================
```

### 5. Relancer le serveur Django

```bash
python manage.py runserver
```

### 6. Tester l'application

Ouvrez http://localhost:3000 et :

1. **Testez la localisation**
   - Cliquez sur "Me localiser"
   - Si vous êtes à Yaoundé, vous verrez les 8 pharmacies proches

2. **Testez la recherche**
   - Recherchez "doliprane"
   - Recherchez "artésunate" (antipaludique)
   - Recherchez "coartem" (antipaludique)

## Prix en FCFA

Les prix sont en **Francs CFA (XAF)** :
- Médicaments courants : 500 - 5 000 FCFA
- Antipaludiques : 3 000 - 8 000 FCFA

**Exemples** :
- Doliprane : ~2 500 FCFA
- Artésunate : ~5 000 FCFA
- Coartem : ~6 500 FCFA

## Coordonnées GPS

### Yaoundé (centre par défaut)
```
Latitude: 3.8480°N
Longitude: 11.5021°E
```

### Douala
```
Latitude: 4.0511°N
Longitude: 9.7679°E
```

### Distances typiques
- Yaoundé centre → Bastos : ~4 km
- Yaoundé centre → Essos : ~3 km
- Yaoundé centre → Mokolo : ~5 km
- Douala Akwa → Bonabéri : ~8 km

## Vérification manuelle

### Django Shell

```bash
python manage.py shell
```

```python
from pharmacies.models import Pharmacy, Medicine, Stock

# Compter les pharmacies par ville
from django.db.models import Count
Pharmacy.objects.values('city').annotate(count=Count('id'))

# Pharmacies à Yaoundé
Pharmacy.objects.filter(city='Yaoundé').count()  # 8

# Médicaments antipaludiques
Medicine.objects.filter(name__in=['Artésunate', 'Coartem', 'Nivaquine'])

# Stocks d'Artésunate
Stock.objects.filter(medicine__name='Artésunate', is_available=True).count()

# Pharmacie la plus proche du centre de Yaoundé
from pharmacies.views import calculate_distance
pharmacies = Pharmacy.objects.all()
for p in pharmacies:
    p.dist = calculate_distance(3.8480, 11.5021, p.latitude, p.longitude)
sorted(pharmacies, key=lambda x: x.dist)[:5]
```

## Réinitialisation complète (optionnel)

Si vous voulez repartir de zéro :

```bash
# Supprimer la base de données
rm backend/db.sqlite3

# Recréer les tables
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Repeupler
python scripts/populate_cameroon_pharmacies.py
```

## Problèmes courants

### Erreur : "Module not found"
**Solution** : Vérifiez que vous êtes dans le bon répertoire
```bash
cd /home/mitou/FindPharma/backend
python scripts/populate_cameroon_pharmacies.py
```

### Erreur : "Django not configured"
**Solution** : Le script configure automatiquement Django, mais assurez-vous d'être dans `backend/`

### Erreur : "Integrity error"
**Solution** : Supprimez manuellement les anciennes données
```bash
python manage.py shell
>>> from pharmacies.models import Pharmacy, Stock
>>> Stock.objects.all().delete()
>>> Pharmacy.objects.all().delete()
>>> exit()
```

Puis relancez le script.

## Modifications du fichier App.js

Après le repeuplement, modifiez le `DEFAULT_CENTER` dans `frontend/src/App.js` :

**Avant (France)** :
```javascript
const DEFAULT_CENTER = { 
  lat: 48.8566, // Paris
  lng: 2.3522
};
```

**Après (Cameroun)** :
```javascript
const DEFAULT_CENTER = { 
  lat: 3.8480, // Yaoundé
  lng: 11.5021
};
```

## Ajout de pharmacies supplémentaires

Pour ajouter vos propres pharmacies, modifiez le fichier `populate_cameroon_pharmacies.py` :

```python
pharmacies_data = [
    # ... pharmacies existantes ...
    {
        'name': 'Ma Nouvelle Pharmacie',
        'address': 'Mon Adresse',
        'phone': '+237 XXX XX XX XX',
        'email': 'email@pharma.cm',
        'latitude': 3.XXX,  # Coordonnées GPS
        'longitude': 11.XXX,
        'city': 'Yaoundé',
        'is_active': True,
    },
]
```

## Ressources

### Trouver des coordonnées GPS
- **Google Maps** : Clic droit → "Plus d'infos sur cet endroit"
- **OpenStreetMap** : https://www.openstreetmap.org
- **GPS coordinates** : https://www.gps-coordinates.net

### Quartiers de Yaoundé
- Centre-ville : 3.848, 11.502
- Bastos : 3.885, 11.518
- Mokolo : 3.870, 11.490
- Essos : 3.830, 11.530
- Mvog-Ada : 3.840, 11.510
- Melen : 3.820, 11.480

### Quartiers de Douala
- Akwa : 4.051, 9.768
- Bonanjo : 4.060, 9.710
- Bonabéri : 4.080, 9.690
- New Bell : 4.040, 9.720

## Commandes rapides

```bash
# Tout en une fois
cd /home/mitou/FindPharma
source env/bin/activate
cd backend
python scripts/populate_cameroon_pharmacies.py
python manage.py runserver
```

## Prochaines étapes

1. ✅ Repeupler la base de données
2. ✅ Modifier DEFAULT_CENTER dans App.js
3. ✅ Tester la localisation
4. ✅ Tester la recherche de médicaments
5. ✅ Vérifier les distances (en km, pas 5000 km!)
6. 📝 Commit et push des modifications

---

**Bon repeuplement ! 🇨🇲🏥💊**
