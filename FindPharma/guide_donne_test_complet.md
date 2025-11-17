# 📊 Guide des Données Test - FindPharma

## 🎯 Vue d'ensemble

Ce jeu de données test contient des informations réalistes pour l'application FindPharma, basées sur la ville de Yaoundé, Cameroun.

---

## 📦 Contenu du jeu de données

### 1. **8 Pharmacies** à Yaoundé

| Nom | Quartier | Disponibilité |
|-----|----------|---------------|
| Pharmacie Centrale de Yaoundé | Centre-ville | Lun-Dim |
| Pharmacie du Marché Central | Marché Central | Lun-Dim |
| Pharmacie de la Gare | Gare Routière | 24h/24 |
| Pharmacie Mvog-Ada | Mvog-Ada | Lun-Sam |
| Pharmacie Bastos | Bastos | Lun-Dim |
| Pharmacie Essos | Essos | Lun-Dim |
| Pharmacie Nlongkak | Nlongkak | Lun-Sam |
| Pharmacie Mimboman | Mimboman | Lun-Dim |

### 2. **15 Médicaments** courants

| Catégorie | Médicaments |
|-----------|-------------|
| **Antalgiques** | Doliprane 1000mg, Paracétamol 500mg, Aspirine 500mg, Ibuprofène 400mg |
| **Antibiotiques** | Amoxicilline 500mg, Augmentin 1g, Ciprofloxacine 500mg, Metronidazole 500mg |
| **Antipaludiques** | Artesunate 60mg, Coartem 20/120mg |
| **Autres** | Cetirizine 10mg, Oméprazole 20mg, Ventoline 100mcg, Hydrocortisone 1%, Vitamine C 1000mg |

### 3. **52 Stocks** répartis entre pharmacies et médicaments

- Distribution réaliste des quantités
- Variations de prix entre pharmacies (±10%)
- Disponibilité variée selon les pharmacies

---

## 📁 Fichiers fournis

### 1. `test_data.json`
**Format**: JSON  
**Usage**: Importation automatique dans Django  
**Contenu**: Structure complète (pharmacies, médicaments, stocks)

### 2. `import_test_data.py`
**Format**: Script Python  
**Usage**: Importe automatiquement les données dans la base  
**Commande**: `python import_test_data.py`

### 3. `export_to_csv.py`
**Format**: Script Python  
**Usage**: Exporte les données en CSV pour Excel  
**Génère**: `pharmacies.csv`, `medicaments.csv`, `stocks.csv`

---

## 🚀 Comment utiliser les données

### Méthode 1: Importation automatique (Recommandée)

```bash
# 1. Placer test_data.json à la racine du projet
# 2. Modifier import_test_data.py: 
#    Ligne 18: Remplace 'ton_app_name' par le nom de ton app
# 3. Exécuter l'importation
python import_test_data.py
```

**Ce que fait le script:**
- ✅ Supprime les anciennes données (avec confirmation)
- ✅ Importe 8 pharmacies
- ✅ Importe 15 médicaments
- ✅ Crée 52 stocks
- ✅ Affiche les statistiques
- ✅ Donne des exemples de requêtes

### Méthode 2: Via l'interface Admin Django

```bash
# 1. Lancer le serveur
python manage.py runserver

# 2. Aller sur http://localhost:8000/admin
# 3. Ajouter manuellement les données depuis le JSON
```

### Méthode 3: Export en CSV pour Excel

```bash
# Générer les fichiers CSV
python export_to_csv.py

# Ouvre avec Excel ou LibreOffice
# Tu peux ensuite les joindre à ton rapport
```

---

## 📊 Statistiques du jeu de données

### Pharmacies
- **Total**: 8 pharmacies
- **Répartition géographique**: Couvre les principaux quartiers de Yaoundé
- **Horaires**: Variés (dont 1 pharmacie 24h/24)
- **Coordonnées GPS**: Réelles et précises

### Médicaments
- **Total**: 15 médicaments
- **Avec ordonnance**: 5 (33%)
- **Sans ordonnance**: 10 (67%)
- **Prix moyen**: 1500 à 12000 FCFA
- **Formes**: Comprimés, Gélules, Inhalateurs, Crèmes, Injectables

### Stocks
- **Total**: 52 entrées stock
- **Moyenne par pharmacie**: 6-7 médicaments
- **Quantités**: 20 à 200 unités
- **Variation de prix**: ±10% du prix moyen

---

## 🗺️ Coordonnées GPS des pharmacies

```
Centre-ville:     3.8480, 11.5021
Marché Central:   3.8650, 11.5180
Gare:             3.8520, 11.5100
Mvog-Ada:         3.8380, 11.5220
Bastos:           3.8760, 11.5050
Essos:            3.8590, 11.5310
Nlongkak:         3.8420, 11.4980
Mimboman:         3.8280, 11.5450
```

**Point de référence** (Centre de Yaoundé): `3.848, 11.502`

---

## 🧪 Exemples de tests avec les données

### Test 1: Recherche simple
```
GET /api/search/?q=doliprane

Résultat attendu:
- 1 médicament trouvé
- 8 pharmacies l'ont en stock
- Prix: 2450 à 2700 FCFA
```

### Test 2: Recherche avec géolocalisation
```
GET /api/search/?q=doliprane&latitude=3.848&longitude=11.502

Résultat attendu:
- Pharmacies triées par distance
- La plus proche: Pharmacie Centrale (0.02 km)
- La plus loin: Pharmacie Mimboman (~2.5 km)
```

### Test 3: Médicament rare
```
GET /api/search/?q=artesunate

Résultat attendu:
- 1 médicament trouvé
- 2 pharmacies seulement
- Prix: 11800 à 12000 FCFA
- Ordonnance requise: Oui
```

### Test 4: Pharmacies à proximité
```
GET /api/nearby/?latitude=3.848&longitude=11.502&radius=2

Résultat attendu:
- 4-5 pharmacies dans un rayon de 2km
- Pharmacie Centrale, Gare, Nlongkak
```

---

## 📈 Cas d'usage pour ton rapport

### 1. **Démonstration de la recherche**
- Montre comment les utilisateurs trouvent un médicament
- Capture d'écran avec Doliprane (présent partout)

### 2. **Démonstration de la géolocalisation**
- Montre le tri par distance
- Utilise les coordonnées du centre de Yaoundé

### 3. **Démonstration de la variation des prix**
- Compare les prix du Doliprane: 2450 à 2700 FCFA
- Montre que l'app aide à trouver le meilleur prix

### 4. **Démonstration médicament rare**
- Cherche Artesunate (seulement 2 pharmacies)
- Montre l'utilité pour les médicaments peu disponibles

---

## 📝 Inclure dans ton rapport

### Tableau 1: Vue d'ensemble
```
| Élément       | Quantité |
|---------------|----------|
| Pharmacies    | 8        |
| Médicaments   | 15       |
| Stocks        | 52       |
| Zone couverte | Yaoundé  |
```

### Tableau 2: Distribution des médicaments
```
| Type de médicament | Nombre | % avec ordonnance |
|--------------------|--------|-------------------|
| Antalgiques        | 4      | 0%                |
| Antibiotiques      | 4      | 100%              |
| Antipaludiques     | 2      | 50%               |
| Autres             | 5      | 20%               |
```

### Graphique suggéré
- **Carte de Yaoundé** avec les 8 pharmacies
- **Histogramme** des prix par médicament
- **Diagramme circulaire** de la répartition des stocks

---

## ✅ Checklist d'utilisation

- [ ] Fichier `test_data.json` placé à la racine
- [ ] Script `import_test_data.py` modifié (nom de l'app)
- [ ] Données importées avec succès
- [ ] Tests effectués avec Insomnia/Postman
- [ ] Captures d'écran prises pour le rapport
- [ ] Fichiers CSV générés (si besoin)
- [ ] Statistiques notées pour le rapport

---

## 🔄 Réinitialiser les données

Si tu veux recommencer à zéro:

```bash
# Méthode 1: Réimporter
python import_test_data.py

# Méthode 2: Via Django shell
python manage.py shell
>>> from ton_app_name.models import *
>>> Stock.objects.all().delete()
>>> Medicament.objects.all().delete()
>>> Pharmacy.objects.all().delete()
```

---

## 💡 Conseils pour ton rapport

1. **Captures d'écran**: Utilise Insomnia pour capturer les réponses JSON
2. **Carte**: Utilise Google Maps pour montrer les positions des pharmacies
3. **Tableaux**: Utilise les CSV générés pour créer des tableaux dans Word/Excel
4. **Statistiques**: Les chiffres sont réalistes, tu peux les citer
5. **Démonstration**: Suis l'ordre des tests suggérés

---

## 📞 Support

Si tu rencontres un problème:
1. Vérifie que `test_data.json` est bien formaté (JSON valide)
2. Vérifie que le nom de l'app est correct dans le script
3. Vérifie que les migrations sont appliquées
4. Vérifie que PostgreSQL est lancé

---

## 📄 Fichiers à joindre à ton rapport

1. ✅ `test_data.json` - Données complètes
2. ✅ `pharmacies.csv` - Liste des pharmacies
3. ✅ `medicaments.csv` - Liste des médicaments
4. ✅ `stocks.csv` - Tableau des stocks
5. ✅ Ce fichier `GUIDE_DONNEES_TEST.md` - Documentation

---

**Date de création**: Novembre 2025  
**Zone géographique**: Yaoundé, Cameroun  
**Format**: JSON, CSV  
**Licence**: Libre pour usage académique