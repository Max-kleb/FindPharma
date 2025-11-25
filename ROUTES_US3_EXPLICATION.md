# 🗺️ Routes et Navigation - Interface US 3 (Gestion des Stocks)

## 📍 Comment Accéder à l'Interface de Gestion des Stocks

L'application **FindPharma** utilise un **système de vues conditionnelles** au lieu de routes URL traditionnelles (comme `/stocks` ou `/admin`).

---

## 🎯 Méthode d'Accès : Bouton de Bascule

### Vue Utilisateur → Vue Administration

L'accès au **StockManager (US 3)** se fait via un **bouton de bascule** dans l'interface :

```javascript
// Ligne 202-207 dans App.js
{isLoggedIn && isAdmin && (
    <button onClick={toggleView} className="toggle-view-button">
        {currentView === 'user' 
            ? 'Aller à la Gestion (US3/US8)' 
            : 'Retour à la Recherche'}
    </button>
)}
```

### Libellé du Bouton

- **Mode Utilisateur** : Bouton affiche **"Aller à la Gestion (US3/US8)"**
- **Mode Admin** : Bouton affiche **"Retour à la Recherche"**

---

## 🔐 Conditions d'Accès

Pour que le bouton soit visible et fonctionnel, l'utilisateur doit :

### 1. Être Connecté
```javascript
isLoggedIn = !!userToken
```
**État** : `userToken` doit exister (ligne 48)

### 2. Être Administrateur
```javascript
isAdmin = isLoggedIn && userToken.includes('admin')
```
**État** : Le token doit contenir le mot "admin" (ligne 50)

### ⚠️ Problème Actuel

Le code vérifie `isAdmin` mais pour l'US 3 (pharmacie), on devrait vérifier `user_type === 'pharmacy'`.

**Code actuel** (ligne 202) :
```javascript
{isLoggedIn && isAdmin && (
```

**Devrait être** :
```javascript
{isLoggedIn && (userData?.user_type === 'pharmacy' || isAdmin) && (
```

---

## 🏗️ Architecture des Vues

### Vue 1 : Mode Utilisateur (`currentView === 'user'`)

**Contenu affiché** :
- SearchSection (recherche de médicaments)
- ResultsDisplay (carte + liste des pharmacies)
- Cart (panier)
- Boutons : Ajouter au panier, Réserver, Noter

**Fichier** : App.js lignes 141-183

### Vue 2 : Mode Administration (`currentView === 'admin'`)

**Contenu affiché** :
- **StockManager** ← 📦 **US 3 - Interface de gestion des stocks**
- AdminDashboard (statistiques)

**Fichier** : App.js lignes 131-138

```javascript
if (currentView === 'admin' && isAdmin) {
    return (
        <main className="main-content admin-mode">
            <StockManager />
            <AdminDashboard /> 
        </main>
    );
}
```

---

## 🚀 Comment Tester l'Interface US 3

### Méthode 1 : Simuler un Admin (Actuel)

#### Étape 1 : Ouvrir l'application
```
http://localhost:3000
```

#### Étape 2 : Configurer localStorage (F12 → Console)
```javascript
// Token contenant "admin" pour passer le test isAdmin
localStorage.setItem('token', 'mock_jwt_token_admin_12345');

// Données utilisateur pharmacie
localStorage.setItem('user', JSON.stringify({
  id: 4,
  username: "admin_centrale",
  email: "admin@pharmaciecentrale.cm",
  user_type: "pharmacy",
  pharmacy: 114,
  pharmacy_name: "Pharmacie Centrale de Yaoundé"
}));

// Recharger
location.reload();
```

#### Étape 3 : Cliquer sur le bouton
Cherchez le bouton **"Aller à la Gestion (US3/US8)"** en haut de la page

#### Étape 4 : Vous êtes dans StockManager !
L'interface de gestion des stocks s'affiche avec le tableau complet.

---

### Méthode 2 : Modifier la Condition (Recommandé)

Pour que TOUTES les pharmacies (pas seulement admin) puissent accéder :

#### Modification dans `/home/mitou/FindPharma/frontend/src/App.js`

**Ligne 202**, remplacer :
```javascript
{isLoggedIn && isAdmin && (
```

Par :
```javascript
{isLoggedIn && (
```

Ou mieux, vérifier le type d'utilisateur :
```javascript
{isLoggedIn && (() => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.user_type === 'pharmacy' || isAdmin;
  } catch {
    return isAdmin;
  }
})() && (
```

---

## 🗂️ Structure des Routes (Aucune Route URL)

L'application **N'utilise PAS React Router** actuellement.

### Routes Backend (API) ✅
```
GET    /api/pharmacies/114/stocks/              → Lister stocks
POST   /api/pharmacies/114/stocks/              → Ajouter stock
PATCH  /api/pharmacies/114/stocks/{id}/         → Modifier stock
DELETE /api/pharmacies/114/stocks/{id}/         → Supprimer stock
POST   /api/pharmacies/114/stocks/{id}/mark_available/
POST   /api/pharmacies/114/stocks/{id}/mark_unavailable/
```

### Routes Frontend (Conditionnelles) ⚠️
```
Pas de /stocks, /admin, ou /dashboard dans l'URL

Navigation par état interne :
- currentView === 'user'  → Vue recherche + carte
- currentView === 'admin' → Vue StockManager + AdminDashboard
```

### Comment Basculer
```javascript
// Fonction toggleView() ligne 78
const toggleView = () => {
    setCurrentView(currentView === 'user' ? 'admin' : 'user');
};
```

---

## 🔄 Flux Complet

```mermaid
┌─────────────────────────────────────────┐
│  Utilisateur ouvre http://localhost:3000│
└─────────────────────────────────────────┘
                   │
                   ↓
         ┌─────────────────┐
         │ Page d'accueil  │
         │ (Vue Utilisateur)│
         └─────────────────┘
                   │
                   ↓
      ┌────────────────────────────┐
      │ Connecté ET (Admin OU      │
      │ Pharmacie) ?               │
      └────────────────────────────┘
           │               │
          OUI             NON
           │               │
           ↓               ↓
  ┌────────────────┐   Pas de bouton
  │ Bouton visible :│   (reste en mode
  │ "Aller à la    │    utilisateur)
  │  Gestion"      │
  └────────────────┘
           │
           ↓ (Clic)
  ┌────────────────┐
  │ toggleView()   │
  │ currentView =  │
  │ 'admin'        │
  └────────────────┘
           │
           ↓
  ┌────────────────────┐
  │ StockManager       │
  │ s'affiche          │
  │ (US 3 Interface)   │
  └────────────────────┘
           │
           ↓
  ┌────────────────────┐
  │ Fetch stocks API   │
  │ /api/pharmacies/114│
  │ /stocks/           │
  └────────────────────┘
```

---

## 💡 Recommandations

### Option A : Garder le Système Actuel
**Avantages** :
- ✅ Simple, pas de dépendances (React Router)
- ✅ Transition fluide sans rechargement

**Inconvénients** :
- ❌ Pas d'URL dédiée (impossible de bookmarker `/stocks`)
- ❌ Pas de navigation browser (bouton précédent)
- ❌ SEO impossible

### Option B : Ajouter React Router
**Avantages** :
- ✅ URLs propres : `/`, `/stocks`, `/admin`
- ✅ Navigation browser fonctionnelle
- ✅ Bookmarkable

**Implémentation** :
```bash
npm install react-router-dom
```

```javascript
// App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route 
      path="/stocks" 
      element={isPharmacy ? <StockManager /> : <Navigate to="/" />} 
    />
    <Route 
      path="/admin" 
      element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
    />
  </Routes>
</BrowserRouter>
```

---

## 📝 Résumé

### Question : "Les routes de l'interface de la US 3 c'est la quelle ?"

**Réponse** :

🚫 **Pas de route URL** pour le moment (pas de `/stocks` dans l'adresse)

✅ **Accès via bouton** : "Aller à la Gestion (US3/US8)"

✅ **Condition** : Utilisateur doit être `isLoggedIn && isAdmin`

✅ **Méthode** : Cliquer sur le bouton → `toggleView()` → `currentView = 'admin'` → StockManager s'affiche

### Pour Accéder Maintenant

1. Ouvrir http://localhost:3000
2. F12 → Console → Exécuter le script localStorage ci-dessus
3. Recharger (F5)
4. Cliquer sur "Aller à la Gestion (US3/US8)"
5. ✅ Interface de gestion des stocks visible !

---

**URL de l'application** : `http://localhost:3000`  
**Route backend API** : `http://127.0.0.1:8000/api/pharmacies/{id}/stocks/`  
**Navigation** : Par état interne (`currentView`)  
**Pas de route frontend dédiée** (pas de `/stocks` dans l'URL du navigateur)
