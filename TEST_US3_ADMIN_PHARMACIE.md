# 🏥 TEST US 3 - Interface d'Administration Pharmacie

## 📋 Objectif de l'US 3

**En tant que pharmacie, je veux gérer mes produits et stocks pour que les utilisateurs aient des données à jour.**

---

## ✅ Fonctionnalités à Tester

### 1. Authentification Pharmacie
- [x] Créer un compte type "pharmacy"
- [ ] Se connecter avec ce compte
- [ ] Accéder au dashboard pharmacie

### 2. Gestion des Stocks (CRUD)
- [ ] **CREATE** : Ajouter un nouveau médicament au stock
- [ ] **READ** : Lister tous les stocks de ma pharmacie
- [ ] **UPDATE** : Modifier quantité et prix d'un stock
- [ ] **DELETE** : Supprimer un stock

### 3. Actions Spéciales
- [ ] Marquer un stock comme disponible
- [ ] Marquer un stock comme indisponible

### 4. Permissions et Sécurité
- [ ] Vérifier qu'une pharmacie ne peut modifier que ses propres stocks
- [ ] Vérifier qu'un client ne peut pas accéder aux endpoints de modification

---

## 🔐 Prérequis : Compte Pharmacie Créé

### Compte Test Créé
```json
{
  "id": 4,
  "username": "admin_centrale",
  "email": "admin@pharmaciecentrale.cm",
  "user_type": "pharmacy",
  "pharmacy": 114,
  "pharmacy_name": "Pharmacie Centrale de Yaoundé"
}
```

### Token d'Accès
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0MDI3MTIwLCJpYXQiOjE3NjQwMjM1MjAsImp0aSI6ImFmM2U5ZGYzMTlmOTRhN2ZiZmUwYjUyNTkwMGFmYTc1IiwidXNlcl9pZCI6IjQiLCJpc3MiOiJGaW5kUGhhcm1hIn0.-NDt1DgBAEjdDHyIJgxEmbeeA47Cm5646R2hG93rvWM
```

**⏰ Expiration** : Le token expire après 60 minutes. Si expiré, reconnectez-vous.

---

## 📡 Endpoints API à Tester

### Base URL
```
http://127.0.0.1:8000/api/pharmacies/{pharmacy_id}/stocks/
```

### Liste des Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/pharmacies/114/stocks/` | Lister tous les stocks | Non (lecture publique) |
| GET | `/api/pharmacies/114/stocks/{id}/` | Détails d'un stock | Non |
| POST | `/api/pharmacies/114/stocks/` | Ajouter un stock | **Oui (Pharmacie)** |
| PUT/PATCH | `/api/pharmacies/114/stocks/{id}/` | Modifier un stock | **Oui (Pharmacie)** |
| DELETE | `/api/pharmacies/114/stocks/{id}/` | Supprimer un stock | **Oui (Pharmacie)** |
| POST | `/api/pharmacies/114/stocks/{id}/mark_available/` | Marquer disponible | **Oui (Pharmacie)** |
| POST | `/api/pharmacies/114/stocks/{id}/mark_unavailable/` | Marquer indisponible | **Oui (Pharmacie)** |

---

## 🧪 Tests Backend (Préparation)

### TEST 1 : Lister les Stocks Actuels (Lecture Publique)

**Objectif** : Voir les stocks existants de la pharmacie avant modification

```bash
curl -s "http://127.0.0.1:8000/api/pharmacies/114/stocks/" | jq .
```

**Résultat attendu** :
- ✅ Liste de stocks (JSON array)
- ✅ Chaque stock contient : `id`, `medicine`, `pharmacy`, `quantity`, `price`, `is_available`
- ✅ Status HTTP 200

**Exemple de réponse** :
```json
[
  {
    "id": 1,
    "medicine": {
      "id": 1,
      "name": "Paracétamol 500mg",
      "description": "Anti-douleur et antipyrétique"
    },
    "pharmacy": 114,
    "quantity": 150,
    "price": "500.00",
    "is_available": true,
    "last_updated": "2025-11-24T22:00:00Z"
  }
]
```

---

### TEST 2 : Lister les Médicaments Disponibles

**Objectif** : Obtenir la liste des médicaments pour pouvoir en ajouter au stock

```bash
curl -s "http://127.0.0.1:8000/api/medicines/" | jq '.results[] | {id, name}'
```

**Résultat attendu** :
- ✅ Liste de 23 médicaments
- ✅ Format : `{"id": 1, "name": "Paracétamol 500mg"}`

**Sauvegarder un ID** : Choisir un médicament qui n'est PAS encore dans le stock de la pharmacie 114.

---

### TEST 3 : Ajouter un Nouveau Stock (CREATE) ✏️

**Objectif** : Ajouter un médicament au stock de la pharmacie

**⚠️ Nécessite authentification avec le token pharmacie**

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0MDI3MTIwLCJpYXQiOjE3NjQwMjM1MjAsImp0aSI6ImFmM2U5ZGYzMTlmOTRhN2ZiZmUwYjUyNTkwMGFmYTc1IiwidXNlcl9pZCI6IjQiLCJpc3MiOiJGaW5kUGhhcm1hIn0.-NDt1DgBAEjdDHyIJgxEmbeeA47Cm5646R2hG93rvWM"

curl -X POST "http://127.0.0.1:8000/api/pharmacies/114/stocks/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine": 5,
    "quantity": 100,
    "price": 3500.00,
    "is_available": true
  }' | jq .
```

**Paramètres** :
- `medicine` (int, requis) : ID du médicament (ex: 5 = Amoxicilline 500mg)
- `quantity` (int, requis) : Quantité en stock (ex: 100)
- `price` (decimal, requis) : Prix unitaire en FCFA (ex: 3500.00)
- `is_available` (bool, optionnel) : Disponible à la vente (défaut: true)

**Résultat attendu** :
- ✅ Status HTTP **201 Created**
- ✅ Stock créé avec un nouvel ID
- ✅ Message : Stock ajouté avec succès
- ❌ Si le médicament existe déjà : **400 Bad Request** avec message "Ce médicament existe déjà dans votre stock"
- ❌ Si pas authentifié : **401 Unauthorized**
- ❌ Si mauvaise pharmacie : **403 Forbidden**

**Exemple de réponse réussie** :
```json
{
  "id": 42,
  "medicine": {
    "id": 5,
    "name": "Amoxicilline 500mg",
    "description": "Antibiotique à large spectre"
  },
  "pharmacy": 114,
  "pharmacy_name": "Pharmacie Centrale de Yaoundé",
  "quantity": 100,
  "price": "3500.00",
  "is_available": true,
  "last_updated": "2025-11-24T22:35:00Z"
}
```

---

### TEST 4 : Modifier un Stock Existant (UPDATE) ✏️

**Objectif** : Modifier la quantité et/ou le prix d'un stock

**⚠️ Nécessite authentification**

```bash
TOKEN="[VOTRE_TOKEN]"
STOCK_ID=42  # ID du stock à modifier (obtenu du TEST 3)

curl -X PATCH "http://127.0.0.1:8000/api/pharmacies/114/stocks/$STOCK_ID/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "price": 3200.00
  }' | jq .
```

**Paramètres modifiables** :
- `quantity` : Nouvelle quantité
- `price` : Nouveau prix
- `is_available` : Nouveau statut de disponibilité

**Résultat attendu** :
- ✅ Status HTTP **200 OK**
- ✅ Stock mis à jour avec nouvelles valeurs
- ✅ `last_updated` changé
- ❌ Si stock inexistant : **404 Not Found**
- ❌ Si pas la bonne pharmacie : **403 Forbidden**

---

### TEST 5 : Marquer un Stock comme Indisponible 🚫

**Objectif** : Rendre un stock invisible pour les clients (rupture temporaire)

```bash
TOKEN="[VOTRE_TOKEN]"
STOCK_ID=42

curl -X POST "http://127.0.0.1:8000/api/pharmacies/114/stocks/$STOCK_ID/mark_unavailable/" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Résultat attendu** :
- ✅ Status HTTP **200 OK**
- ✅ `is_available` passe à `false`
- ✅ Le stock n'apparaît plus dans les recherches publiques
- ✅ Message : "Stock marqué comme indisponible"

---

### TEST 6 : Marquer un Stock comme Disponible ✅

**Objectif** : Rendre à nouveau un stock visible après réapprovisionnement

```bash
TOKEN="[VOTRE_TOKEN]"
STOCK_ID=42

curl -X POST "http://127.0.0.1:8000/api/pharmacies/114/stocks/$STOCK_ID/mark_available/" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Résultat attendu** :
- ✅ Status HTTP **200 OK**
- ✅ `is_available` passe à `true`
- ✅ Le stock réapparaît dans les recherches publiques
- ✅ Message : "Stock marqué comme disponible"

---

### TEST 7 : Supprimer un Stock (DELETE) 🗑️

**Objectif** : Retirer définitivement un médicament du catalogue

```bash
TOKEN="[VOTRE_TOKEN]"
STOCK_ID=42

curl -X DELETE "http://127.0.0.1:8000/api/pharmacies/114/stocks/$STOCK_ID/" \
  -H "Authorization: Bearer $TOKEN"
```

**Résultat attendu** :
- ✅ Status HTTP **204 No Content**
- ✅ Le stock est supprimé de la base de données
- ✅ GET sur ce stock retourne **404 Not Found**
- ❌ Si pas authentifié : **401 Unauthorized**
- ❌ Si pas la bonne pharmacie : **403 Forbidden**

---

### TEST 8 : Vérifier les Permissions (Sécurité) 🔒

#### Test 8.1 : Un Client ne Peut Pas Modifier

**Objectif** : Vérifier qu'un utilisateur type "customer" ne peut pas modifier les stocks

```bash
# Se connecter en tant que client (créé dans TEST 4 précédent)
CLIENT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0MDI0MzQyLCJpYXQiOjE3NjQwMjA3NDMsImp0aSI6IjA2ODBiMzA1Mjk1OTQ0MDE5MmNkM2M1NDc5NmJkMmJkIiwidXNlcl9pZCI6IjMiLCJpc3MiOiJGaW5kUGhhcm1hIn0.V_j4RO9F8OB1fTEbyGLX5Mqx6YHYQ7LfsYVK0M0wO7c"

curl -X POST "http://127.0.0.1:8000/api/pharmacies/114/stocks/" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine": 10,
    "quantity": 50,
    "price": 1000.00
  }'
```

**Résultat attendu** :
- ❌ Status HTTP **403 Forbidden**
- ❌ Message : "Vous n'avez pas la permission de modifier cette pharmacie"

#### Test 8.2 : Une Pharmacie ne Peut Modifier que Ses Propres Stocks

**Objectif** : Vérifier qu'une pharmacie A ne peut pas modifier les stocks d'une pharmacie B

```bash
TOKEN="[TOKEN_PHARMACIE_114]"

# Essayer de modifier les stocks de la pharmacie 115 (Marché Central)
curl -X POST "http://127.0.0.1:8000/api/pharmacies/115/stocks/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine": 10,
    "quantity": 50,
    "price": 1000.00
  }'
```

**Résultat attendu** :
- ❌ Status HTTP **403 Forbidden**
- ❌ Message : "Vous n'avez pas la permission de modifier cette pharmacie"

---

## 🖥️ Tests Frontend (Interface Web)

### Prérequis
1. Backend opérationnel : http://127.0.0.1:8000 ✅
2. Frontend opérationnel : http://localhost:3000 ✅
3. Compte pharmacie créé : `admin@pharmaciecentrale.cm` / `AdminPass123!` ✅

---

### TEST F1 : Connexion avec Compte Pharmacie

**Actions** :
1. Ouvrir http://localhost:3000
2. Cliquer sur **"Connexion"** ou **"Login"**
3. Entrer :
   - Email : `admin@pharmaciecentrale.cm`
   - Mot de passe : `AdminPass123!`
4. Cliquer sur **"Se connecter"**

**Résultat attendu** :
- ✅ Connexion réussie
- ✅ Token JWT stocké dans localStorage
- ✅ Header affiche : "Pharmacie Centrale de Yaoundé" ou "admin_centrale"
- ✅ Nouveau bouton visible : **"Dashboard"**, **"Gestion Stocks"**, ou **"Admin"**

**Vérification technique** :
- F12 → Console → `localStorage.getItem('token')` doit contenir un JWT
- F12 → Network → Voir requête POST `/api/auth/login/` avec status 200

---

### TEST F2 : Accéder au Dashboard Pharmacie

**Actions** :
1. Connecté en tant que pharmacie
2. Chercher et cliquer sur le bouton **"Dashboard"** ou **"Gestion des stocks"**
3. (Peut être dans un menu déroulant ou sidebar)

**Résultat attendu** :
- ✅ Page dédiée aux pharmacies s'affiche
- ✅ Titre : "Dashboard Pharmacie" ou "Gestion des Stocks"
- ✅ Nom de la pharmacie affiché : "Pharmacie Centrale de Yaoundé"
- ✅ Tableau ou liste de stocks visible
- ✅ Bouton **"Ajouter un médicament"** ➕ visible en haut

**Composants attendus** :
- **Header du tableau** : Médicament | Quantité | Prix | Disponible | Actions
- **Bouton d'ajout** : Visible et cliquable
- **Pas d'erreur** dans la console F12

**Vérification technique** :
- F12 → Network → Voir requête GET `/api/pharmacies/114/stocks/` avec status 200
- Les données du backend doivent s'afficher dans le tableau

---

### TEST F3 : Lister les Stocks Existants

**Objectif** : Voir la liste actuelle des stocks de la pharmacie

**Résultat attendu** :
- ✅ Tableau/Liste affiche tous les stocks
- ✅ Pour chaque stock :
  - **Nom du médicament** (ex: "Paracétamol 500mg")
  - **Quantité** (ex: 150)
  - **Prix** (ex: "500 FCFA" ou "500.00 XAF")
  - **Statut** : Badge ✅ "Disponible" ou ❌ "Indisponible"
  - **Actions** : Boutons Modifier ✏️, Supprimer 🗑️, Toggle disponibilité
- ✅ Si aucun stock : Message "Aucun stock" + bouton "Ajouter"

**Données attendues** :
- Environ 15-20 médicaments (créés par `populate_database.py`)
- Prix entre 500 et 15000 FCFA
- Quantités variables

---

### TEST F4 : Ajouter un Nouveau Stock (Interface) ➕

**Actions** :
1. Dans le dashboard, cliquer sur **"Ajouter un médicament"** ➕
2. Un formulaire/modale s'ouvre avec champs :
   - **Médicament** : Liste déroulante (dropdown)
   - **Quantité** : Input number
   - **Prix** : Input number (FCFA)
   - **Disponible** : Checkbox ☑️ (coché par défaut)
3. Remplir :
   - Sélectionner un médicament (ex: "Vitamine C 500mg")
   - Quantité : `100`
   - Prix : `1500`
   - Disponible : ☑️ Coché
4. Cliquer sur **"Ajouter"** ou **"Enregistrer"**

**Résultat attendu** :
- ✅ Message de succès : "Stock ajouté avec succès" 🎉
- ✅ Le formulaire se ferme automatiquement
- ✅ Le nouveau stock apparaît **immédiatement** dans la liste
- ✅ Les valeurs affichées correspondent aux valeurs saisies
- ❌ Si médicament déjà en stock : Message d'erreur "Ce médicament existe déjà"

**Vérification technique** :
- F12 → Network → Voir requête POST `/api/pharmacies/114/stocks/` avec status 201
- Le body de la requête contient les bonnes données JSON
- La réponse contient le stock créé avec son nouvel ID

---

### TEST F5 : Modifier un Stock Existant ✏️

**Actions** :
1. Dans la liste des stocks, trouver un stock existant
2. Cliquer sur le bouton **"Modifier"** ✏️ ou icône crayon
3. Un formulaire/modale s'ouvre **pré-rempli** avec les valeurs actuelles
4. Modifier :
   - **Quantité** : Changer de 150 → 200
   - **Prix** : Changer de 500 → 600
5. Cliquer sur **"Enregistrer"** ou **"Valider"**

**Résultat attendu** :
- ✅ Message de succès : "Stock mis à jour" ✅
- ✅ Les nouvelles valeurs s'affichent **immédiatement** dans la liste
- ✅ Le formulaire se ferme
- ✅ `last_updated` est mis à jour (si affiché)

**Vérification technique** :
- F12 → Network → Voir requête PATCH `/api/pharmacies/114/stocks/{id}/` avec status 200
- Le body contient uniquement les champs modifiés

---

### TEST F6 : Marquer un Stock Disponible/Indisponible 🔄

**Actions** :
1. Trouver un stock avec badge **"Disponible"** ✅
2. Cliquer sur un bouton **"Marquer indisponible"** ou toggle/switch
3. Observer le changement
4. Re-cliquer pour remettre **"Disponible"**

**Résultat attendu** :
- ✅ Badge change immédiatement :
  - ✅ "Disponible" (vert) ↔️ ❌ "Indisponible" (rouge/gris)
- ✅ Message de confirmation (optionnel)
- ✅ L'état persiste après rechargement de la page
- ✅ Les clients ne voient plus ce stock dans les recherches (quand indisponible)

**Vérification technique** :
- F12 → Network → Voir requête POST `/api/pharmacies/114/stocks/{id}/mark_available/` ou `mark_unavailable/`
- Status 200

---

### TEST F7 : Supprimer un Stock 🗑️

**Actions** :
1. Trouver un stock dans la liste
2. Cliquer sur le bouton **"Supprimer"** 🗑️ ou icône poubelle
3. Une confirmation apparaît : **"Êtes-vous sûr de vouloir supprimer ce stock ?"**
4. Cliquer sur **"Confirmer"** ou **"Oui"**

**Résultat attendu** :
- ✅ Message de succès : "Stock supprimé" 🗑️
- ✅ Le stock **disparaît immédiatement** de la liste
- ✅ Confirmation demandée (pour éviter suppressions accidentelles)
- ✅ Impossible de récupérer après suppression (suppression définitive)

**Vérification technique** :
- F12 → Network → Voir requête DELETE `/api/pharmacies/114/stocks/{id}/` avec status 204
- Le stock n'apparaît plus dans la liste après refresh

---

### TEST F8 : Recherche/Filtrage dans le Dashboard (Optionnel)

**Objectif** : Faciliter la recherche dans une grande liste de stocks

**Actions** :
1. Si une barre de recherche existe dans le dashboard
2. Taper : "para" ou "Paracétamol"
3. Observer le filtrage

**Résultat attendu** :
- ✅ La liste se filtre en temps réel
- ✅ Seuls les stocks correspondants s'affichent
- ✅ Effacer la recherche réaffiche tous les stocks

---

### TEST F9 : Responsive et UX (Optionnel)

**Objectif** : Vérifier que l'interface est utilisable

**Tests** :
- [ ] Interface claire et professionnelle
- [ ] Boutons bien visibles et étiquetés
- [ ] Messages de succès/erreur affichés clairement
- [ ] Formulaires avec validation (champs requis marqués)
- [ ] Loading/spinners pendant les requêtes API
- [ ] Tri de colonnes fonctionnel (si disponible)
- [ ] Pagination si plus de 20 stocks (si disponible)

---

## ✅ Checklist de Validation US 3

### Backend API ✅
- [x] Endpoint GET `/stocks/` fonctionne (lecture publique)
- [ ] Endpoint POST `/stocks/` fonctionne (ajout avec auth)
- [ ] Endpoint PATCH `/stocks/{id}/` fonctionne (modification avec auth)
- [ ] Endpoint DELETE `/stocks/{id}/` fonctionne (suppression avec auth)
- [ ] Endpoint POST `/stocks/{id}/mark_available/` fonctionne
- [ ] Endpoint POST `/stocks/{id}/mark_unavailable/` fonctionne
- [ ] Permissions : Seule la pharmacie propriétaire peut modifier ✅
- [ ] Permissions : Un client ne peut pas modifier ✅

### Frontend Interface ✅
- [ ] Connexion avec compte pharmacie fonctionne
- [ ] Accès au dashboard pharmacie
- [ ] Liste des stocks s'affiche correctement
- [ ] Ajout de stock via formulaire fonctionne
- [ ] Modification de stock fonctionne
- [ ] Toggle disponible/indisponible fonctionne
- [ ] Suppression de stock fonctionne (avec confirmation)
- [ ] Messages de succès/erreur affichés
- [ ] Interface responsive et professionnelle

### Intégration Frontend-Backend ✅
- [ ] Les données du backend s'affichent dans le frontend
- [ ] Les modifications dans le frontend se reflètent dans le backend
- [ ] Les tokens JWT sont correctement envoyés
- [ ] Les erreurs backend sont gérées dans le frontend
- [ ] Pas d'erreurs CORS
- [ ] Pas d'erreurs dans la console navigateur

---

## 🎯 Critères de Réussite

L'US 3 est validée si :

1. **✅ Un administrateur de pharmacie peut :**
   - Se connecter avec un compte type "pharmacy"
   - Accéder à un dashboard dédié
   - Voir la liste de ses stocks
   - Ajouter un nouveau médicament à son stock
   - Modifier la quantité et le prix d'un stock existant
   - Marquer un stock comme disponible ou indisponible
   - Supprimer un stock de son catalogue

2. **✅ Les permissions sont respectées :**
   - Seule la pharmacie propriétaire peut modifier ses stocks
   - Un client ne peut pas accéder aux fonctions d'administration
   - Une pharmacie A ne peut pas modifier les stocks d'une pharmacie B

3. **✅ L'interface est fonctionnelle et intuitive :**
   - Formulaires clairs avec validation
   - Actions immédiates (pas de refresh manuel nécessaire)
   - Messages de confirmation/erreur affichés
   - Design professionnel et utilisable

4. **✅ L'intégration frontend-backend est transparente :**
   - Les données sont synchronisées en temps réel
   - Les requêtes API fonctionnent sans erreur
   - La gestion des tokens JWT est automatique

---

## 📝 Rapport de Test à Compléter

### Tests Backend (via curl)

| Test | Endpoint | Méthode | Statut | Remarques |
|------|----------|---------|--------|-----------|
| Liste stocks | `/api/pharmacies/114/stocks/` | GET | ⏳ À tester | |
| Ajouter stock | `/api/pharmacies/114/stocks/` | POST | ⏳ À tester | |
| Modifier stock | `/api/pharmacies/114/stocks/{id}/` | PATCH | ⏳ À tester | |
| Supprimer stock | `/api/pharmacies/114/stocks/{id}/` | DELETE | ⏳ À tester | |
| Marquer disponible | `/api/pharmacies/114/stocks/{id}/mark_available/` | POST | ⏳ À tester | |
| Marquer indisponible | `/api/pharmacies/114/stocks/{id}/mark_unavailable/` | POST | ⏳ À tester | |
| Permissions client | `/api/pharmacies/114/stocks/` | POST | ⏳ À tester | Doit échouer (403) |
| Permissions autre pharmacie | `/api/pharmacies/115/stocks/` | POST | ⏳ À tester | Doit échouer (403) |

### Tests Frontend (interface web)

| Test | Description | Statut | Remarques |
|------|-------------|--------|-----------|
| Connexion pharmacie | Se connecter avec admin@pharmaciecentrale.cm | ⏳ À tester | |
| Accès dashboard | Voir la page de gestion des stocks | ⏳ À tester | |
| Liste stocks | Affichage de tous les stocks | ⏳ À tester | |
| Ajout stock | Formulaire d'ajout fonctionne | ⏳ À tester | |
| Modification stock | Formulaire de modification fonctionne | ⏳ À tester | |
| Toggle disponibilité | Bouton disponible/indisponible fonctionne | ⏳ À tester | |
| Suppression stock | Bouton supprimer + confirmation fonctionne | ⏳ À tester | |
| Messages UI | Succès/erreurs affichés correctement | ⏳ À tester | |

---

## 🚀 Prochaines Étapes

1. **Tester les endpoints backend** avec les commandes curl fournies
2. **Ouvrir le frontend** sur http://localhost:3000
3. **Se connecter** avec le compte pharmacie créé
4. **Suivre les tests frontend** dans l'ordre
5. **Documenter** les résultats dans le tableau ci-dessus
6. **Corriger** les bugs éventuels
7. **Valider** que l'US 3 est complète

---

**Date de création** : 24 novembre 2025  
**Status** : 📋 Guide de test prêt  
**Compte test** : admin@pharmaciecentrale.cm (Pharmacie ID: 114)  
**Backend** : ✅ Opérationnel  
**Frontend** : ✅ Opérationnel  
**Prêt pour** : Tests d'intégration US 3
