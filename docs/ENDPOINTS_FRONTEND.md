# 🚀 ENDPOINTS API - Guide pour le Frontend

## ✅ Endpoints Prêts à Consommer

Voici la liste complète des endpoints que le frontend doit utiliser :

---

## 📍 ENDPOINTS DISPONIBLES

### 1. 🔍 Recherche de Médicaments
**GET** `/api/search/`

**Paramètres** :
- `q` (obligatoire) : Terme de recherche
- `latitude` (optionnel) : Position utilisateur
- `longitude` (optionnel) : Position utilisateur  
- `max_distance` (optionnel) : Distance max en km (défaut: 50)

**Exemple** :
```bash
curl "http://127.0.0.1:8000/api/search/?q=paracetamol"
```

**Avec position** :
```bash
curl "http://127.0.0.1:8000/api/search/?q=paracetamol&latitude=3.8480&longitude=11.5021"
```

---

### 2. 📍 Pharmacies à Proximité
**GET** `/api/nearby/`

**Paramètres** :
- `lat` (obligatoire) : Latitude
- `lon` (obligatoire) : Longitude
- `radius` (optionnel) : Rayon en mètres (défaut: 5000)

**Exemple** :
```bash
curl "http://127.0.0.1:8000/api/nearby/?lat=3.8480&lon=11.5021&radius=5000"
```

---

### 3. 🏥 Liste des Pharmacies
**GET** `/api/pharmacies/`

**Exemple** :
```bash
curl "http://127.0.0.1:8000/api/pharmacies/"
```

---

### 4. 📦 Stocks d'une Pharmacie
**GET** `/api/pharmacies/{id}/stocks/`

**Exemple** :
```bash
curl "http://127.0.0.1:8000/api/pharmacies/1/stocks/"
```

---

### 5. 🔐 Inscription
**POST** `/api/auth/register/`

**Body JSON** :
```json
{
  "username": "jean_client",
  "email": "jean@test.cm",
  "password": "TestPass123!",
  "password2": "TestPass123!",
  "user_type": "customer",
  "phone": "+237600000001"
}
```

**Exemple** :
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@test.cm",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "user_type": "customer",
    "phone": "+237600000001"
  }'
```

---

### 6. 🔑 Connexion
**POST** `/api/auth/login/`

**Body JSON** :
```json
{
  "email": "jean@test.cm",
  "password": "TestPass123!"
}
```

**Exemple** :
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.cm",
    "password": "TestPass123!"
  }'
```

---

### 7. 👤 Profil Utilisateur
**GET** `/api/auth/profile/`

**Headers** : `Authorization: Bearer <token>`

**Exemple** :
```bash
TOKEN="votre_token_access"
curl http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Bearer $TOKEN"
```

---

### 8. 🛒 Panier Actif
**GET** `/api/cart/carts/active/`

**Headers** : `Authorization: Bearer <token>`

**Exemple** :
```bash
curl http://127.0.0.1:8000/api/cart/carts/active/ \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. ➕ Ajouter au Panier
**POST** `/api/cart/carts/add_item/`

**Headers** : `Authorization: Bearer <token>`

**Body JSON** :
```json
{
  "medicine_id": 1,
  "pharmacy_id": 1,
  "quantity": 2
}
```

**Exemple** :
```bash
curl -X POST http://127.0.0.1:8000/api/cart/carts/add_item/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "pharmacy_id": 1,
    "quantity": 2
  }'
```

---

### 10. 📊 Résumé Panier
**GET** `/api/cart/carts/summary/`

**Headers** : `Authorization: Bearer <token>`

**Exemple** :
```bash
curl http://127.0.0.1:8000/api/cart/carts/summary/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ TESTS RAPIDES

### Test 1 : Recherche (sans auth)
```bash
curl "http://127.0.0.1:8000/api/search/?q=paracetamol"
```

### Test 2 : Pharmacies proches (sans auth)
```bash
curl "http://127.0.0.1:8000/api/nearby/?lat=3.8480&lon=11.5021&radius=5000"
```

### Test 3 : Inscription + Token
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "frontend_test",
    "email": "frontend@test.cm",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "user_type": "customer",
    "phone": "+237600000001"
  }' | jq '.tokens.access'
```

### Test 4 : Panier (avec token)
```bash
# Récupérer le token du test 3
TOKEN="[COPIER_ICI_LE_TOKEN]"

# Voir le panier
curl http://127.0.0.1:8000/api/cart/carts/active/ \
  -H "Authorization: Bearer $TOKEN"

# Ajouter un article
curl -X POST http://127.0.0.1:8000/api/cart/carts/add_item/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "pharmacy_id": 1,
    "quantity": 2
  }'
```

---

## 🎯 Configuration Frontend

Dans votre `frontend/src/services/api.js`, utilisez :

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Recherche
export const searchMedication = async (query, userLocation) => {
  const params = new URLSearchParams({ q: query });
  if (userLocation) {
    params.append('latitude', userLocation.latitude);
    params.append('longitude', userLocation.longitude);
  }
  const response = await fetch(`${API_URL}/api/search/?${params}`);
  return response.json();
};

// Pharmacies proches
export const getNearbyPharmacies = async (lat, lon, radius = 5000) => {
  const response = await fetch(
    `${API_URL}/api/nearby/?lat=${lat}&lon=${lon}&radius=${radius}`
  );
  return response.json();
};

// Inscription
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Connexion
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Profil (avec token)
export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/api/auth/profile/`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Panier actif
export const getActiveCart = async (token) => {
  const response = await fetch(`${API_URL}/api/cart/carts/active/`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Ajouter au panier
export const addToCart = async (token, item) => {
  const response = await fetch(`${API_URL}/api/cart/carts/add_item/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  return response.json();
};
```

---

## 🧪 Vérifier dans le Navigateur

1. Ouvrir **http://localhost:3000**
2. Appuyer sur **F12** → Onglet **Network**
3. Faire une action (ex: rechercher "paracétamol")
4. Vérifier :
   - ✅ Requête vers `127.0.0.1:8000/api/search/?q=paracetamol`
   - ✅ Status : **200 OK**
   - ✅ Response contient des données JSON
   - ✅ Pas d'erreur CORS

---

## 📚 Documentation Complète

**Swagger UI** : http://127.0.0.1:8000/api/docs/  
**ReDoc** : http://127.0.0.1:8000/api/redoc/

---

**Créé le** : 24 novembre 2025  
**Backend** : http://127.0.0.1:8000 ✅  
**Frontend** : http://localhost:3000 ✅  
**Status** : Prêt pour consommation API
