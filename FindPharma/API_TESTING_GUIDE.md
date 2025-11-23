# 🧪 Guide Complet de Test de l'API FindPharma

Ce guide vous permet de tester tous les endpoints de l'API FindPharma avec des exemples concrets et des réponses attendues.

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Authentification](#authentification)
3. [Recherche et Localisation](#recherche-et-localisation)
4. [Administration Pharmacie](#administration-pharmacie)
5. [Gestion des Stocks (CRUD)](#gestion-des-stocks-crud)
6. [Tests de Permissions](#tests-de-permissions)
7. [Dépannage](#dépannage)

---

## Configuration Initiale

### Prérequis

1. **Serveur Django en cours d'exécution**
```bash
cd /home/mitou/FindPharma/FindPharma
source /home/mitou/FindPharma/venv_system/bin/activate
python manage.py runserver
```

2. **Utilisateur pharmacie créé**
```bash
python manage.py shell
>>> from users.models import User
>>> from pharmacies.models import Pharmacy
>>> pharmacy = Pharmacy.objects.first()
>>> user = User.objects.create_user(
...     username='pharma1',
...     password='test123',
...     user_type='pharmacy',
...     pharmacy=pharmacy
... )
```

3. **Variables d'environnement**
```bash
export API_URL="http://127.0.0.1:8000"
```

---

## Authentification

### 1. Obtenir un Token

**Endpoint** : `POST /api/token-auth/`

#### Requête curl
```bash
curl -X POST $API_URL/api/token-auth/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pharma1",
    "password": "test123"
  }'
```

#### Réponse attendue
```json
{
  "token": "9e55758872d9cd58869fa9b4adc0327efc2a7e39"
}
```

#### Utilisation du token
```bash
# Sauvegarder le token dans une variable
export TOKEN="9e55758872d9cd58869fa9b4adc0327efc2a7e39"

# Utiliser dans les requêtes
curl -X GET $API_URL/api/my-pharmacy/dashboard/ \
  -H "Authorization: Token $TOKEN"
```

---

## Recherche et Localisation

### 2. Rechercher des Médicaments

**Endpoint** : `GET /api/search/?q={query}`

#### Exemple : Rechercher "Paracétamol"
```bash
curl -X GET "$API_URL/api/search/?q=Paracétamol" | python -m json.tool
```

#### Réponse attendue
```json
{
  "query": "Paracétamol",
  "count": 1,
  "results": [
    {
      "id": 21,
      "name": "Paracétamol",
      "description": "Analgésique et antipyrétique",
      "dosage": "500mg",
      "form": "Comprimé",
      "requires_prescription": false,
      "pharmacies": [
        {
          "id": 18,
          "name": "Pharmacie Bastos",
          "address": "Quartier Bastos, Yaoundé",
          "stock": {
            "quantity": 144,
            "price": "3.43",
            "is_available": true
          }
        }
      ]
    }
  ]
}
```

#### Paramètres de recherche
```bash
# Recherche simple
curl "$API_URL/api/search/?q=Aspirine"

# Recherche avec wildcard
curl "$API_URL/api/search/?q=para"

# Recherche dans les descriptions
curl "$API_URL/api/search/?q=antipaludique"
```

---

### 3. Trouver des Pharmacies à Proximité

**Endpoint** : `GET /api/nearby/?lat={latitude}&lon={longitude}&radius={radius}`

#### Exemple : Yaoundé centre
```bash
curl -X GET "$API_URL/api/nearby/?lat=3.8667&lon=11.5167&radius=2000" \
  | python -m json.tool
```

#### Paramètres
- `lat` : Latitude (obligatoire)
- `lon` : Longitude (obligatoire)
- `radius` : Rayon en mètres (défaut: 5000m = 5km)

#### Réponse attendue
```json
{
  "location": {
    "latitude": 3.8667,
    "longitude": 11.5167,
    "radius_meters": 2000
  },
  "count": 5,
  "pharmacies": [
    {
      "id": 18,
      "name": "Pharmacie Bastos",
      "address": "Quartier Bastos, Yaoundé",
      "phone": "+237 222 567 890",
      "distance": 1234.56,
      "is_active": true,
      "opening_hours": {
        "lundi-vendredi": "08:00-20:00"
      }
    }
  ]
}
```

---

## Administration Pharmacie

⚠️ **Tous les endpoints suivants nécessitent un token d'authentification**

### 4. Dashboard de la Pharmacie

**Endpoint** : `GET /api/my-pharmacy/dashboard/`

#### Requête
```bash
curl -X GET $API_URL/api/my-pharmacy/dashboard/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Réponse attendue
```json
{
  "id": 18,
  "name": "Pharmacie Bastos",
  "address": "Quartier Bastos, Yaoundé",
  "phone": "+237 222 567 890",
  "email": "bastos@pharmacy.cm",
  "latitude": 3.8757,
  "longitude": 11.4984,
  "opening_hours": {
    "lundi-vendredi": "08:00-20:00",
    "samedi": "09:00-19:00",
    "dimanche": "10:00-16:00"
  },
  "is_active": true,
  "total_stocks": 15,
  "total_medicines": 15,
  "available_medicines": 15,
  "unavailable_medicines": 0,
  "total_quantity": 1448,
  "estimated_value": "11717.88"
}
```

#### Métriques fournies
- `total_stocks` : Nombre total de stocks
- `total_medicines` : Nombre de médicaments différents
- `available_medicines` : Médicaments disponibles
- `unavailable_medicines` : Médicaments en rupture
- `total_quantity` : Quantité totale en unités
- `estimated_value` : Valeur totale du stock (FCFA)

---

### 5. Profil de la Pharmacie

**Endpoint** : `GET /api/my-pharmacy/profile/`

#### Voir le profil
```bash
curl -X GET $API_URL/api/my-pharmacy/profile/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Modifier le profil (PUT)
```bash
curl -X PUT $API_URL/api/my-pharmacy/profile/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacie Bastos Plus",
    "address": "Nouvelle adresse Bastos",
    "phone": "+237 222 567 999",
    "email": "bastos.plus@pharmacy.cm",
    "opening_hours": {
      "lundi-vendredi": "07:00-21:00",
      "samedi": "08:00-20:00"
    },
    "is_active": true
  }' | python -m json.tool
```

#### Modification partielle (PATCH)
```bash
curl -X PATCH $API_URL/api/my-pharmacy/profile/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+237 222 567 999",
    "email": "new.email@pharmacy.cm"
  }' | python -m json.tool
```

---

### 6. Statistiques Détaillées de Stock

**Endpoint** : `GET /api/my-pharmacy/stock-stats/`

#### Requête
```bash
curl -X GET $API_URL/api/my-pharmacy/stock-stats/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Réponse attendue
```json
{
  "global_stats": {
    "total_stocks": 15,
    "total_quantity": 1448,
    "avg_price": 7.17,
    "total_value": 11717.88,
    "available_count": 15,
    "out_of_stock_count": 0
  },
  "low_stock_items": [
    {
      "medicine__name": "Métoclopramide",
      "quantity": 14,
      "price": 2.77
    }
  ],
  "top_stocks": [
    {
      "medicine__name": "Cétirizine",
      "quantity": 148,
      "price": 3.74
    }
  ],
  "out_of_stock": []
}
```

#### Catégories de statistiques
- `global_stats` : Vue d'ensemble du stock
- `low_stock_items` : Articles avec moins de 10 unités
- `top_stocks` : Top 10 des stocks les plus fournis
- `out_of_stock` : Articles en rupture de stock

---

### 7. Historique des Modifications

**Endpoint** : `GET /api/my-pharmacy/stock-history/`

#### Requête
```bash
curl -X GET $API_URL/api/my-pharmacy/stock-history/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Réponse attendue
```json
{
  "count": 15,
  "results": [
    {
      "id": 235,
      "medicine": {
        "id": 38,
        "name": "Métoclopramide",
        "dosage": "10mg",
        "form": "Comprimé",
        "requires_prescription": false
      },
      "quantity": 14,
      "price": "2.77",
      "is_available": true,
      "last_updated": "2025-11-23T10:51:25.926000Z"
    }
  ]
}
```

---

## Gestion des Stocks (CRUD)

### 8. Lister les Stocks

**Endpoint** : `GET /api/pharmacies/{pharmacy_id}/stocks/`

#### Requête
```bash
# Récupérer l'ID de votre pharmacie depuis le dashboard
PHARMACY_ID=18

curl -X GET $API_URL/api/pharmacies/$PHARMACY_ID/stocks/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Pagination
```bash
# Page 1 (défaut)
curl "$API_URL/api/pharmacies/$PHARMACY_ID/stocks/"

# Page 2
curl "$API_URL/api/pharmacies/$PHARMACY_ID/stocks/?page=2"

# Modifier la taille de page
curl "$API_URL/api/pharmacies/$PHARMACY_ID/stocks/?page_size=20"
```

---

### 9. Créer un Nouveau Stock

**Endpoint** : `POST /api/pharmacies/{pharmacy_id}/stocks/`

#### Requête
```bash
curl -X POST $API_URL/api/pharmacies/$PHARMACY_ID/stocks/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine": 25,
    "quantity": 100,
    "price": 5.50,
    "is_available": true
  }' | python -m json.tool
```

#### Validation
- `medicine` : ID du médicament (obligatoire)
- `quantity` : >= 0 (obligatoire)
- `price` : > 0 (obligatoire)
- `is_available` : true/false (optionnel, défaut: true)

#### Réponse succès
```json
{
  "id": 236,
  "medicine": {
    "id": 25,
    "name": "Amoxicilline",
    "dosage": "500mg",
    "form": "Gélule"
  },
  "quantity": 100,
  "price": "5.50",
  "is_available": true,
  "last_updated": "2025-11-23T14:30:00.000000Z"
}
```

#### Erreur : Doublon
```json
{
  "detail": "Ce médicament existe déjà dans votre stock. Utilisez PUT pour le modifier.",
  "stock_id": 224
}
```

---

### 10. Voir les Détails d'un Stock

**Endpoint** : `GET /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/`

#### Requête
```bash
STOCK_ID=224

curl -X GET $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Réponse attendue
```json
{
  "id": 224,
  "medicine": {
    "id": 27,
    "name": "Aspirine",
    "dosage": "500mg",
    "form": "Comprimé",
    "requires_prescription": false
  },
  "quantity": 100,
  "price": "3.00",
  "is_available": true,
  "last_updated": "2025-11-23T12:24:09.595300Z"
}
```

---

### 11. Modifier un Stock (PUT)

**Endpoint** : `PUT /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/`

#### Requête : Modification complète
```bash
curl -X PUT $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine": 27,
    "quantity": 150,
    "price": 3.50,
    "is_available": true
  }' | python -m json.tool
```

⚠️ **Note** : PUT nécessite TOUS les champs

---

### 12. Modifier Partiellement un Stock (PATCH)

**Endpoint** : `PATCH /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/`

#### Requête : Modification partielle
```bash
curl -X PATCH $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 200,
    "price": 4.00
  }' | python -m json.tool
```

#### Exemples de modifications
```bash
# Changer uniquement la quantité
curl -X PATCH $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'

# Changer uniquement le prix
curl -X PATCH $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 2.99}'

# Changer la disponibilité
curl -X PATCH $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_available": false}'
```

---

### 13. Marquer Indisponible

**Endpoint** : `POST /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/mark_unavailable/`

#### Requête
```bash
curl -X POST $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/mark_unavailable/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Réponse
```json
{
  "id": 224,
  "is_available": false,
  "last_updated": "2025-11-23T14:35:00.000000Z"
}
```

---

### 14. Marquer Disponible

**Endpoint** : `POST /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/mark_available/`

#### Requête
```bash
curl -X POST $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/mark_available/ \
  -H "Authorization: Token $TOKEN" \
  | python -m json.tool
```

#### Réponse
```json
{
  "id": 224,
  "is_available": true,
  "last_updated": "2025-11-23T14:36:00.000000Z"
}
```

---

### 15. Supprimer un Stock

**Endpoint** : `DELETE /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/`

#### Requête
```bash
curl -X DELETE $API_URL/api/pharmacies/$PHARMACY_ID/stocks/$STOCK_ID/ \
  -H "Authorization: Token $TOKEN" \
  -v
```

#### Réponse succès
```
HTTP/1.1 204 No Content
```

⚠️ **Attention** : Cette action est irréversible !

---

## Tests de Permissions

### Test 1 : Accès Sans Token

#### Requête
```bash
curl -X GET $API_URL/api/my-pharmacy/dashboard/
```

#### Réponse attendue
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Code HTTP** : 401 Unauthorized

---

### Test 2 : Token Invalide

#### Requête
```bash
curl -X GET $API_URL/api/my-pharmacy/dashboard/ \
  -H "Authorization: Token invalid_token_here"
```

#### Réponse attendue
```json
{
  "detail": "Invalid token."
}
```

**Code HTTP** : 401 Unauthorized

---

### Test 3 : Accès à une Autre Pharmacie

#### Requête
```bash
# Essayer d'accéder aux stocks d'une autre pharmacie
OTHER_PHARMACY_ID=19

curl -X GET $API_URL/api/pharmacies/$OTHER_PHARMACY_ID/stocks/ \
  -H "Authorization: Token $TOKEN"
```

#### Réponse attendue
```json
{
  "detail": "Vous n'avez pas la permission d'effectuer cette action."
}
```

**Code HTTP** : 403 Forbidden

---

## Dépannage

### Problème : Serveur non accessible

```bash
# Vérifier si le serveur est en cours d'exécution
lsof -ti:8000

# Si aucun processus, démarrer le serveur
cd /home/mitou/FindPharma/FindPharma
python manage.py runserver
```

---

### Problème : Token expiré

```bash
# Obtenir un nouveau token
curl -X POST $API_URL/api/token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username": "pharma1", "password": "test123"}'

# Mettre à jour la variable
export TOKEN="nouveau_token_ici"
```

---

### Problème : Erreur 404 Not Found

**Cause probable** : URL incorrecte

```bash
# Vérifier l'URL de base
echo $API_URL

# Tester la racine de l'API
curl $API_URL/api/

# Vérifier les URLs disponibles
curl $API_URL/api/docs/
```

---

### Problème : Erreur 500 Internal Server Error

**Actions** :
1. Vérifier les logs du serveur Django
2. Vérifier la base de données PostgreSQL
3. Vérifier l'environnement virtuel

```bash
# Voir les logs en temps réel
tail -f /tmp/django_server.log

# Tester la connexion à la base
python manage.py dbshell
```

---

## Scripts de Test Automatisés

### Script de Test Complet

```bash
#!/bin/bash

API_URL="http://127.0.0.1:8000"

echo "=== Test 1: Authentification ==="
TOKEN_RESPONSE=$(curl -s -X POST $API_URL/api/token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username": "pharma1", "password": "test123"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Échec de l'authentification"
    exit 1
fi

echo "✅ Token obtenu: $TOKEN"

echo ""
echo "=== Test 2: Dashboard ==="
curl -s -X GET $API_URL/api/my-pharmacy/dashboard/ \
  -H "Authorization: Token $TOKEN" | python -m json.tool

echo ""
echo "=== Test 3: Statistiques ==="
curl -s -X GET $API_URL/api/my-pharmacy/stock-stats/ \
  -H "Authorization: Token $TOKEN" | python -m json.tool

echo ""
echo "=== Test 4: Liste des stocks ==="
curl -s -X GET $API_URL/api/pharmacies/18/stocks/ \
  -H "Authorization: Token $TOKEN" | python -m json.tool | head -50

echo ""
echo "✅ Tous les tests terminés"
```

### Sauvegarder le script
```bash
cat > /home/mitou/FindPharma/test_api_complete.sh << 'EOF'
# Coller le script ci-dessus
EOF

chmod +x /home/mitou/FindPharma/test_api_complete.sh
./test_api_complete.sh
```

---

## Documentation Interactive

### Swagger UI

Accédez à la documentation interactive : http://127.0.0.1:8000/api/docs/

**Fonctionnalités** :
- 📝 Liste de tous les endpoints
- 🔐 Bouton "Authorize" pour ajouter le token
- 🧪 Tester directement depuis le navigateur
- 📊 Voir les modèles de données
- ✅ Validation en temps réel

### ReDoc

Documentation alternative : http://127.0.0.1:8000/api/redoc/

**Avantages** :
- 📖 Interface plus lisible
- 📑 Navigation par sections
- 🔍 Recherche intégrée
- 📥 Export en PDF

---

## Bonnes Pratiques

### 1. Toujours utiliser HTTPS en production
```bash
# Au lieu de http://
https://api.findpharma.cm/api/...
```

### 2. Stocker le token en sécurité
```bash
# Éviter
echo $TOKEN

# Préférer
export TOKEN=$(cat ~/.findpharma_token)
```

### 3. Gérer les erreurs
```bash
response=$(curl -s -w "\n%{http_code}" $API_URL/api/...)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "Succès"
else
    echo "Erreur $http_code: $body"
fi
```

### 4. Utiliser jq pour le parsing JSON
```bash
# Installer jq
sudo apt-get install jq

# Extraire des valeurs
curl -s $API_URL/api/my-pharmacy/dashboard/ \
  -H "Authorization: Token $TOKEN" \
  | jq '.total_stocks'
```

---

**Guide créé le** : 23 novembre 2025  
**Version de l'API** : 1.0.0  
**Auteur** : Max-kleb
