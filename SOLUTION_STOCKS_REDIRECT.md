# 🚨 Problème : /stocks me redirige vers l'accueil

## ❌ Pourquoi ça arrive ?

La route `/stocks` est **PROTÉGÉE** et vérifie 2 choses :

```javascript
// StockManagementPage.js (lignes 8-13)
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
  // ❌ REDIRECTION VERS / si pas connecté
  return <Navigate to="/" replace />;
}
```

**Si vous n'êtes PAS connecté** → Redirection automatique vers `/` (accueil)

---

## 🔐 Solution : Se Connecter comme Pharmacie

### Méthode 1 : Outil de Diagnostic (RECOMMANDÉ) 🛠️

1. **Ouvrir l'outil** :
   ```
   http://localhost:3000/test_stocks_route.html
   ```

2. **Cliquer sur** : `🔐 Se Connecter comme Pharmacie`

3. **Tester** : Cliquez sur `📦 Tester /stocks`

✅ Vous devriez voir l'interface de gestion des stocks !

---

### Méthode 2 : Connexion via l'Interface React

1. **Aller à** : http://localhost:3000/

2. **Cliquer sur** : "Se connecter" (bouton dans le header)

3. **Entrer les identifiants** :
   ```
   Username : admin_centrale
   Password : admin123
   ```

4. **Se connecter** puis aller à : http://localhost:3000/stocks

---

### Méthode 3 : Connexion Backend Réelle (Si Backend Lancé)

Si votre backend Django tourne sur `http://127.0.0.1:8000` :

```bash
# Terminal 1 - Lancer le backend
cd /home/mitou/FindPharma/FindPharma
source ../env/bin/activate
python manage.py runserver
```

```bash
# Terminal 2 - Tester la connexion
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_centrale",
    "password": "admin123"
  }'
```

Vous recevrez un **token JWT** :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 4,
    "username": "admin_centrale",
    "user_type": "pharmacy",
    "pharmacy_id": 114
  }
}
```

Puis utilisez l'**outil de diagnostic** pour injecter ce token dans le localStorage.

---

## 🔍 Vérifier Votre État Actuel

### Console Navigateur (F12)

Ouvrez la console de votre navigateur et tapez :

```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('token'));

// Vérifier l'utilisateur
console.log('User:', localStorage.getItem('user'));

// Parser l'utilisateur
const user = JSON.parse(localStorage.getItem('user'));
console.log('Type:', user?.user_type);
```

**Résultats attendus** :
```
Token: "mock_token_pharmacy_admin_centrale_1732552800000"
User: {"id":4,"username":"admin_centrale","user_type":"pharmacy",...}
Type: "pharmacy"
```

---

## 🎯 Conditions pour Accéder à `/stocks`

La route vérifie **3 conditions** :

| Condition | Requis | Comment vérifier |
|-----------|--------|------------------|
| **1. Token présent** | ✅ OUI | `localStorage.getItem('token')` |
| **2. User présent** | ✅ OUI | `localStorage.getItem('user')` |
| **3. user_type = 'pharmacy'** | ✅ OUI | `JSON.parse(localStorage.getItem('user')).user_type === 'pharmacy'` |

**Si une seule manque** → ❌ Redirection vers `/`

---

## 🛠️ Débogage Avancé

### Modifier Temporairement la Protection

Si vous voulez **tester sans connexion**, modifiez temporairement `StockManagementPage.js` :

```javascript
// frontend/src/pages/StockManagementPage.js
function StockManagementPage() {
  // ⚠️ DÉSACTIVER temporairement la protection (DEV SEULEMENT)
  const BYPASS_AUTH = true; // Mettre à false en production !
  
  if (!BYPASS_AUTH) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return <Navigate to="/" replace />;
    }
    
    const user = JSON.parse(userStr);
    
    if (user.user_type !== 'pharmacy') {
      alert('Accès réservé aux pharmacies');
      return <Navigate to="/" replace />;
    }
  }
  
  // Afficher l'interface
  return (
    <main className="main-content admin-mode">
      <StockManager />
    </main>
  );
}
```

⚠️ **ATTENTION** : Cette modification est **UNIQUEMENT pour le développement**. Ne jamais déployer avec `BYPASS_AUTH = true` !

---

## 🚀 Solution Rapide (30 secondes)

**Tapez dans la console du navigateur (F12)** :

```javascript
// 1. Créer un faux token
localStorage.setItem('token', 'mock_token_pharmacy_' + Date.now());

// 2. Créer un faux utilisateur pharmacie
localStorage.setItem('user', JSON.stringify({
  id: 4,
  username: 'admin_centrale',
  user_type: 'pharmacy',
  email: 'centrale@findpharma.cm'
}));

// 3. Ajouter les infos pharmacie
localStorage.setItem('pharmacyId', '114');
localStorage.setItem('pharmacyName', 'Pharmacie Centrale de Yaoundé');

// 4. Recharger la page
location.reload();
```

Puis allez à : **http://localhost:3000/stocks**

✅ Vous devriez voir l'interface !

---

## 📊 Tableau des Routes et Permissions

| Route | Protection | user_type Requis | Que se passe-t-il si refusé |
|-------|-----------|------------------|------------------------------|
| `/` | ❌ Aucune | N/A | Accessible à tous |
| `/stocks` | ✅ OUI | `pharmacy` | Redirection vers `/` |
| `/admin` | ✅ OUI | `admin` | Redirection vers `/` |

---

## 🎯 Résumé

**Votre problème** : `/stocks` vous redirige vers `/` 

**Cause** : Vous n'êtes pas connecté OU vous n'êtes pas connecté comme `pharmacy`

**Solutions** :
1. 🛠️ **Utiliser l'outil** : http://localhost:3000/test_stocks_route.html
2. 🔐 **Se connecter** : Via l'interface avec `admin_centrale / admin123`
3. ⚡ **Console rapide** : Copier-coller le script ci-dessus dans la console

**Après connexion** : http://localhost:3000/stocks devrait afficher l'interface de gestion des stocks

---

## ❓ Toujours Bloqué ?

Si après connexion ça ne marche toujours pas :

1. **Vérifiez que le serveur React tourne** :
   ```bash
   cd /home/mitou/FindPharma/frontend
   npm start
   ```
   Devrait afficher : `webpack compiled successfully`

2. **Videz le cache du navigateur** : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)

3. **Vérifiez les erreurs dans la console** : F12 → Console

4. **Testez le diagnostic** : http://localhost:3000/test_stocks_route.html

---

## 📝 Checklist de Vérification

- [ ] Le serveur React tourne sur http://localhost:3000
- [ ] J'ai un `token` dans le localStorage
- [ ] J'ai un `user` dans le localStorage
- [ ] Le `user.user_type` est égal à `"pharmacy"`
- [ ] Aucune erreur dans la console (F12)
- [ ] J'ai vidé le cache (Ctrl+Shift+R)

**Si tout est coché** → `/stocks` devrait fonctionner ! 🎉

