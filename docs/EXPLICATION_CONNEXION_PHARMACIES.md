# 📚 Explication : Authentification et Dashboard des Pharmacies

**Date** : 25 novembre 2025  
**Sujet** : Comprendre le flux de connexion des pharmacies

---

## 🔐 Pourquoi On Demande un Nom d'Utilisateur ?

### Réponse Simple

**C'est le système d'authentification standard de Django REST Framework avec JWT.**

L'application utilise une authentification basée sur **username + password** (pas email + password). C'est une décision d'architecture backend.

---

## 🏗️ Architecture d'Authentification Actuelle

### Backend (Django)

Le modèle `User` utilise le champ **`username`** comme identifiant unique :

```python
# backend/users/models.py
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)  # ✅ Identifiant principal
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    pharmacy = models.ForeignKey('pharmacies.Pharmacy', ...)
```

### Endpoint de Connexion

```python
POST /api/auth/login/
Body: {
    "username": "pharmacy_bastos_admin",  # ✅ Obligatoire
    "password": "testpass123"
}
```

**Pourquoi pas l'email ?**
- Django par défaut utilise `username` pour l'authentification
- JWT (JSON Web Token) est configuré pour vérifier le `username`
- C'est une pratique standard dans Django

---

## 🔄 Flux de Connexion Complet

### Étape par Étape

```
1️⃣ Utilisateur arrive sur /login
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
2️⃣ Remplit le formulaire                 
   • Username: pharmacy_bastos_admin     
   • Password: testpass123                
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
3️⃣ Soumission du formulaire              
   POST /api/auth/login/                 
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
4️⃣ Backend vérifie                       
   • Username existe ?                    
   • Password correct ?                   
   • Type d'utilisateur ?                 
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
5️⃣ Backend retourne                      
   {                                      
     "user": {                            
       "id": 7,                           
       "username": "pharmacy_bastos_admin",
       "user_type": "pharmacy",           
       "pharmacy": 117,                   
       "pharmacy_name": "Pharmacie Bastos"
     },                                   
     "tokens": {                          
       "access": "eyJhbGci...",          
       "refresh": "eyJhbGci..."          
     },                                   
     "message": "Connexion réussie"      
   }                                      
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
6️⃣ Frontend sauvegarde dans localStorage 
   • token                                
   • refreshToken                         
   • user (JSON)                          
   • pharmacyId (si pharmacy)             
   • pharmacyName (si pharmacy)           
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
7️⃣ Redirection selon user_type           
   if (user_type === 'pharmacy')         
     navigate('/stocks') ✅              
   else if (user_type === 'admin')       
     navigate('/admin')                  
   else                                  
     navigate('/')                       
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
8️⃣ window.location.reload()              
   (MAJ du Header avec nom d'utilisateur)
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                        ▼
9️⃣ Arrivée sur /stocks                   
   StockManagementPage s'affiche         
   Dashboard de gestion des stocks       
```

---

## 🎯 Où Est la Redirection Vers le Dashboard ?

### Code dans LoginPage.js (Lignes 42-49)

```javascript
// Redirection selon le type d'utilisateur
if (user.user_type === 'pharmacy') {
  navigate('/stocks');          // ✅ Dashboard des pharmacies
} else if (user.user_type === 'admin') {
  navigate('/admin');            // Dashboard des admins
} else {
  navigate('/');                 // Accueil pour les clients
}
```

**✅ La redirection vers `/stocks` fonctionne correctement !**

---

## 🏥 Dashboard des Pharmacies : `/stocks`

### Qu'est-ce que `/stocks` ?

**C'est la page de gestion des stocks de la pharmacie.**

```
Route: /stocks
Component: StockManagementPage
Contenu: StockManager (composant de gestion)
```

### Fonctionnalités du Dashboard

D'après `StockManagementPage.js` :

1. **Protection d'accès**
   - Vérifie que l'utilisateur est connecté
   - Vérifie que `user_type === 'pharmacy'`
   - Sinon, redirige vers `/`

2. **Interface de gestion**
   - Affiche le composant `<StockManager />`
   - Permet de gérer les stocks de médicaments
   - Interface réservée aux pharmacies

### Code de Protection

```javascript
// StockManagementPage.js
function StockManagementPage() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/" replace />;  // Pas connecté
  }
  
  const user = JSON.parse(userStr);
  
  if (user.user_type !== 'pharmacy') {
    alert('Accès réservé aux pharmacies');
    return <Navigate to="/" replace />;  // Pas une pharmacie
  }
  
  return (
    <main className="main-content admin-mode">
      <StockManager />  {/* ✅ Dashboard affiché */}
    </main>
  );
}
```

---

## 🧪 Test Complet : Connexion d'une Pharmacie

### Via le Navigateur

1. **Ouvrir** : `http://localhost:3000/login`

2. **Remplir le formulaire**
   ```
   Nom d'utilisateur : pharmacy_bastos_admin
   Mot de passe      : testpass123
   ```

3. **Cliquer** : "Se connecter"

4. **Vérifications** :
   - ✅ Connexion réussie
   - ✅ Token sauvegardé dans localStorage
   - ✅ Redirection vers `/stocks`
   - ✅ Dashboard de gestion des stocks affiché
   - ✅ Header mis à jour : "👋 pharmacy_bastos_admin"
   - ✅ Lien "📦 Gérer mes Stocks" visible

### Via cURL (API Backend)

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"pharmacy_bastos_admin", "password":"testpass123"}'
```

**Réponse** :
```json
{
  "user": {
    "id": 7,
    "username": "pharmacy_bastos_admin",
    "email": "admin.bastos@pharmacy.cm",
    "user_type": "pharmacy",
    "pharmacy": 117,
    "pharmacy_name": "Pharmacie Bastos"
  },
  "tokens": {
    "access": "eyJhbGci...",
    "refresh": "eyJhbGci..."
  },
  "message": "Connexion réussie"
}
```

---

## 💡 Pourquoi Username et Pas Email ?

### Avantages du Username

| Critère | Username | Email |
|---------|----------|-------|
| **Unique** | ✅ Oui | ✅ Oui |
| **Court** | ✅ Facile à retenir | ❌ Peut être long |
| **Standard Django** | ✅ Par défaut | ⚠️ Nécessite config |
| **JWT Compatible** | ✅ Direct | ⚠️ Config nécessaire |
| **Changeable** | ✅ Email peut changer | ❌ Email = identifiant |
| **Professionnel** | ✅ Oui | ✅ Oui |

### Cas d'Usage

- **Username** : `pharmacy_bastos_admin` → Court, mémorisable
- **Email** : `admin.bastos@pharmacy.cm` → Plus long à taper

---

## 🔄 Si Vous Voulez Utiliser l'Email à la Place

### Option 1 : Modifier le Backend

**Fichier** : `backend/users/views.py`

```python
# Permettre connexion avec email OU username
class LoginView(APIView):
    def post(self, request):
        identifier = request.data.get('identifier')  # Email ou Username
        password = request.data.get('password')
        
        # Essayer de trouver l'utilisateur par email
        try:
            user = User.objects.get(email=identifier)
            username = user.username
        except User.DoesNotExist:
            # Sinon, essayer par username
            username = identifier
        
        # Authentifier
        user = authenticate(username=username, password=password)
        # ...
```

### Option 2 : Ajouter un Champ Alternatif

**Formulaire de connexion** :
```javascript
<input 
  type="text" 
  placeholder="Email ou Nom d'utilisateur"
  // ...
/>
```

**Mais cela nécessite de modifier le backend Django !**

---

## 🎯 Configuration Actuelle : Correcte et Fonctionnelle

### ✅ Ce qui fonctionne

1. **Authentification par username + password**
   - Standard Django
   - Sécurisé avec JWT
   - Tokens avec expiration

2. **Redirection automatique**
   - Pharmacy → `/stocks` ✅
   - Admin → `/admin` ✅
   - Client → `/` ✅

3. **Protection des routes**
   - `/stocks` accessible uniquement aux pharmacies
   - Vérification du token
   - Vérification du type d'utilisateur

4. **Persistance de session**
   - Token stocké dans localStorage
   - Refresh token pour renouvellement
   - User data accessible partout

---

## 📋 Récapitulatif des Comptes

### Comptes de Test Disponibles

| Username | Password | Type | Pharmacie | Redirection |
|----------|----------|------|-----------|-------------|
| `admin_centrale` | `admin123` | pharmacy | Centrale de Yaoundé | `/stocks` |
| `pharmacy_bastos_admin` | `testpass123` | pharmacy | Pharmacie Bastos | `/stocks` |
| *(tout nouveau client)* | *(choisi)* | customer | - | `/` |

---

## 🔍 Débogage : Vérifier la Redirection

### Dans le Navigateur

1. **Ouvrir la console** : F12 → Console

2. **Se connecter**

3. **Vérifier dans la console** :
   ```javascript
   console.log('✅ Connexion réussie:', user);
   // Devrait afficher les infos utilisateur
   ```

4. **Vérifier localStorage** :
   ```javascript
   localStorage.getItem('token')        // Token JWT
   localStorage.getItem('user')         // Objet user
   localStorage.getItem('pharmacyId')   // ID pharmacie
   localStorage.getItem('pharmacyName') // Nom pharmacie
   ```

5. **Vérifier la redirection** :
   - Après connexion, URL devrait être `/stocks`
   - Si URL reste `/login`, il y a un problème

### Problèmes Possibles

| Symptôme | Cause Possible | Solution |
|----------|----------------|----------|
| Reste sur `/login` | `navigate()` ne fonctionne pas | Vérifier React Router |
| Pas de redirection | `user_type` incorrect | Vérifier réponse API |
| Erreur 401 | Token invalide | Vérifier backend JWT config |
| Redirection vers `/` | Type !== pharmacy | Vérifier user.user_type |

---

## 🎓 Résumé

### Questions et Réponses

**Q1: Pourquoi on demande un username ?**  
✅ **R:** C'est le système d'authentification Django par défaut. Le username est l'identifiant unique. C'est standard et sécurisé.

**Q2: Où suis-je redirigé après connexion en tant que pharmacie ?**  
✅ **R:** Vous êtes automatiquement redirigé vers `/stocks` (Dashboard de gestion des stocks).

**Q3: Est-ce que je peux utiliser l'email à la place ?**  
⚠️ **R:** Actuellement non, mais c'est possible en modifiant le backend Django.

**Q4: Comment fonctionne la redirection ?**  
✅ **R:** Le code dans `LoginPage.js` vérifie le `user_type` et appelle `navigate('/stocks')` pour les pharmacies.

**Q5: Le dashboard des pharmacies, c'est quoi ?**  
✅ **R:** C'est la page `/stocks` avec le composant `StockManager` pour gérer les médicaments en stock.

---

## 🔐 Sécurité

### Mécanismes en Place

1. **JWT (JSON Web Tokens)**
   - Token d'accès (courte durée)
   - Token de rafraîchissement (longue durée)
   - Signature cryptographique

2. **Protection des routes**
   - Vérification du token avant accès
   - Vérification du type d'utilisateur
   - Redirection si non autorisé

3. **HTTPS recommandé en production**
   - Chiffrement des communications
   - Protection contre man-in-the-middle

---

## 📚 Fichiers Concernés

| Fichier | Rôle | Ligne Clé |
|---------|------|-----------|
| `LoginPage.js` | Formulaire de connexion | 42-49 (redirection) |
| `api.js` | Appel API login | 450-500 |
| `StockManagementPage.js` | Dashboard pharmacies | 6-30 (protection) |
| `App.js` | Routes de l'app | Route `/stocks` |
| `backend/users/views.py` | API login backend | LoginView |

---

**Conclusion** : Votre système d'authentification fonctionne parfaitement ! Le username est l'identifiant standard, et les pharmacies sont bien redirigées vers leur dashboard `/stocks`. 🚀

---

**Auteur** : GitHub Copilot  
**Date** : 25 novembre 2025  
**Version** : 1.0.0 - Explication Complète
