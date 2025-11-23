# 🧪 Guide de Test - FindPharma

**Version**: 1.0  
**Date**: 23 novembre 2025  
**Pour**: Équipes Backend & Frontend

---

## 📋 Table des Matières

1. [Tests Backend (API)](#tests-backend-api)
2. [Tests Frontend (Interface)](#tests-frontend-interface)
3. [Tests d'Intégration](#tests-dintégration)
4. [Tests des User Stories](#tests-des-user-stories)
5. [Outils de Test](#outils-de-test)

---

## 🐍 Tests Backend (API)

### Prérequis

```bash
# Backend doit être lancé
cd FindPharma
source ../venv/bin/activate
python manage.py runserver
```

### 1. Tests Manuels avec le Navigateur

#### Test 1: API Root
```
URL: http://127.0.0.1:8000/api/
Méthode: GET
Résultat attendu: Page d'accueil de l'API avec liste des endpoints
```

#### Test 2: Liste des Pharmacies
```
URL: http://127.0.0.1:8000/api/pharmacies/
Méthode: GET
Résultat attendu: JSON avec liste de toutes les pharmacies
```

Exemple de réponse:
```json
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Pharmacie Centrale de Yaoundé",
      "address": "Avenue Kennedy, Yaoundé",
      "phone": "+237 222 23 45 67",
      "latitude": 3.848,
      "longitude": 11.5021
    }
  ]
}
```

#### Test 3: Recherche de Médicament
```
URL: http://127.0.0.1:8000/api/search/?q=Paracétamol
Méthode: GET
Résultat attendu: JSON avec pharmacies ayant ce médicament en stock
```

Exemple de réponse:
```json
{
  "query": "Paracétamol",
  "count": 2,
  "results": [
    {
      "name": "Paracétamol",
      "dosage": "500mg",
      "form": "Comprimé",
      "pharmacies": [
        {
          "id": 1,
          "name": "Pharmacie Omnisports",
          "stock": {
            "quantity": 142,
            "price": "2.28",
            "is_available": true
          }
        }
      ]
    }
  ]
}
```

#### Test 4: Pharmacies à Proximité
```
URL: http://127.0.0.1:8000/api/nearby/?latitude=3.848&longitude=11.502&radius=5000
Méthode: GET
Résultat attendu: JSON avec pharmacies dans le rayon spécifié
```

Exemple de réponse:
```json
{
  "count": 8,
  "radius_km": 5.0,
  "pharmacies": [
    {
      "id": 1,
      "name": "Pharmacie Centrale de Yaoundé",
      "latitude": 3.848,
      "longitude": 11.5021,
      "distance": 0.0
    }
  ]
}
```

### 2. Tests avec cURL (Ligne de Commande)

```bash
# Test API Root
curl http://127.0.0.1:8000/api/

# Test Liste Pharmacies
curl http://127.0.0.1:8000/api/pharmacies/

# Test Recherche Médicament
curl "http://127.0.0.1:8000/api/search/?q=Paracétamol"

# Test Pharmacies à Proximité
curl "http://127.0.0.1:8000/api/nearby/?latitude=3.848&longitude=11.502&radius=5000"

# Test avec headers (JSON formaté)
curl -H "Accept: application/json" http://127.0.0.1:8000/api/pharmacies/ | python -m json.tool
```

### 3. Tests avec Postman

#### Configuration Postman:

1. **Créer une nouvelle Collection**: "FindPharma API"
2. **Ajouter une variable d'environnement**:
   - Variable: `base_url`
   - Value: `http://127.0.0.1:8000`

#### Requêtes à créer:

**1. GET Liste Pharmacies**
```
GET {{base_url}}/api/pharmacies/
Headers: Accept: application/json
```

**2. GET Recherche Médicament**
```
GET {{base_url}}/api/search/?q=Paracétamol
Headers: Accept: application/json
```

**3. GET Pharmacies Proches**
```
GET {{base_url}}/api/nearby/?latitude=3.848&longitude=11.502&radius=5000
Headers: Accept: application/json
```

### 4. Tests Automatisés Django

```bash
# Lancer tous les tests
python manage.py test

# Tests d'une app spécifique
python manage.py test pharmacies
python manage.py test medicines
python manage.py test stocks

# Tests avec verbose
python manage.py test --verbosity=2

# Tests avec couverture
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### ✅ Checklist Tests Backend

- [ ] API Root accessible (http://127.0.0.1:8000/api/)
- [ ] Liste pharmacies retourne JSON valide
- [ ] Recherche médicament fonctionne
- [ ] Pharmacies à proximité calcule distances correctement
- [ ] Filtres fonctionnent (radius, availability)
- [ ] Aucune erreur 500 dans les logs
- [ ] Temps de réponse < 500ms pour recherches simples
- [ ] Documentation Swagger accessible (http://127.0.0.1:8000/api/docs/)

---

## ⚛️ Tests Frontend (Interface)

### Prérequis

```bash
# Frontend doit être lancé
cd frontend
npm start
```

Ouvrir http://localhost:3000/ dans le navigateur

### 1. Tests d'Interface (UI)

#### Test 1: Chargement Initial

**Actions:**
1. Ouvrir http://localhost:3000/
2. Observer la page

**Vérifications:**
- [ ] Page se charge sans erreur
- [ ] Logo "FindPharma" visible (icône médicale + texte)
- [ ] Champ de recherche présent
- [ ] Bouton "Rechercher" visible (vert médical)
- [ ] Sélecteur de rayon visible (1-20 km)
- [ ] Bouton géolocalisation visible (bleu)
- [ ] Carte Leaflet s'affiche correctement
- [ ] Pas d'erreur dans la console (F12)

#### Test 2: Recherche de Médicament

**Actions:**
1. Taper "Paracétamol" dans le champ de recherche
2. Cliquer sur "Rechercher"
3. Observer les résultats

**Vérifications:**
- [ ] Liste de pharmacies s'affiche
- [ ] Chaque résultat contient:
  - [ ] Nom du médicament
  - [ ] Prix (XAF)
  - [ ] Stock (icône + texte)
  - [ ] Nom de la pharmacie
  - [ ] Téléphone
  - [ ] Distance
- [ ] Marqueurs verts apparaissent sur la carte
- [ ] Cliquer sur un marqueur ouvre un popup
- [ ] Popup contient les infos correctes
- [ ] Titre affiché: "Résultats de recherche"

#### Test 3: Géolocalisation

**Actions:**
1. Cliquer sur le bouton géolocalisation 📍
2. Autoriser l'accès à la localisation
3. Observer les résultats

**Vérifications:**
- [ ] Popup navigateur demande autorisation
- [ ] Liste de pharmacies proches s'affiche
- [ ] Chaque pharmacie contient:
  - [ ] Nom de la pharmacie
  - [ ] Adresse (avec icône)
  - [ ] Distance
  - [ ] Téléphone
- [ ] PAS de stock/prix (mode géolocalisation)
- [ ] Marqueur bleu indique position utilisateur
- [ ] Marqueurs verts pour pharmacies
- [ ] Carte centrée sur position utilisateur
- [ ] Titre affiché: "Pharmacies à Proximité"

#### Test 4: Sélecteur de Rayon

**Actions:**
1. Sélectionner différents rayons (1 km, 5 km, 10 km, 20 km)
2. Cliquer sur géolocalisation après chaque changement
3. Observer les résultats

**Vérifications:**
- [ ] Rayon 1 km: moins de résultats
- [ ] Rayon 20 km: plus de résultats
- [ ] Distances affichées cohérentes avec le rayon
- [ ] Message d'erreur si aucune pharmacie dans le rayon

#### Test 5: Thème Médical

**Vérifications visuelles:**
- [ ] Couleurs médicales appliquées:
  - [ ] Vert médical (#00a86b) pour bouton recherche
  - [ ] Bleu médical (#0066cc) pour texte "Find"
  - [ ] Vert pour texte "Pharma"
  - [ ] Cyan (#17a2b8) pour bouton géolocalisation
- [ ] Icône médicale (croix) dans le logo
- [ ] Gradients appliqués sur boutons
- [ ] Ombres médicales autour des éléments
- [ ] Bordures arrondies (12px)
- [ ] Hover effects sur boutons (translateY)

### 2. Tests de Console (DevTools)

**Ouvrir la console**: F12 → Console

#### Tests sans Backend (pour tester gestion erreurs)

**Actions:**
1. Arrêter le backend: `pkill -f "manage.py runserver"`
2. Rechercher "Paracétamol"

**Vérifications console:**
- [ ] Erreur fetch visible
- [ ] Message d'erreur utilisateur affiché
- [ ] Pas de crash de l'application

**Redémarrer backend et re-tester:**
```bash
cd FindPharma
python manage.py runserver
```

#### Tests avec Backend

**Console doit afficher:**
- [ ] Aucune erreur JavaScript
- [ ] Aucune erreur CORS
- [ ] Requêtes API en 200 OK:
  ```
  GET http://127.0.0.1:8000/api/search/?q=Paracétamol 200
  GET http://127.0.0.1:8000/api/nearby/?latitude=... 200
  ```

### 3. Tests Responsive

**Ouvrir DevTools**: F12 → Toggle device toolbar (Ctrl+Shift+M)

**Tester résolutions:**

#### Mobile (375x667 - iPhone SE)
- [ ] Layout s'adapte
- [ ] Boutons cliquables
- [ ] Texte lisible
- [ ] Carte visible

#### Tablet (768x1024 - iPad)
- [ ] Layout s'adapte
- [ ] Carte et liste côte à côte
- [ ] Tout reste lisible

#### Desktop (1920x1080)
- [ ] Layout optimal
- [ ] Utilisation espace écran
- [ ] Tous les éléments visibles

### 4. Tests de Performance

**Ouvrir DevTools**: F12 → Network

**Vérifications:**
- [ ] Temps de chargement initial < 3s
- [ ] Temps de réponse API < 500ms
- [ ] Taille totale page < 5MB
- [ ] Images optimisées
- [ ] Pas de requêtes inutiles

### ✅ Checklist Tests Frontend

- [ ] Interface se charge correctement
- [ ] Recherche médicament fonctionne
- [ ] Géolocalisation fonctionne
- [ ] Sélecteur de rayon fonctionne
- [ ] Thème médical appliqué
- [ ] Marqueurs affichés correctement (bleu user, vert pharmacies)
- [ ] Display logic différenciée (search vs geolocation)
- [ ] Pas d'erreur console
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Performance acceptable

---

## 🔗 Tests d'Intégration (Backend ↔ Frontend)

### Test Complet: Flux Utilisateur

#### Scénario 1: Recherche de Médicament

**Prérequis:**
- Backend lancé (port 8000)
- Frontend lancé (port 3000)
- Console ouverte (F12)

**Étapes:**
1. [ ] Ouvrir http://localhost:3000/
2. [ ] Taper "Doliprane" dans le champ
3. [ ] Cliquer sur "Rechercher"
4. [ ] Vérifier console: `GET .../api/search/?q=Doliprane` → 200 OK
5. [ ] Vérifier affichage:
   - Liste de pharmacies
   - Prix et stock affichés
   - Marqueurs verts sur carte
6. [ ] Cliquer sur un marqueur
7. [ ] Vérifier popup avec infos correctes
8. [ ] Cliquer sur numéro de téléphone
9. [ ] Vérifier appel téléphonique (mobile)

#### Scénario 2: Géolocalisation

**Étapes:**
1. [ ] Cliquer sur bouton géolocalisation 📍
2. [ ] Autoriser accès localisation
3. [ ] Vérifier console: `GET .../api/nearby/?latitude=...` → 200 OK
4. [ ] Changer rayon à 10 km
5. [ ] Re-cliquer géolocalisation
6. [ ] Vérifier plus de résultats
7. [ ] Vérifier distances cohérentes

#### Scénario 3: Gestion d'Erreurs

**Test 1: Backend Offline**
1. [ ] Arrêter backend
2. [ ] Rechercher "Aspirine"
3. [ ] Vérifier message d'erreur utilisateur
4. [ ] Vérifier pas de crash frontend

**Test 2: Recherche Vide**
1. [ ] Laisser champ vide
2. [ ] Cliquer "Rechercher"
3. [ ] Vérifier message: "Veuillez entrer un nom de médicament"

**Test 3: Médicament Inexistant**
1. [ ] Rechercher "XYZ123NonExistant"
2. [ ] Vérifier message: "Aucune pharmacie ne propose..."
3. [ ] Vérifier liste vide

**Test 4: Géolocalisation Refusée**
1. [ ] Refuser accès localisation
2. [ ] Vérifier message d'erreur
3. [ ] Vérifier application reste fonctionnelle

### ✅ Checklist Tests d'Intégration

- [ ] Backend et Frontend communiquent correctement
- [ ] Pas d'erreur CORS
- [ ] Données transformées correctement (backend → frontend)
- [ ] Recherche end-to-end fonctionne
- [ ] Géolocalisation end-to-end fonctionne
- [ ] Gestion d'erreurs appropriée
- [ ] Loading states affichés
- [ ] Messages utilisateur clairs

---

## 🎯 Tests des User Stories

### User Story 1: Pharmacies à Proximité ✅

**En tant qu'utilisateur, je veux localiser les pharmacies proches**

**Tests:**
1. [ ] Cliquer géolocalisation fonctionne
2. [ ] Permission localisation demandée
3. [ ] Rayon sélectionnable (1-20 km)
4. [ ] Liste pharmacies triée par distance
5. [ ] Adresses affichées
6. [ ] Téléphones affichés
7. [ ] Marqueurs verts sur carte
8. [ ] Marqueur bleu pour utilisateur
9. [ ] Distances calculées correctement
10. [ ] Pas de stock/prix (mode proximité)

### User Story 2: Recherche de Médicaments ✅

**En tant qu'utilisateur, je veux rechercher un médicament**

**Tests:**
1. [ ] Champ de recherche fonctionnel
2. [ ] Bouton "Rechercher" visible et cliquable
3. [ ] Entrée déclenche recherche
4. [ ] Résultats affichés avec:
   - [ ] Nom médicament + dosage
   - [ ] Prix en XAF
   - [ ] Stock (En Stock / Stock Limité / Épuisé)
   - [ ] Nom pharmacie
   - [ ] Téléphone
   - [ ] Distance
5. [ ] Marqueurs verts sur carte
6. [ ] Tri par distance
7. [ ] Affichage différencié (pas d'adresse, mais stock/prix)

### User Story 3: Gestion des Stocks (Backend uniquement)

**Tests Backend:**
1. [ ] Authentification token fonctionne
2. [ ] CRUD stocks fonctionnel
3. [ ] Permissions correctes (pharmacie ne voit que ses stocks)
4. [ ] Dashboard statistiques accessible
5. [ ] Historique modifications enregistré

---

## 🛠️ Outils de Test

### Pour le Backend:

1. **Django Test Suite**
```bash
python manage.py test
```

2. **Postman**
- Télécharger: https://www.postman.com/
- Importer collection FindPharma

3. **cURL** (ligne de commande)
```bash
curl http://127.0.0.1:8000/api/pharmacies/
```

4. **HTTPie** (plus lisible que cURL)
```bash
pip install httpie
http GET http://127.0.0.1:8000/api/pharmacies/
```

5. **Swagger UI** (inclus)
http://127.0.0.1:8000/api/docs/

### Pour le Frontend:

1. **Chrome DevTools** (F12)
- Console: erreurs JavaScript
- Network: requêtes API
- Elements: inspecter HTML/CSS
- Performance: analyser performances

2. **React Developer Tools** (Extension Chrome)
- Télécharger: https://chrome.google.com/webstore
- Inspecter composants React
- Voir state et props

3. **Lighthouse** (inclus dans Chrome)
- Performance
- Accessibilité
- Best Practices
- SEO

4. **Jest** (tests unitaires React)
```bash
npm test
```

---

## 📊 Rapport de Tests

### Template de Rapport

```markdown
# Rapport de Tests FindPharma

**Date**: [Date]
**Testeur**: [Nom]
**Version**: [Version]
**Branche**: restructure-project

## Backend Tests

### API Endpoints
- [ ] /api/pharmacies/ - ✅ Passe / ❌ Échec
- [ ] /api/search/ - ✅ Passe / ❌ Échec
- [ ] /api/nearby/ - ✅ Passe / ❌ Échec

### Performance
- Temps de réponse moyen: [X]ms
- Requêtes/seconde: [X]

### Bugs Trouvés
1. [Description bug]
2. [Description bug]

## Frontend Tests

### Interface
- [ ] Chargement initial - ✅ Passe / ❌ Échec
- [ ] Recherche médicament - ✅ Passe / ❌ Échec
- [ ] Géolocalisation - ✅ Passe / ❌ Échec

### Compatibilité
- Chrome: ✅
- Firefox: ✅
- Safari: ❌ (bugs identifiés)

### Bugs Trouvés
1. [Description bug]
2. [Description bug]

## Tests d'Intégration
- [ ] Backend ↔ Frontend - ✅ Passe / ❌ Échec
- [ ] CORS - ✅ Passe / ❌ Échec

## Conclusion
[Résumé des tests]

## Recommandations
1. [Recommandation]
2. [Recommandation]
```

---

## ✅ Checklist Finale de Test

### Avant de Merger une Branche:

**Backend:**
- [ ] Tous les tests Django passent
- [ ] Pas d'erreur dans les logs
- [ ] Documentation API à jour
- [ ] Migrations créées et appliquées
- [ ] Pas de données sensibles dans le code

**Frontend:**
- [ ] Application se compile sans warnings
- [ ] Tests Jest passent
- [ ] Pas d'erreur console
- [ ] Responsive sur mobile/desktop
- [ ] Performance acceptable (Lighthouse > 80)

**Intégration:**
- [ ] Backend + Frontend testés ensemble
- [ ] Tous les User Stories validés
- [ ] Gestion d'erreurs testée
- [ ] Documentation utilisateur à jour

---

## 📚 Ressources

- **Guide d'Installation**: `INSTALLATION.md`
- **Documentation API**: http://127.0.0.1:8000/api/docs/
- **Guide de Test d'Intégration**: `docs/GUIDE_TEST_INTEGRATION.md`
- **Architecture**: `docs/DOCUMENTATION_INDEX.md`

---

**🧪 Happy Testing!**

*Pour toute question, consulter la documentation ou contacter le lead technique.*

---

*Guide de test créé pour FindPharma - Version 1.0*
