# Intégration Backend - User Stories 3, 4 et 5

## 📋 Contexte
L'équipe front-end a terminé les US 1 à 8. Nous devons maintenant intégrer les US 3, 4 et 5 dans le backend pour compléter l'application.

---

## 🎯 User Stories à Implémenter

### ✅ US 1 & 2 : DÉJÀ IMPLÉMENTÉES
- ✅ Recherche de médicaments (`/api/search/`)
- ✅ Pharmacies à proximité (`/api/nearby/`)
- ✅ Calcul de distance avec PostGIS
- ✅ Filtrage et tri

---

### 🔨 US 3 : Gestion des Stocks (Backend Admin)

**Objectif** : Permettre aux pharmacies de gérer leurs stocks de médicaments

**Composant Frontend** : `StockManager.js`, `AdminDashboard.js`

**Endpoints Requis** :

#### 1. Liste des stocks d'une pharmacie
```http
GET /api/pharmacies/{pharmacy_id}/stocks/
Authorization: Token <user_token>
```

**Response** :
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "medicine": {
        "id": 5,
        "name": "Paracétamol",
        "dosage": "500mg",
        "form": "Comprimé"
      },
      "quantity": 100,
      "price": "2500.00",
      "is_available": true,
      "last_updated": "2025-11-24T10:00:00Z"
    }
  ]
}
```

#### 2. Créer un nouveau stock
```http
POST /api/pharmacies/{pharmacy_id}/stocks/
Authorization: Token <user_token>
Content-Type: application/json

{
  "medicine_id": 5,
  "quantity": 100,
  "price": "2500.00",
  "is_available": true
}
```

#### 3. Modifier un stock existant
```http
PUT /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/
PATCH /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/
Authorization: Token <user_token>

{
  "quantity": 150,
  "price": "2800.00",
  "is_available": true
}
```

#### 4. Supprimer un stock
```http
DELETE /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/
Authorization: Token <user_token>
```

#### 5. Marquer disponible/indisponible
```http
POST /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/mark_available/
POST /api/pharmacies/{pharmacy_id}/stocks/{stock_id}/mark_unavailable/
Authorization: Token <user_token>
```

**Permissions** :
- ✅ Une pharmacie ne peut gérer que SES propres stocks
- ✅ Seuls les utilisateurs `is_staff` ou propriétaires peuvent modifier
- ✅ Les clients ne peuvent que consulter (`GET` public)

**Modèles Requis** :
- ✅ `Stock` - Déjà créé
- ✅ Relation `pharmacy` (ForeignKey)
- ✅ Relation `medicine` (ForeignKey)

---

### 🔑 US 4 : Authentification JWT

**Objectif** : Permettre aux utilisateurs de se connecter et s'inscrire

**Composant Frontend** : `AuthModal.js`, `Header.js`

**Endpoints Requis** :

#### 1. Inscription (Register)
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+237222123456",
  "role": "customer"  // "customer" | "pharmacy"
}
```

**Response** :
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "customer"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Utilisateur créé avec succès"
}
```

#### 2. Connexion (Login)
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** :
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "customer",
    "pharmacy_id": null  // Si role="pharmacy", contient l'ID
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Connexion réussie"
}
```

#### 3. Profil utilisateur
```http
GET /api/auth/profile/
Authorization: Token <user_token>
```

**Response** :
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+237222123456",
  "role": "customer",
  "date_joined": "2025-11-20T10:00:00Z"
}
```

#### 4. Déconnexion (Logout)
```http
POST /api/auth/logout/
Authorization: Token <user_token>
```

**Modèle Utilisateur** :
```python
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=[
        ('customer', 'Client'),
        ('pharmacy', 'Pharmacie'),
        ('admin', 'Administrateur')
    ])
    pharmacy = models.OneToOneField('pharmacies.Pharmacy', null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
```

**Sécurité** :
- ✅ Token JWT avec expiration (24h)
- ✅ Refresh token optionnel
- ✅ Validation email unique
- ✅ Hash des mots de passe (bcrypt/argon2)
- ✅ Throttling des tentatives de connexion

---

### 🛒 US 5 : Panier et Réservation

**Objectif** : Permettre aux clients de réserver des médicaments

**Composants Frontend** : `Cart.js`, `ReservationModal.js`

**Endpoints Requis** :

#### 1. Créer une réservation
```http
POST /api/reservations/
Authorization: Token <user_token>  # Optionnel
Content-Type: application/json

{
  "contact": "user@example.com",  # Si non authentifié
  "items": [
    {
      "pharmacy_id": 1,
      "medicine_id": 5,
      "quantity": 2
    },
    {
      "pharmacy_id": 1,
      "medicine_id": 8,
      "quantity": 1
    }
  ],
  "notes": "Besoin urgent"  # Optionnel
}
```

**Response** :
```json
{
  "id": 123,
  "reservation_number": "RES-2025-001",
  "user": 1,  # Ou null si anonyme
  "contact": "user@example.com",
  "items": [
    {
      "id": 1,
      "pharmacy": {
        "id": 1,
        "name": "Pharmacie Centrale"
      },
      "medicine": {
        "id": 5,
        "name": "Paracétamol 500mg"
      },
      "quantity": 2,
      "unit_price": "2500.00",
      "subtotal": "5000.00"
    }
  ],
  "total_price": "7500.00",
  "status": "pending",  # pending, confirmed, ready, completed, cancelled
  "created_at": "2025-11-24T15:30:00Z",
  "expires_at": "2025-11-25T15:30:00Z"  # Expire après 24h
}
```

#### 2. Liste des réservations de l'utilisateur
```http
GET /api/reservations/
Authorization: Token <user_token>
```

#### 3. Détail d'une réservation
```http
GET /api/reservations/{reservation_id}/
Authorization: Token <user_token>
```

#### 4. Annuler une réservation
```http
POST /api/reservations/{reservation_id}/cancel/
Authorization: Token <user_token>
```

#### 5. Confirmer une réservation (Pharmacie)
```http
POST /api/reservations/{reservation_id}/confirm/
Authorization: Token <pharmacy_token>

{
  "confirmed_items": [
    {
      "reservation_item_id": 1,
      "confirmed_price": "2500.00",
      "available": true
    }
  ],
  "notes": "Votre commande est prête, passez la retirer"
}
```

**Modèles Requis** :

```python
class Reservation(models.Model):
    reservation_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(CustomUser, null=True, blank=True)
    contact = models.CharField(max_length=100)  # Email ou téléphone
    status = models.CharField(choices=[...])
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # created_at + 24h
    
class ReservationItem(models.Model):
    reservation = models.ForeignKey(Reservation, related_name='items')
    pharmacy = models.ForeignKey(Pharmacy)
    medicine = models.ForeignKey(Medicine)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    confirmed_price = models.DecimalField(null=True, blank=True)
    available = models.BooleanField(default=True)
```

**Règles Métier** :
- ✅ Les réservations expirent après 24h
- ✅ Le stock est "pré-réservé" (quantity_reserved dans Stock)
- ✅ La pharmacie peut confirmer/modifier les prix
- ✅ Notifications par email/SMS (optionnel)
- ✅ Historique des réservations

---

## 📦 Plan d'Implémentation

### Phase 1 : US 4 - Authentification (PRIORITÉ)
1. ✅ Créer le modèle `CustomUser` dans `users/models.py`
2. ✅ Créer les serializers (`RegisterSerializer`, `LoginSerializer`, `UserSerializer`)
3. ✅ Créer les vues (`RegisterView`, `LoginView`, `ProfileView`, `LogoutView`)
4. ✅ Configurer JWT (`djangorestframework-simplejwt`)
5. ✅ Créer les URLs `/api/auth/register/`, `/api/auth/login/`, etc.
6. ✅ Tester avec Postman/curl
7. ✅ Ajouter le middleware d'authentification

### Phase 2 : US 3 - Gestion Stocks
1. ✅ Vérifier le modèle `Stock` (déjà créé)
2. ✅ Créer `StockSerializer` avec médicament imbriqué
3. ✅ Créer `StockViewSet` avec permissions
4. ✅ Ajouter les actions `mark_available`, `mark_unavailable`
5. ✅ Configurer les URLs `/api/pharmacies/{id}/stocks/`
6. ✅ Implémenter les permissions (`IsPharmacyOwner`)
7. ✅ Tester CRUD complet

### Phase 3 : US 5 - Panier & Réservation
1. ✅ Créer les modèles `Reservation` et `ReservationItem`
2. ✅ Créer les migrations
3. ✅ Créer les serializers
4. ✅ Créer `ReservationViewSet` avec actions
5. ✅ Ajouter logique d'expiration (24h)
6. ✅ Implémenter la confirmation par pharmacie
7. ✅ Ajouter field `quantity_reserved` à Stock (optionnel)
8. ✅ Tester le flow complet

---

## 🧪 Tests à Effectuer

### US 4 - Authentification
```bash
# Inscription
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Test123!", "role":"customer"}'

# Connexion
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Test123!"}'

# Profil (avec token)
curl -X GET http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### US 3 - Stocks
```bash
# Liste stocks pharmacie
curl -X GET http://127.0.0.1:8000/api/pharmacies/1/stocks/ \
  -H "Authorization: Token YOUR_TOKEN"

# Créer stock
curl -X POST http://127.0.0.1:8000/api/pharmacies/1/stocks/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"medicine_id":5, "quantity":100, "price":"2500.00"}'

# Modifier stock
curl -X PATCH http://127.0.0.1:8000/api/pharmacies/1/stocks/1/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"quantity":150}'
```

### US 5 - Réservations
```bash
# Créer réservation
curl -X POST http://127.0.0.1:8000/api/reservations/ \
  -H "Content-Type: application/json" \
  -d '{"contact":"user@example.com", "items":[{"pharmacy_id":1, "medicine_id":5, "quantity":2}]}'

# Liste réservations
curl -X GET http://127.0.0.1:8000/api/reservations/ \
  -H "Authorization: Token YOUR_TOKEN"
```

---

## 📊 Checklist d'Intégration

### Prérequis
- [ ] Environnement virtuel activé
- [ ] Dependencies installées (`requirements.txt`)
- [ ] Base de données PostgreSQL en cours
- [ ] Migrations appliquées

### US 4 - Authentification
- [ ] Modèle `CustomUser` créé
- [ ] Serializers créés
- [ ] Vues créées
- [ ] URLs configurées
- [ ] JWT configuré
- [ ] Tests passés
- [ ] Documentation Swagger générée

### US 3 - Gestion Stocks
- [ ] Modèle `Stock` vérifié
- [ ] Serializer créé
- [ ] ViewSet créé
- [ ] Permissions implémentées
- [ ] Actions personnalisées (`mark_available`, etc.)
- [ ] URLs configurées
- [ ] Tests passés

### US 5 - Réservations
- [ ] Modèles `Reservation` et `ReservationItem` créés
- [ ] Migrations appliquées
- [ ] Serializers créés
- [ ] ViewSet créé
- [ ] Logique d'expiration implémentée
- [ ] Action `confirm` pour pharmacies
- [ ] Tests passés
- [ ] Intégration front-back testée

---

## 🚀 Commandes Utiles

```bash
# Activer l'environnement
cd /home/mitou/FindPharma
source env/bin/activate

# Backend
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend
cd ../frontend
npm start

# Tests
python manage.py test
```

---

## 📝 Notes

- **US 1 & 2** : Déjà implémentées et fonctionnelles
- **US 6** : Notifications (Email/SMS) - À implémenter après US 5
- **US 7** : Historique et statistiques - Extension de US 3
- **US 8** : Interface admin avancée - Front-end seulement pour l'instant

**Priorité** : US 4 → US 3 → US 5
