# 🔐 Guide de Connexion - Option 3 (Interface React)

## ✅ Préparation Complétée

### Backend : ✅ Opérationnel
- Serveur Django : `http://127.0.0.1:8000` (PID: 7699)
- API de connexion : Fonctionnelle
- Base de données : Connectée

### Frontend : ✅ Opérationnel
- Serveur React : `http://localhost:3000` (PID: 8804)
- Routes configurées : `/`, `/stocks`, `/admin`

### Compte Pharmacie : ✅ Prêt
```
Username : admin_centrale
Password : admin123
Type     : pharmacy
Pharmacy : Pharmacie Centrale de Yaoundé (ID: 114)
```

---

## 📋 Étapes de Connexion

### 1️⃣ Ouvrir la Page d'Accueil

**URL** : http://localhost:3000/

Vous devriez voir :
```
┌─────────────────────────────────────────────────┐
│ ⚕️ FindPharma    🏠 Accueil    [Se connecter]   │
└─────────────────────────────────────────────────┘
```

---

### 2️⃣ Cliquer sur "Se connecter"

Dans le **header** (en haut à droite), cliquez sur le bouton **"Se connecter"**.

Un **modal** (fenêtre popup) devrait s'ouvrir :

```
┌─────────────────────────────────┐
│   🔐 Connexion                  │
├─────────────────────────────────┤
│                                 │
│   Username                      │
│   [_________________]           │
│                                 │
│   Password                      │
│   [_________________]           │
│                                 │
│   [Se connecter]  [S'inscrire] │
│                                 │
└─────────────────────────────────┘
```

---

### 3️⃣ Entrer les Identifiants

Remplissez le formulaire :

**Username** : `admin_centrale`  
**Password** : `admin123`

---

### 4️⃣ Cliquer sur "Se connecter"

Après avoir cliqué, vous devriez voir :

**✅ Succès** :
```
┌─────────────────────────────────────────────────────────────┐
│ ⚕️ FindPharma    🏠 Accueil  📦 Gérer mes Stocks  👋 admin_centrale │
│                                           🚪 Déconnexion    │
└─────────────────────────────────────────────────────────────┘
```

Le modal se ferme et vous voyez :
- ✅ Votre nom d'utilisateur affiché : `admin_centrale`
- ✅ Nouveau lien dans le menu : **📦 Gérer mes Stocks**
- ✅ Bouton **Déconnexion**

---

### 5️⃣ Accéder à l'Interface de Gestion des Stocks

**Méthode A** : Cliquer sur le lien dans le menu
- Cliquez sur **"📦 Gérer mes Stocks"** dans le header

**Méthode B** : URL directe
- Allez à : http://localhost:3000/stocks

---

### 6️⃣ Interface de Gestion (Résultat Attendu)

Vous devriez voir :

```
┌───────────────────────────────────────────────────────────────┐
│                                                                │
│  📦 Gestion des Stocks                  ➕ Ajouter un médicament │
│  Pharmacie Centrale de Yaoundé                                │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Chargement des stocks...                                     │
│  (ou tableau avec vos stocks si vous en avez)                 │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

**Si vous voyez cette interface** → ✅ **SUCCÈS !**

---

## 🔍 Vérifications en Cas de Problème

### Vérification 1 : Modal ne s'ouvre pas

**Problème** : Le bouton "Se connecter" ne fait rien

**Solutions** :
1. Ouvrez la console (F12) et cherchez les erreurs JavaScript
2. Vérifiez que `AuthModal.js` existe dans `frontend/src/`
3. Vérifiez que le serveur React n'a pas d'erreurs de compilation

---

### Vérification 2 : Erreur "Identifiants invalides"

**Problème** : Le backend refuse la connexion

**Solutions** :
```bash
# Vérifier que le backend tourne
lsof -i :8000

# Réinitialiser le mot de passe
cd /home/mitou/FindPharma/backend
/home/mitou/FindPharma/environments/venv_system/bin/python manage.py shell -c "
from users.models import User
user = User.objects.get(username='admin_centrale')
user.set_password('admin123')
user.save()
print('✅ Mot de passe réinitialisé')
"
```

---

### Vérification 3 : Connexion réussie mais redirection vers /

**Problème** : Après connexion, `/stocks` redirige vers `/`

**Causes possibles** :
1. ❌ Le `localStorage` n'est pas rempli correctement
2. ❌ Le `user_type` n'est pas `"pharmacy"`
3. ❌ Le token n'est pas sauvegardé

**Vérifier dans la console (F12)** :
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

**Résultat attendu** :
```javascript
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
User: {
  id: 4,
  username: "admin_centrale",
  user_type: "pharmacy",
  pharmacy: 114,
  pharmacy_name: "Pharmacie Centrale de Yaoundé"
}
```

**Si `user_type` ≠ "pharmacy"** → Le compte n'est pas du bon type

---

### Vérification 4 : Le lien "Gérer mes Stocks" n'apparaît pas

**Problème** : Après connexion, le menu ne change pas

**Causes** :
1. Le `Header.js` ne détecte pas le changement d'état
2. Le `user_type` n'est pas correctement vérifié

**Vérifier dans `Header.js`** :
```javascript
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
const isPharmacy = user?.user_type === 'pharmacy';

// Le lien doit s'afficher si isPharmacy === true
```

---

## 🎯 Checklist de Connexion

- [ ] Backend tourne sur http://127.0.0.1:8000
- [ ] Frontend tourne sur http://localhost:3000
- [ ] J'ai ouvert http://localhost:3000/
- [ ] J'ai cliqué sur "Se connecter"
- [ ] J'ai entré `admin_centrale` / `admin123`
- [ ] J'ai cliqué sur le bouton "Se connecter"
- [ ] Je vois mon nom `admin_centrale` dans le header
- [ ] Je vois le lien "📦 Gérer mes Stocks"
- [ ] J'ai cliqué sur "Gérer mes Stocks" OU je suis allé à `/stocks`
- [ ] Je vois l'interface "📦 Gestion des Stocks"

**Si tous les points sont cochés** → ✅ **CONNEXION RÉUSSIE !**

---

## 📊 Données de Test Actuelles

### Token JWT Reçu (valide)
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Données Utilisateur
```json
{
  "id": 4,
  "username": "admin_centrale",
  "email": "admin@pharmaciecentrale.cm",
  "first_name": "Admin",
  "last_name": "Centrale",
  "user_type": "pharmacy",
  "pharmacy": 114,
  "pharmacy_name": "Pharmacie Centrale de Yaoundé",
  "phone": "+237222234567"
}
```

---

## 🚀 Test Rapide (Console)

Si l'interface ne fonctionne pas, testez manuellement dans la console (F12) :

```javascript
// 1. Simuler une connexion réussie
const userData = {
  id: 4,
  username: "admin_centrale",
  email: "admin@pharmaciecentrale.cm",
  user_type: "pharmacy",
  pharmacy: 114,
  pharmacy_name: "Pharmacie Centrale de Yaoundé"
};

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0MDMwOTgyLCJpYXQiOjE3NjQwMjczODIsImp0aSI6IjQ3ZTU5ZWE5NmZlYTRmYTFiNGZiNDIwZGU0NTBiMzkzIiwidXNlcl9pZCI6IjQiLCJpc3MiOiJGaW5kUGhhcm1hIn0.g4wnrjhq3kjMi43-1qyD3-uODgFLXrCKyz4Nic-VTIM";

// 2. Sauvegarder dans localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(userData));
localStorage.setItem('pharmacyId', '114');
localStorage.setItem('pharmacyName', 'Pharmacie Centrale de Yaoundé');

// 3. Recharger
location.href = '/stocks';
```

---

## 📞 Support

**Si vous êtes toujours bloqué** :
1. Vérifiez la console (F12) pour les erreurs
2. Vérifiez le terminal React pour les erreurs de compilation
3. Vérifiez le terminal Django pour les erreurs backend
4. Utilisez l'outil de diagnostic : http://localhost:3000/test_stocks_route.html

---

## 🎉 Résultat Final Attendu

Après connexion et navigation vers `/stocks`, vous devriez voir :

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚕️ FindPharma    🏠 Accueil  📦 Gérer mes Stocks  👋 admin_centrale│
│                                              🚪 Déconnexion      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  📦 Gestion des Stocks                    ➕ Ajouter un médicament │
│  Pharmacie Centrale de Yaoundé                                   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Médicament    │ Quantité │ Prix (FCFA) │ Disponibilité   │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ (Vide ou stocks existants)                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**C'est cette interface que vous devez voir !** 🎯

