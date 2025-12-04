# 📊 Analyse : Interface d'Administration Pharmacie (US 3)

## ✅ Résumé : Frontend PARTIELLEMENT Implémenté

**Date d'analyse** : 24 novembre 2025  
**Statut Global** : 🟡 **À COMPLÉTER**

---

## 🔍 Ce qui EXISTE déjà dans le Frontend

### ✅ Composant `StockManager.js`

**Emplacement** : `/home/mitou/FindPharma/frontend/src/StockManager.js`

**Fonctionnalités présentes** :
- ✅ Interface de gestion de stocks (tableau)
- ✅ Affichage : ID, Nom, Prix, Stock actuel
- ✅ Input pour modifier la quantité en stock
- ✅ Mise à jour locale immédiate (UX)
- ✅ Gestion du loading et des erreurs

**Fonctionnalités commentées (À ACTIVER)** :
```javascript
// 💡 Appel API à Franck pour obtenir la liste des produits de la pharmacie connectée
// const data = await fetchProducts(); 

// 💡 Appel API pour informer Franck (le Back-end) de la nouvelle valeur
// await updateStock(productId, newStock);
```

**Données actuelles** : Utilise des **données de test hardcodées** (Doliprane, Ibuprofène, Vitamines C)

**Ce qui MANQUE** :
- ❌ Connexion à l'API backend (`/api/pharmacies/{id}/stocks/`)
- ❌ Fonction `fetchProducts()` dans `api.js`
- ❌ Fonction `updateStock()` dans `api.js`
- ❌ Gestion de l'authentification JWT (token pharmacie)
- ❌ Fonction pour **ajouter** un nouveau stock
- ❌ Fonction pour **supprimer** un stock
- ❌ Toggle **disponible/indisponible**
- ❌ Affichage du nom de la pharmacie connectée

---

### ✅ Composant `AdminDashboard.js`

**Emplacement** : `/home/mitou/FindPharma/frontend/src/AdminDashboard.js`

**Type** : Dashboard **administrateur global** (statistiques plateforme)  
**Différent de** : Dashboard **pharmacie** (gestion stocks d'UNE pharmacie)

**Fonctionnalités présentes** :
- ✅ Affichage de statistiques globales
- ✅ Nombre total d'utilisateurs
- ✅ Nombre total de pharmacies
- ✅ Recherches de médicaments du mois
- ✅ Réservations du jour
- ✅ Note moyenne des pharmacies
- ✅ Médicament le plus recherché

**Données actuelles** : Utilise des **données de test hardcodées**

**Ce qui MANQUE** :
- ❌ Connexion à l'API backend (endpoints de statistiques)
- ❌ Fonction `fetchStats()` dans `api.js`

**⚠️ Note** : Ce composant n'est **PAS** le dashboard pharmacie pour US 3 !

---

## ❌ Ce qui MANQUE dans le Frontend

### 1. Intégration dans l'Application Principale

**Problème** : Les composants `StockManager` et `AdminDashboard` ne sont **pas importés** dans `App.js`

**Fichiers à modifier** :
- `/home/mitou/FindPharma/frontend/src/App.js`

**Actions nécessaires** :
```javascript
import StockManager from './StockManager';
import AdminDashboard from './AdminDashboard';

// Ajouter des routes conditionnelles basées sur le rôle utilisateur
{userRole === 'pharmacy' && <StockManager />}
{userRole === 'admin' && <AdminDashboard />}
```

---

### 2. Fonctions API Manquantes

**Fichier** : `/home/mitou/FindPharma/frontend/src/services/api.js`

#### Fonctions à Ajouter pour US 3 :

##### a) `fetchPharmacyStocks(pharmacyId, token)`
```javascript
/**
 * Récupère tous les stocks d'une pharmacie
 * GET /api/pharmacies/{pharmacyId}/stocks/
 */
export const fetchPharmacyStocks = async (pharmacyId, token) => {
  const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) throw new Error('Erreur chargement stocks');
  return await response.json();
};
```

##### b) `addStock(pharmacyId, stockData, token)`
```javascript
/**
 * Ajoute un nouveau médicament au stock
 * POST /api/pharmacies/{pharmacyId}/stocks/
 */
export const addStock = async (pharmacyId, stockData, token) => {
  const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stockData)
  });
  
  if (!response.ok) throw new Error('Erreur ajout stock');
  return await response.json();
};
```

##### c) `updateStock(pharmacyId, stockId, updates, token)`
```javascript
/**
 * Modifie un stock existant (quantité, prix, disponibilité)
 * PATCH /api/pharmacies/{pharmacyId}/stocks/{stockId}/
 */
export const updateStock = async (pharmacyId, stockId, updates, token) => {
  const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/${stockId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) throw new Error('Erreur mise à jour stock');
  return await response.json();
};
```

##### d) `deleteStock(pharmacyId, stockId, token)`
```javascript
/**
 * Supprime un stock
 * DELETE /api/pharmacies/{pharmacyId}/stocks/{stockId}/
 */
export const deleteStock = async (pharmacyId, stockId, token) => {
  const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/${stockId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  if (!response.ok) throw new Error('Erreur suppression stock');
  return response.status === 204;
};
```

##### e) `toggleStockAvailability(pharmacyId, stockId, available, token)`
```javascript
/**
 * Marque un stock comme disponible ou indisponible
 * POST /api/pharmacies/{pharmacyId}/stocks/{stockId}/mark_available/
 * POST /api/pharmacies/{pharmacyId}/stocks/{stockId}/mark_unavailable/
 */
export const toggleStockAvailability = async (pharmacyId, stockId, available, token) => {
  const endpoint = available ? 'mark_available' : 'mark_unavailable';
  const response = await fetch(
    `${API_URL}/api/pharmacies/${pharmacyId}/stocks/${stockId}/${endpoint}/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  if (!response.ok) throw new Error('Erreur changement disponibilité');
  return await response.json();
};
```

##### f) `fetchMedicines()`
```javascript
/**
 * Récupère la liste de tous les médicaments disponibles
 * GET /api/medicines/
 * (Pour le formulaire d'ajout de stock)
 */
export const fetchMedicines = async () => {
  const response = await fetch(`${API_URL}/api/medicines/`);
  if (!response.ok) throw new Error('Erreur chargement médicaments');
  return await response.json();
};
```

---

### 3. Composant `StockManager.js` à Améliorer

**Modifications nécessaires** :

#### a) Importer les fonctions API
```javascript
import { 
  fetchPharmacyStocks, 
  addStock, 
  updateStock, 
  deleteStock,
  toggleStockAvailability,
  fetchMedicines
} from './services/api';
```

#### b) Récupérer l'ID de la pharmacie et le token
```javascript
const StockManager = ({ pharmacyId, token }) => {
  // OU récupérer depuis le contexte/localStorage
  const pharmacyId = localStorage.getItem('pharmacyId');
  const token = localStorage.getItem('token');
```

#### c) Charger les vraies données au montage
```javascript
useEffect(() => {
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchPharmacyStocks(pharmacyId, token);
      setProducts(data);
    } catch (err) {
      setError("Erreur de chargement des produits.");
    } finally {
      setLoading(false);
    }
  };
  loadProducts();
}, [pharmacyId, token]);
```

#### d) Implémenter la mise à jour réelle
```javascript
const handleStockChange = async (productId, newStock) => {
  if (newStock < 0 || isNaN(newStock)) return;
  
  // Mise à jour optimiste (UI)
  setProducts(products.map(p => 
    p.id === productId ? { ...p, quantity: newStock } : p
  ));

  try {
    await updateStock(pharmacyId, productId, { quantity: newStock }, token);
  } catch (err) {
    setError("Impossible de sauvegarder.");
    // Rollback en cas d'erreur
    loadProducts();
  }
};
```

#### e) Ajouter un formulaire d'ajout
```javascript
const [showAddForm, setShowAddForm] = useState(false);
const [medicines, setMedicines] = useState([]);

// Charger la liste des médicaments
useEffect(() => {
  fetchMedicines().then(setMedicines);
}, []);

// Fonction d'ajout
const handleAddStock = async (medicineId, quantity, price) => {
  try {
    const newStock = await addStock(pharmacyId, {
      medicine: medicineId,
      quantity,
      price,
      is_available: true
    }, token);
    
    setProducts([...products, newStock]);
    setShowAddForm(false);
  } catch (err) {
    setError("Erreur lors de l'ajout.");
  }
};
```

#### f) Ajouter un bouton de suppression
```javascript
const handleDelete = async (stockId) => {
  if (!confirm('Supprimer ce stock ?')) return;
  
  try {
    await deleteStock(pharmacyId, stockId, token);
    setProducts(products.filter(p => p.id !== stockId));
  } catch (err) {
    setError("Impossible de supprimer.");
  }
};
```

#### g) Ajouter toggle disponibilité
```javascript
const handleToggleAvailability = async (stockId, currentStatus) => {
  try {
    await toggleStockAvailability(pharmacyId, stockId, !currentStatus, token);
    setProducts(products.map(p => 
      p.id === stockId ? { ...p, is_available: !currentStatus } : p
    ));
  } catch (err) {
    setError("Erreur changement disponibilité.");
  }
};
```

---

### 4. Routing et Navigation

**Problème** : Pas de lien visible pour accéder au `StockManager`

**Solutions possibles** :

#### Option A : Ajouter dans le Header
```javascript
// Dans Header.js
{userType === 'pharmacy' && (
  <button onClick={() => navigate('/dashboard')}>
    📦 Gérer mes Stocks
  </button>
)}
```

#### Option B : Route dédiée dans App.js
```javascript
// Dans App.js
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/dashboard" element={
    userType === 'pharmacy' ? <StockManager /> : <Navigate to="/" />
  } />
</Routes>
```

#### Option C : Modal/Panel coulissant
```javascript
// Bouton dans Header qui ouvre un modal
{showStockManager && <StockManager onClose={() => setShowStockManager(false)} />}
```

---

## 📋 Checklist d'Implémentation

### Phase 1 : Connexion API Backend ⏳

- [ ] **Créer les 6 fonctions API** dans `services/api.js` :
  - [ ] `fetchPharmacyStocks()`
  - [ ] `addStock()`
  - [ ] `updateStock()`
  - [ ] `deleteStock()`
  - [ ] `toggleStockAvailability()`
  - [ ] `fetchMedicines()`

### Phase 2 : Améliorer StockManager ⏳

- [ ] **Importer** les fonctions API
- [ ] **Charger les vraies données** au montage
- [ ] **Implémenter** la mise à jour avec API réelle
- [ ] **Ajouter** formulaire d'ajout de stock
- [ ] **Ajouter** bouton de suppression
- [ ] **Ajouter** toggle disponible/indisponible
- [ ] **Gérer** les erreurs API avec messages clairs
- [ ] **Afficher** le nom de la pharmacie en en-tête

### Phase 3 : Intégration dans l'App ⏳

- [ ] **Importer** `StockManager` dans `App.js`
- [ ] **Créer** une route `/dashboard` ou `/stocks`
- [ ] **Ajouter** un lien dans le `Header` (si user = pharmacy)
- [ ] **Protéger** la route (redirect si pas pharmacie)
- [ ] **Récupérer** l'ID de la pharmacie depuis le profil user
- [ ] **Passer** les props nécessaires (pharmacyId, token)

### Phase 4 : Tests d'Intégration ⏳

- [ ] **Se connecter** avec un compte pharmacie
- [ ] **Accéder** au StockManager
- [ ] **Voir** la liste des stocks réels (depuis backend)
- [ ] **Modifier** une quantité → vérifier dans backend
- [ ] **Ajouter** un nouveau stock → vérifier dans backend
- [ ] **Supprimer** un stock → vérifier dans backend
- [ ] **Toggle** disponibilité → vérifier impact sur recherche
- [ ] **Vérifier** qu'une autre pharmacie ne peut pas modifier
- [ ] **Vérifier** qu'un client ne peut pas accéder

---

## 🎯 Résumé Exécutif

### ✅ Ce qui fonctionne
- Backend API complet pour US 3 (endpoints testés ✅)
- Composant UI `StockManager` existe (structure ✅)
- Compte pharmacie peut être créé (testé ✅)

### ⚠️ Ce qui manque
- **Connexion frontend ↔ backend** (API calls commentées)
- **Intégration dans App.js** (composant isolé)
- **Fonctions CRUD dans api.js** (à créer)
- **Navigation** vers le dashboard (pas de lien)

### 🚀 Prochaines Étapes

1. **Créer les 6 fonctions API** dans `services/api.js` (30 min)
2. **Modifier StockManager.js** pour utiliser l'API réelle (45 min)
3. **Intégrer dans App.js** avec routing (15 min)
4. **Ajouter lien dans Header** pour pharmacies (10 min)
5. **Tester l'intégration complète** (30 min)

**Temps estimé total** : ~2 heures de développement

---

## 📝 Conclusion

**Le frontend a les BASES de l'interface d'administration pharmacie**, mais elle est **déconnectée du backend**. 

**Analogie** : C'est comme avoir une belle voiture (UI) avec un moteur (backend) qui tourne parfaitement, mais **sans câbles** entre les deux ! Il faut connecter les fils (fonctions API) pour que tout fonctionne ensemble.

**Statut actuel** : 🟡 **40% complété**
- ✅ Backend : 100%
- ✅ Frontend UI : 70%
- ❌ Frontend-Backend Integration : 0%

**Une fois l'intégration faite** : 🟢 **100% fonctionnel** ! 🎉

---

**Date** : 24 novembre 2025  
**Analysé par** : GitHub Copilot  
**Prochaine action** : Implémenter les fonctions API dans `services/api.js`
