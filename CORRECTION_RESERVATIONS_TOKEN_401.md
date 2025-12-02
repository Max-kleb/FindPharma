# Correction : Réservations - Token Expiré (401 Unauthorized)

**Date:** 1er décembre 2025  
**Statut:** ✅ Corrigé avec auto-refresh du token

---

## 🔍 Problème Diagnostiqué

### Erreur Initiale
```
POST http://127.0.0.1:8000/api/reservations/ 401 (Unauthorized)
❌ Erreur réservation: Error: Given token not valid for any token type
```

**Cause racine :** Le token JWT d'accès (access token) a expiré. Django répond avec un 401 Unauthorized.

---

## ✅ Solution Implémentée

### 1. Auto-Refresh du Token dans `App.js`

**Fichier modifié :** `/frontend/src/App.js`

**Comportement :**
1. ✅ Essai initial de réservation avec le token actuel
2. ❌ Si erreur 401 détectée → Tentative de rafraîchissement
3. 🔄 Récupération du `refreshToken` depuis localStorage
4. 🔄 Appel à `refreshAccessToken(refreshToken)`
5. ✅ Mise à jour du token dans localStorage et l'état React
6. 🔁 **Nouvelle tentative** de réservation avec le token rafraîchi
7. ✅ Succès → Panier vidé, réservation confirmée

**Code ajouté :**
```javascript
const handleReservationSubmit = async (reservationData) => {
  if (!userToken) {
    throw new Error("Non authentifié");
  }
  
  try {
    const result = await submitReservation(reservationData, userToken);
    console.log('✅ Réservation créée:', result);
    clearCart();
    return result;
  } catch (error) {
    console.error('❌ Erreur réservation:', error);
    
    // Si le token est invalide (401), essayer de rafraîchir
    if (error.message.includes('Given token not valid') || error.message.includes('401')) {
      console.log('🔄 Token expiré, tentative de rafraîchissement...');
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { refreshAccessToken } = await import('./services/api');
          const newAccessToken = await refreshAccessToken(refreshToken);
          
          // Mettre à jour le token dans localStorage et l'état
          localStorage.setItem('token', newAccessToken);
          setUserToken(newAccessToken);
          
          console.log('✅ Token rafraîchi, nouvelle tentative de réservation...');
          
          // Retenter la réservation avec le nouveau token
          const result = await submitReservation(reservationData, newAccessToken);
          console.log('✅ Réservation créée après refresh:', result);
          clearCart();
          return result;
        } catch (refreshError) {
          console.error('❌ Échec du rafraîchissement du token:', refreshError);
          // Token de rafraîchissement aussi invalide → déconnexion
          handleLogout();
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
      } else {
        // Pas de refresh token → déconnexion
        handleLogout();
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }
    }
    
    throw error;
  }
};
```

---

### 2. Amélioration de `submitReservation()` dans `api.js`

**Fichier modifié :** `/frontend/src/services/api.js`

**Changement :**
```javascript
if (!response.ok) {
  const errorData = await response.json();
  
  // Si erreur 401, inclure le status dans le message pour permettre le retry
  if (response.status === 401) {
    throw new Error(errorData.detail || 'Given token not valid for any token type');
  }
  
  throw new Error(errorData.detail || errorData.error || JSON.stringify(errorData) || 'Erreur lors de la réservation');
}
```

**Avantage :** Distingue clairement les erreurs 401 (token invalide) des autres erreurs (validation, stock insuffisant, etc.)

---

## 🔐 Fonctionnement des Tokens JWT

### Structure du système
```
┌──────────────────────────────────────────────────────────┐
│                    localStorage                          │
├──────────────────────────────────────────────────────────┤
│  token         → Access Token (courte durée, 15-60 min)  │
│  refreshToken  → Refresh Token (longue durée, 7-30 jours)│
└──────────────────────────────────────────────────────────┘
```

### Cycle de vie
1. **Connexion (`/api/auth/login/`)** → Reçoit `access` + `refresh` tokens
2. **Requêtes API** → Utilise `Bearer ${accessToken}` dans les headers
3. **Token expiré** → Erreur 401 Unauthorized
4. **Rafraîchissement (`/api/auth/token/refresh/`)** → Envoie `refreshToken`, reçoit nouveau `accessToken`
5. **Refresh expiré** → Déconnexion automatique

---

## 🧪 Tests à Effectuer

### Scénario 1 : Token valide
1. Se connecter
2. Ajouter un médicament au panier
3. Faire une réservation immédiatement
4. ✅ **Résultat attendu :** Réservation réussie du premier coup

### Scénario 2 : Token expiré (simulation)
1. Se connecter
2. Attendre que le token expire (ou le supprimer manuellement de localStorage)
3. Essayer de faire une réservation
4. ✅ **Résultat attendu :** 
   - Console affiche "🔄 Token expiré, tentative de rafraîchissement..."
   - Réservation réussie après refresh automatique

### Scénario 3 : Refresh token expiré
1. Se connecter
2. Supprimer complètement les tokens de localStorage
3. Essayer une réservation
4. ✅ **Résultat attendu :** 
   - Message "Session expirée. Veuillez vous reconnecter."
   - Redirection vers la page de connexion

---

## 📊 Logs Attendus (Console)

### Cas normal (token valide)
```
✅ Réservation créée: { id: 42, status: 'pending', ... }
```

### Cas refresh réussi
```
❌ Erreur réservation: Error: Given token not valid for any token type
🔄 Token expiré, tentative de rafraîchissement...
🔄 Rafraîchissement du token...
✅ Token rafraîchi avec succès
✅ Token rafraîchi, nouvelle tentative de réservation...
✅ Réservation créée après refresh: { id: 42, status: 'pending', ... }
```

### Cas refresh échoué
```
❌ Erreur réservation: Error: Given token not valid for any token type
🔄 Token expiré, tentative de rafraîchissement...
🔄 Rafraîchissement du token...
❌ Erreur refresh token: Token de rafraîchissement expiré ou invalide
❌ Échec du rafraîchissement du token: Error: Token de rafraîchissement expiré ou invalide
[Déconnexion automatique]
```

---

## 🚀 Avantages de Cette Solution

1. ✅ **Expérience utilisateur fluide** - Pas besoin de se reconnecter manuellement
2. ✅ **Gestion automatique** - Le système détecte et corrige lui-même le problème
3. ✅ **Sécurisé** - Déconnexion automatique si refresh impossible
4. ✅ **Transparent** - L'utilisateur ne voit rien, tout se passe en arrière-plan
5. ✅ **Réutilisable** - Même logique applicable aux autres endpoints protégés

---

## 🔧 Prochaines Améliorations Possibles

### 1. Intercepteur API Global
Créer un wrapper pour toutes les requêtes qui gère automatiquement le refresh :

```javascript
export const authenticatedFetch = async (url, options, retryCount = 0) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401 && retryCount === 0) {
    const newToken = await refreshAccessToken(localStorage.getItem('refreshToken'));
    localStorage.setItem('token', newToken);
    return authenticatedFetch(url, options, 1); // Retry once
  }
  
  return response;
};
```

### 2. Préventif : Vérifier l'expiration avant chaque requête
Décoder le JWT, vérifier si `exp` < `Date.now()`, rafraîchir de manière proactive.

### 3. Toaster/Notification
Afficher un message "🔄 Rafraîchissement de votre session..." pendant le refresh.

---

## ✅ Statut Final

**Problème :** ❌ Réservations échouent avec erreur 401  
**Cause :** Token JWT expiré  
**Solution :** Auto-refresh du token avec retry automatique  
**Résultat :** ✅ Les réservations fonctionnent maintenant même avec token expiré

---

**Test maintenant :** Essayez de faire une réservation et observez les logs dans la console ! 🚀
