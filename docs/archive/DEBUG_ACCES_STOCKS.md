# 🔧 Debug : Accès Refusé à /stocks

**Date** : 25 novembre 2025  
**Problème** : "Accès réservé aux pharmacies" même en étant connecté en tant que pharmacie  
**Status** : 🔍 EN COURS DE DEBUG

---

## 🐛 Symptômes

1. ✅ Connexion réussie en tant que pharmacie
2. 🔄 Redirection vers `/stocks`
3. ❌ Pop-up : "Accès réservé aux pharmacies"
4. ❌ Dashboard non affiché

---

## 🔍 Outils de Débogage Ajoutés

### 1. Logs dans LoginPage.js

**Ajoutés à la ligne 29-40** :
```javascript
console.log('💾 Données sauvegardées dans localStorage:');
console.log('   - token:', accessToken.substring(0, 20) + '...');
console.log('   - user:', JSON.stringify(user));
console.log('   - user_type:', user.user_type);
```

### 2. Logs dans StockManagementPage.js

**Ajoutés à la ligne 19-22** :
```javascript
console.log('📋 StockManagementPage - User data:', user);
console.log('📋 user_type:', user.user_type);
console.log('📋 Comparaison:', user.user_type, '!==', 'pharmacy', '=', user.user_type !== 'pharmacy');
```

### 3. Page de Test localStorage

**Nouvelle page créée** : `frontend/public/test_localStorage.html`

---

## 📝 Guide de Débogage

### Étape 1 : Vérifier la Console du Navigateur

1. **Ouvrir la console** : `F12` → Onglet "Console"

2. **Se connecter avec un compte pharmacie**
   ```
   Username: pharmacy_bastos_admin
   Password: testpass123
   ```

3. **Vérifier les logs après connexion** :
   ```
   💾 Données sauvegardées dans localStorage:
      - token: eyJhbGci...
      - user: {"id":7,"username":"pharmacy_bastos_admin",...}
      - user_type: pharmacy
   ✅ Connexion réussie: {...}
   🔄 Redirection vers /stocks (pharmacy)
   🔄 Rechargement de la page...
   ```

4. **Vérifier les logs sur /stocks** :
   ```
   📋 StockManagementPage - User data: {...}
   📋 user_type: pharmacy
   📋 Comparaison: pharmacy !== pharmacy = false
   ✅ Accès autorisé - Affichage du dashboard
   ```

**Si vous voyez** :
```
❌ Accès refusé: user_type = customer
```
**Alors le problème est dans le type d'utilisateur stocké.**

---

### Étape 2 : Utiliser la Page de Test

1. **Ouvrir dans le navigateur** :
   ```
   http://localhost:3000/test_localStorage.html
   ```

2. **La page affiche automatiquement** :
   - ✅ Token présent ou non
   - ✅ Données utilisateur décodées
   - ✅ Type d'utilisateur
   - ✅ Statut d'accès à /stocks (autorisé/refusé)

3. **Exemple de résultat attendu** :
   ```json
   {
     "id": 7,
     "username": "pharmacy_bastos_admin",
     "email": "admin.bastos@pharmacy.cm",
     "user_type": "pharmacy",  ← DOIT être "pharmacy"
     "pharmacy": 117,
     "pharmacy_name": "Pharmacie Bastos"
   }
   ```

4. **Si user_type est différent** → Problème identifié !

---

### Étape 3 : Vérifier Manuellement localStorage

**Dans la console du navigateur** :

```javascript
// Vérifier le token
localStorage.getItem('token')
// → Doit retourner un long string JWT

// Vérifier les données utilisateur
localStorage.getItem('user')
// → Doit retourner une string JSON

// Parser et afficher
JSON.parse(localStorage.getItem('user'))
// → Doit afficher l'objet user

// Vérifier le type spécifiquement
JSON.parse(localStorage.getItem('user')).user_type
// → Doit retourner "pharmacy"
```

---

## 🔍 Causes Possibles

### Cause 1 : Données Non Sauvegardées

**Symptôme** :
```javascript
localStorage.getItem('user') === null
```

**Solution** :
- Vérifier que la connexion réussit
- Vérifier que `data.user` existe dans la réponse API
- Vérifier les logs "💾 Données sauvegardées"

### Cause 2 : user_type Incorrect

**Symptôme** :
```javascript
JSON.parse(localStorage.getItem('user')).user_type !== 'pharmacy'
// user_type = 'customer' ou autre valeur
```

**Solution** :
- Vérifier que le compte est bien de type "pharmacy" dans la base de données
- Tester avec l'API directement :
  ```bash
  curl -X POST http://127.0.0.1:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"pharmacy_bastos_admin", "password":"testpass123"}'
  ```
- Vérifier la réponse : `"user_type": "pharmacy"`

### Cause 3 : Problème de Timing avec reload()

**Symptôme** :
- Connexion OK
- Redirection OK
- Mais `window.location.reload()` efface les données avant la vérification

**Solution possible** :
- Commenter temporairement `window.location.reload()` dans `LoginPage.js`
- Tester si le problème persiste

### Cause 4 : Casse ou Espaces dans user_type

**Symptôme** :
```javascript
user_type = "Pharmacy" // Majuscule
// ou
user_type = " pharmacy " // Espaces
```

**Solution** :
- Vérifier la réponse de l'API backend
- S'assurer que le backend retourne exactement `"pharmacy"` (minuscules, sans espaces)

---

## 🧪 Tests à Effectuer

### Test 1 : Connexion + Logs Console

```
1. F12 → Console
2. Se connecter
3. Copier TOUS les logs
4. Partager les logs
```

### Test 2 : Page de Test localStorage

```
1. Ouvrir http://localhost:3000/test_localStorage.html
2. Vérifier l'affichage
3. Faire une capture d'écran
4. Partager la capture
```

### Test 3 : Vérification Manuelle

```javascript
// Dans la console après connexion
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
const user = JSON.parse(localStorage.getItem('user'));
console.log('User Type:', user.user_type);
console.log('Is Pharmacy?', user.user_type === 'pharmacy');
```

### Test 4 : Test API Direct

```bash
# Connexion via curl
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"pharmacy_bastos_admin", "password":"testpass123"}' \
  | python -m json.tool

# Vérifier dans la réponse :
# "user_type": "pharmacy"  ← Doit être présent
```

---

## 🔧 Correctifs Potentiels

### Correctif 1 : Si user_type Manquant

**Fichier** : `backend/users/serializers.py`

Vérifier que `user_type` est bien inclus dans le serializer de login.

### Correctif 2 : Si Problème de Timing

**Fichier** : `frontend/src/pages/LoginPage.js`

Remplacer :
```javascript
navigate('/stocks');
window.location.reload();
```

Par :
```javascript
window.location.href = '/stocks';
// Utilise une navigation complète au lieu de React Router + reload
```

### Correctif 3 : Si Problème de Casse

**Fichier** : `frontend/src/pages/StockManagementPage.js`

Remplacer :
```javascript
if (user.user_type !== 'pharmacy') {
```

Par :
```javascript
if (user.user_type?.toLowerCase() !== 'pharmacy') {
```

---

## 📊 Checklist de Débogage

- [ ] Ouvrir la console du navigateur (F12)
- [ ] Se connecter avec un compte pharmacie
- [ ] Vérifier les logs "💾 Données sauvegardées"
- [ ] Vérifier le `user_type` dans les logs
- [ ] Aller sur `/stocks`
- [ ] Vérifier les logs "📋 StockManagementPage"
- [ ] Noter si "✅ Accès autorisé" ou "❌ Accès refusé"
- [ ] Ouvrir `test_localStorage.html`
- [ ] Vérifier le résumé affiché
- [ ] Prendre une capture d'écran
- [ ] Tester l'API backend avec curl
- [ ] Comparer les résultats

---

## 📸 Ce Que Je Dois Voir

### Connexion Réussie (Console)
```
💾 Données sauvegardées dans localStorage:
   - token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - user: {"id":7,"username":"pharmacy_bastos_admin","email":"admin.bastos@pharmacy.cm","user_type":"pharmacy",...}
   - user_type: pharmacy
   - pharmacyId: 117
   - pharmacyName: Pharmacie Bastos
✅ Connexion réussie: {id: 7, username: 'pharmacy_bastos_admin', ...}
🔄 Redirection vers /stocks (pharmacy)
```

### Sur /stocks (Console)
```
📋 StockManagementPage - User data: {id: 7, username: 'pharmacy_bastos_admin', user_type: 'pharmacy', ...}
📋 user_type: pharmacy
📋 Comparaison: pharmacy !== pharmacy = false
✅ Accès autorisé - Affichage du dashboard
```

### Page test_localStorage.html
```
✅ Token d'accès
[long token JWT...]

👤 Données Utilisateur
{
  "id": 7,
  "username": "pharmacy_bastos_admin",
  "user_type": "pharmacy",
  ...
}

Analyse:
• Type: pharmacy ✅ (PHARMACY)

✅ Accès à /stocks autorisé

📊 Résumé
Token présent: ✅ Oui
User présent: ✅ Oui
Type utilisateur: pharmacy
Accès /stocks: ✅ AUTORISÉ
```

---

## 🎯 Prochaines Étapes

1. **Effectuer les tests ci-dessus**
2. **Copier les logs de la console**
3. **Prendre une capture de test_localStorage.html**
4. **Partager les résultats**

Avec ces informations, je pourrai identifier précisément le problème ! 🕵️

---

## 📞 Commandes Rapides

### Effacer localStorage (si besoin)
```javascript
localStorage.clear();
location.reload();
```

### Voir localStorage complet
```javascript
console.log('=== LOCALSTORAGE ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key + ':', localStorage.getItem(key));
}
```

### Forcer user_type (test uniquement)
```javascript
const user = JSON.parse(localStorage.getItem('user'));
user.user_type = 'pharmacy';
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

---

**Auteur** : GitHub Copilot  
**Date** : 25 novembre 2025  
**Status** : Outils de debug déployés - En attente des résultats
