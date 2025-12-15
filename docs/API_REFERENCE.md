# 📡 API Reference - FindPharma

Documentation complète de l'API REST FindPharma.

---

## 📋 Table des Matières

1. [Informations Générales](#1-informations-générales)
2. [Authentification](#2-authentification)
3. [Pharmacies](#3-pharmacies)
4. [Médicaments](#4-médicaments)
5. [Stocks](#5-stocks)
6. [Panier](#6-panier)
7. [Réservations](#7-réservations)
8. [Utilisateurs](#8-utilisateurs)
9. [Administration](#9-administration)
10. [Codes d'Erreur](#10-codes-derreur)

---

## 1. Informations Générales

### Base URL

| Environnement | URL |
|---------------|-----|
| Développement | `http://localhost:8000/api` |
| Production | `https://api.findpharma.cm/api` |

### Documentation Interactive

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |
| `/api/schema/` | Schéma OpenAPI (JSON) |

### Format des Réponses

Toutes les réponses sont au format JSON.

```json
// Succès (200, 201)
{
  "id": 1,
  "name": "...",
  "...": "..."
}

// Liste paginée
{
  "count": 100,
  "next": "http://localhost:8000/api/resource/?page=2",
  "previous": null,
  "results": [...]
}

// Erreur
{
  "detail": "Message d'erreur",
  "code": "error_code"
}
```

### Headers Requis

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  # Pour les endpoints protégés
```

---

## 2. Authentification

### 2.1 Inscription

```http
POST /api/auth/register/
```

**Corps de la requête :**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "motdepasse123",
  "password_confirm": "motdepasse123",
  "user_type": "customer",
  "phone": "+237 690 123 456"
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `username` | string | ✅ | Nom d'utilisateur unique |
| `email` | string | ✅ | Email unique |
| `password` | string | ✅ | Mot de passe (min 8 caractères) |
| `password_confirm` | string | ✅ | Confirmation du mot de passe |
| `user_type` | string | ❌ | `customer` (défaut), `pharmacy` |
| `phone` | string | ❌ | Numéro de téléphone |

**Réponse (201 Created) :**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "user_type": "customer",
  "message": "Inscription réussie. Un code de vérification a été envoyé."
}
```

---

### 2.2 Connexion

```http
POST /api/auth/login/
```

**Corps de la requête :**
```json
{
  "username": "johndoe",
  "password": "motdepasse123"
}
```

**Réponse (200 OK) :**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "user_type": "customer",
    "pharmacy": null
  }
}
```

---

### 2.3 Rafraîchir le Token

```http
POST /api/auth/token/refresh/
```

**Corps de la requête :**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Réponse (200 OK) :**
```json
{
  "access": "nouveau_access_token..."
}
```

---

### 2.4 Vérification Email

#### Envoyer le code
```http
POST /api/auth/send-verification-code/
```

```json
{
  "email": "john@example.com",
  "username": "johndoe"
}
```

#### Vérifier le code
```http
POST /api/auth/verify-code/
```

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

---

### 2.5 Profil Utilisateur

#### Obtenir le profil
```http
GET /api/auth/profile/
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "user_type": "customer",
  "phone": "+237 690 123 456",
  "pharmacy": null,
  "date_joined": "2025-12-01T10:00:00Z"
}
```

#### Modifier le profil
```http
PUT /api/auth/profile/update/
Authorization: Bearer <token>
```

```json
{
  "email": "newemail@example.com",
  "phone": "+237 691 234 567"
}
```

---

## 3. Pharmacies

### 3.1 Liste des Pharmacies

```http
GET /api/pharmacies/
```

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | int | Numéro de page |
| `page_size` | int | Éléments par page (max 100) |
| `is_active` | bool | Filtrer par statut actif |

**Réponse :**
```json
{
  "count": 50,
  "next": "/api/pharmacies/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Pharmacie du Centre",
      "address": "Avenue Kennedy, Yaoundé",
      "phone": "+237 222 123 456",
      "email": "contact@pharmacie-centre.cm",
      "latitude": "3.85230000",
      "longitude": "11.50670000",
      "opening_hours": {
        "monday": "08:00-20:00",
        "tuesday": "08:00-20:00",
        "...": "..."
      },
      "is_active": true,
      "average_rating": 4.5,
      "reviews_count": 23,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 3.2 Détails d'une Pharmacie

```http
GET /api/pharmacies/{id}/
```

---

### 3.3 Pharmacies Proches

```http
GET /api/nearby/
```

**Paramètres de requête (obligatoires) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `latitude` | float | Latitude de l'utilisateur |
| `longitude` | float | Longitude de l'utilisateur |
| `radius` | int | Rayon en kilomètres (1-50) |

**Exemple :**
```http
GET /api/nearby/?latitude=3.848&longitude=11.502&radius=5
```

**Réponse :**
```json
{
  "count": 8,
  "user_location": {
    "latitude": 3.848,
    "longitude": 11.502
  },
  "radius_km": 5,
  "results": [
    {
      "id": 1,
      "name": "Pharmacie du Centre",
      "address": "Avenue Kennedy",
      "distance": 0.8,
      "distance_unit": "km",
      "latitude": "3.85230000",
      "longitude": "11.50670000",
      "is_open": true
    }
  ]
}
```

---

### 3.4 Recherche de Médicaments

```http
GET /api/search/
```

**Paramètres de requête :**

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `q` | string | ✅ | Terme de recherche |
| `latitude` | float | ❌ | Pour tri par distance |
| `longitude` | float | ❌ | Pour tri par distance |
| `radius` | int | ❌ | Rayon en km |
| `min_price` | float | ❌ | Prix minimum |
| `max_price` | float | ❌ | Prix maximum |
| `available_only` | bool | ❌ | Seulement les disponibles |

**Exemple :**
```http
GET /api/search/?q=paracetamol&latitude=3.848&longitude=11.502&radius=10
```

**Réponse :**
```json
{
  "count": 15,
  "query": "paracetamol",
  "results": [
    {
      "pharmacy": {
        "id": 1,
        "name": "Pharmacie du Centre",
        "address": "Avenue Kennedy",
        "distance": 0.8
      },
      "medicine": {
        "id": 42,
        "name": "Paracétamol 500mg",
        "dosage": "500mg",
        "form": "Comprimé",
        "category": "analgesique",
        "requires_prescription": false
      },
      "stock": {
        "id": 123,
        "price": 1500,
        "quantity": 150,
        "is_available": true
      }
    }
  ]
}
```

---

### 3.5 Avis sur une Pharmacie

#### Liste des avis
```http
GET /api/pharmacies/{id}/reviews/
```

**Réponse :**
```json
{
  "count": 23,
  "average_rating": 4.5,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "username": "marie_k"
      },
      "rating": 5,
      "comment": "Excellent service, personnel très accueillant.",
      "created_at": "2025-12-10T14:30:00Z"
    }
  ]
}
```

#### Créer un avis
```http
POST /api/pharmacies/{id}/reviews/create/
Authorization: Bearer <token>
```

```json
{
  "rating": 5,
  "comment": "Très satisfait du service."
}
```

---

## 4. Médicaments

### 4.1 Liste des Médicaments

```http
GET /api/medicines/
```

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | int | Numéro de page |
| `category` | string | Filtrer par catégorie |
| `requires_prescription` | bool | Filtrer par ordonnance requise |
| `search` | string | Recherche textuelle |

---

### 4.2 Détails d'un Médicament

```http
GET /api/medicines/{id}/
```

**Réponse :**
```json
{
  "id": 42,
  "name": "Paracétamol",
  "description": "Analgésique et antipyrétique utilisé pour soulager la douleur et la fièvre.",
  "dosage": "500mg",
  "form": "Comprimé",
  "average_price": 1500.00,
  "requires_prescription": false,
  "category": "analgesique",
  "category_display": "Analgésique",
  "indications": "Douleurs légères à modérées, fièvre",
  "contraindications": "Insuffisance hépatique sévère",
  "posology": "1 à 2 comprimés toutes les 4 à 6 heures",
  "side_effects": "Rares réactions allergiques",
  "image_url": "https://...",
  "wikipedia_url": "https://fr.wikipedia.org/wiki/Parac%C3%A9tamol",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 4.3 Autocomplétion

```http
GET /api/medicines/autocomplete/?q=para
```

**Réponse :**
```json
{
  "suggestions": [
    {"id": 42, "name": "Paracétamol 500mg", "category": "Analgésique"},
    {"id": 43, "name": "Paracétamol 1000mg", "category": "Analgésique"},
    {"id": 78, "name": "Paracétamol Codéine", "category": "Analgésique"}
  ]
}
```

---

### 4.4 Catégories

```http
GET /api/medicines/categories/
```

**Réponse :**
```json
{
  "categories": [
    {"code": "analgesique", "name": "Analgésique", "count": 15},
    {"code": "antibiotique", "name": "Antibiotique", "count": 28},
    {"code": "antipaludeen", "name": "Antipaludéen", "count": 12},
    "..."
  ]
}
```

---

### 4.5 Médicaments par Catégorie

```http
GET /api/medicines/by_category/?category=antibiotique
```

---

### 4.6 Informations Wikipedia

```http
GET /api/medicines/{id}/wikipedia_info/
```

**Réponse :**
```json
{
  "title": "Paracétamol",
  "extract": "Le paracétamol, aussi appelé acétaminophène, est un composé chimique...",
  "url": "https://fr.wikipedia.org/wiki/Parac%C3%A9tamol",
  "thumbnail": "https://upload.wikimedia.org/..."
}
```

---

## 5. Stocks

### 5.1 Liste des Stocks d'une Pharmacie

```http
GET /api/pharmacies/{pharmacy_id}/stocks/
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "count": 150,
  "results": [
    {
      "id": 1,
      "medicine": {
        "id": 42,
        "name": "Paracétamol 500mg",
        "dosage": "500mg",
        "form": "Comprimé"
      },
      "quantity": 150,
      "price": 1500.00,
      "is_available": true,
      "last_updated": "2025-12-15T10:00:00Z"
    }
  ]
}
```

---

### 5.2 Ajouter un Stock

```http
POST /api/pharmacies/{pharmacy_id}/stocks/
Authorization: Bearer <token>
```

```json
{
  "medicine_id": 42,
  "quantity": 100,
  "price": 1500.00
}
```

---

### 5.3 Modifier un Stock

```http
PUT /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/
Authorization: Bearer <token>
```

```json
{
  "quantity": 200,
  "price": 1400.00
}
```

---

### 5.4 Supprimer un Stock

```http
DELETE /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/
Authorization: Bearer <token>
```

---

### 5.5 Marquer comme Indisponible

```http
POST /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/mark_unavailable/
Authorization: Bearer <token>
```

---

## 6. Panier

### 6.1 Obtenir le Panier Actif

```http
GET /api/cart/carts/active/
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "id": 1,
  "status": "active",
  "items": [
    {
      "id": 1,
      "medicine": {
        "id": 42,
        "name": "Paracétamol 500mg"
      },
      "pharmacy": {
        "id": 1,
        "name": "Pharmacie du Centre"
      },
      "quantity": 2,
      "unit_price": 1500.00,
      "subtotal": 3000.00
    }
  ],
  "total_items": 2,
  "total_price": 3000.00,
  "created_at": "2025-12-15T10:00:00Z"
}
```

---

### 6.2 Ajouter un Article

```http
POST /api/cart/carts/add_item/
Authorization: Bearer <token>
```

```json
{
  "medicine_id": 42,
  "pharmacy_id": 1,
  "quantity": 2
}
```

---

### 6.3 Modifier la Quantité

```http
PATCH /api/cart/items/{item_id}/
Authorization: Bearer <token>
```

```json
{
  "quantity": 3
}
```

---

### 6.4 Supprimer un Article

```http
DELETE /api/cart/items/{item_id}/
Authorization: Bearer <token>
```

---

## 7. Réservations

### 7.1 Créer une Réservation

```http
POST /api/reservations/
Authorization: Bearer <token>
```

**Corps de la requête :**
```json
{
  "pharmacy_id": 1,
  "items": [
    {"medicine_id": 42, "quantity": 2},
    {"medicine_id": 15, "quantity": 1}
  ],
  "contact_name": "Jean Dupont",
  "contact_phone": "+237 690 123 456",
  "contact_email": "jean@email.com",
  "pickup_date": "2025-12-20",
  "notes": "Je passerai le matin"
}
```

**Réponse (201 Created) :**
```json
{
  "id": 123,
  "reservation_number": "RES-20251215-ABC123",
  "status": "pending",
  "pharmacy": {
    "id": 1,
    "name": "Pharmacie du Centre",
    "address": "Avenue Kennedy"
  },
  "items": [
    {
      "medicine": {"id": 42, "name": "Paracétamol 500mg"},
      "quantity": 2,
      "unit_price": 1500.00
    }
  ],
  "total_items": 3,
  "total_price": 5500.00,
  "contact_name": "Jean Dupont",
  "pickup_date": "2025-12-20",
  "expires_at": "2025-12-20T23:59:59Z",
  "created_at": "2025-12-15T10:00:00Z"
}
```

---

### 7.2 Liste des Réservations

```http
GET /api/reservations/
Authorization: Bearer <token>
```

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `status` | string | Filtrer par statut |
| `page` | int | Numéro de page |

**Statuts possibles :**
- `pending` - En attente
- `confirmed` - Confirmée
- `ready` - Prête
- `collected` - Récupérée
- `cancelled` - Annulée
- `expired` - Expirée

---

### 7.3 Détails d'une Réservation

```http
GET /api/reservations/{id}/
Authorization: Bearer <token>
```

---

### 7.4 Annuler une Réservation

```http
POST /api/reservations/{id}/cancel/
Authorization: Bearer <token>
```

```json
{
  "reason": "Je ne peux plus me déplacer."
}
```

---

### 7.5 Réservations de la Pharmacie

```http
GET /api/reservations/pharmacy/
Authorization: Bearer <token>
```

*Réservé aux utilisateurs de type `pharmacy`.*

---

### 7.6 Mettre à Jour le Statut (Pharmacie)

```http
POST /api/reservations/{id}/update_status/
Authorization: Bearer <token>
```

```json
{
  "status": "confirmed",
  "pharmacy_notes": "La commande sera prête demain à 10h."
}
```

---

## 8. Utilisateurs

### 8.1 Changer le Mot de Passe

```http
POST /api/auth/password/change/
Authorization: Bearer <token>
```

```json
{
  "old_password": "ancienMotDePasse",
  "new_password": "nouveauMotDePasse123",
  "new_password_confirm": "nouveauMotDePasse123"
}
```

---

## 9. Administration

### 9.1 Statistiques Globales

```http
GET /api/admin/stats/
Authorization: Bearer <token>
```

*Réservé aux administrateurs.*

**Réponse :**
```json
{
  "users": {
    "total": 1250,
    "customers": 1180,
    "pharmacies": 68,
    "admins": 2,
    "new_this_month": 85
  },
  "pharmacies": {
    "total": 50,
    "active": 48,
    "average_rating": 4.2
  },
  "medicines": {
    "total": 200,
    "by_category": {
      "antibiotique": 28,
      "analgesique": 15,
      "...": "..."
    }
  },
  "reservations": {
    "total": 3500,
    "pending": 45,
    "confirmed": 120,
    "collected": 3200,
    "cancelled": 135,
    "this_month": 280
  },
  "stocks": {
    "total_entries": 1000,
    "low_stock_alerts": 25
  }
}
```

---

### 9.2 Activité Récente

```http
GET /api/admin/activity/
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "activities": [
    {
      "type": "new_user",
      "message": "Nouvel utilisateur: marie_k",
      "timestamp": "2025-12-15T10:30:00Z"
    },
    {
      "type": "new_reservation",
      "message": "Nouvelle réservation #RES-20251215-XYZ",
      "timestamp": "2025-12-15T10:25:00Z"
    }
  ]
}
```

---

### 9.3 Gestion des Utilisateurs (Admin)

#### Liste des utilisateurs
```http
GET /api/auth/admin/users/
Authorization: Bearer <token>
```

#### Créer un utilisateur
```http
POST /api/auth/admin/users/create/
Authorization: Bearer <token>
```

```json
{
  "username": "nouveau_user",
  "email": "user@example.com",
  "password": "password123",
  "user_type": "pharmacy",
  "pharmacy_id": 5
}
```

#### Modifier un utilisateur
```http
PUT /api/auth/admin/users/{id}/update/
Authorization: Bearer <token>
```

#### Supprimer un utilisateur
```http
DELETE /api/auth/admin/users/{id}/delete/
Authorization: Bearer <token>
```

---

## 10. Codes d'Erreur

### Codes HTTP

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `204` | Supprimé avec succès |
| `400` | Requête invalide |
| `401` | Non authentifié |
| `403` | Accès interdit |
| `404` | Ressource non trouvée |
| `422` | Données invalides |
| `429` | Trop de requêtes |
| `500` | Erreur serveur |

### Messages d'Erreur Courants

```json
// Authentification requise
{
  "detail": "Authentication credentials were not provided.",
  "code": "not_authenticated"
}

// Token expiré
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}

// Permission refusée
{
  "detail": "You do not have permission to perform this action.",
  "code": "permission_denied"
}

// Ressource non trouvée
{
  "detail": "Not found.",
  "code": "not_found"
}

// Validation des données
{
  "email": ["Enter a valid email address."],
  "password": ["This field may not be blank."]
}
```

---

## 📝 Notes

- Toutes les dates sont au format **ISO 8601** (UTC)
- Les prix sont en **FCFA** (Franc CFA)
- Les distances sont en **kilomètres**
- La pagination par défaut est de **20 éléments** par page

---

**Dernière mise à jour : 15 décembre 2025**
