# 🎯 Guide Rapide - Tester FindPharma

## 🚀 Démarrage Rapide

### Prérequis : Serveurs Lancés

```bash
# Terminal 1 - Backend Django
cd /home/mitou/FindPharma/backend
/home/mitou/FindPharma/environments/venv_system/bin/python manage.py runserver

# Terminal 2 - Frontend React  
cd /home/mitou/FindPharma/frontend
npm start
```

**Application** : http://localhost:3000/

---

## ✅ Tests Essentiels (5 minutes)

### 1️⃣ Test Authentification - Connexion

1. Ouvrir : http://localhost:3000/
2. Cliquer : **"Se connecter"** (en haut à droite)
3. Entrer :
   - Username : `admin_centrale`
   - Password : `admin123`
4. Cliquer : **"Se connecter"**

**✅ Résultat attendu** :
- Modal se ferme
- Header affiche : "👋 admin_centrale"
- Nouveau lien : **"📦 Gérer mes Stocks"**

---

### 2️⃣ Test Route Protégée - Gestion des Stocks

1. Après connexion, cliquer : **"📦 Gérer mes Stocks"**
   OU aller à : http://localhost:3000/stocks

**✅ Résultat attendu** :
- Page affiche : "📦 Gestion des Stocks"
- Sous-titre : "Pharmacie Centrale de Yaoundé"
- Bouton : "➕ Ajouter un médicament"
- Tableau des stocks

---

### 3️⃣ Test CRUD - Ajouter un Médicament

1. Sur `/stocks`, cliquer : **"➕ Ajouter un médicament"**
2. Sélectionner un médicament dans le dropdown
3. Entrer :
   - Quantité : `100`
   - Prix : `2500`
4. Cocher : "Disponible à la vente"
5. Cliquer : **"Ajouter"**

**✅ Résultat attendu** :
- Message vert : "✅ Stock ajouté avec succès"
- Nouveau stock apparaît dans le tableau

---

### 4️⃣ Test Modification - Changer Quantité

1. Dans un stock du tableau, changer la quantité
   - Ex: `100` → `150`
2. Observer

**✅ Résultat attendu** :
- Sauvegarde automatique après saisie
- Message succès bref

---

### 5️⃣ Test Inscription - Nouveau Compte

1. Se déconnecter (si connecté)
2. Cliquer : **"S'inscrire"**
3. Remplir :
   - Username : `test_user_123`
   - Email : `test@example.com`
   - Password : `password123`
   - Type : **Client**
4. Cliquer : **"S'inscrire"**

**✅ Résultat attendu** :
- Inscription réussie
- Connexion automatique
- Header affiche : "👋 test_user_123"

---

## 🔍 Vérifications Console

### Après Connexion

Ouvrir la console (F12) et taper :

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

---

## 🎯 Checklist Rapide

**US 4 - Authentification** :
- [ ] Modal connexion s'ouvre
- [ ] Connexion avec admin_centrale fonctionne
- [ ] Header se met à jour (nom + lien stocks)
- [ ] Token sauvegardé dans localStorage
- [ ] Modal inscription s'ouvre
- [ ] Champ username présent
- [ ] Inscription crée un nouveau compte
- [ ] Déconnexion nettoie localStorage

**US 3 - Gestion Stocks** :
- [ ] Route /stocks protégée (redirectiion si non connecté)
- [ ] Accès OK pour pharmacie
- [ ] Tableau stocks s'affiche
- [ ] Ajout de stock fonctionne
- [ ] Modification quantité fonctionne
- [ ] Toggle disponibilité fonctionne
- [ ] Suppression fonctionne

---

## 📊 Statut d'Implémentation

| US | Fonctionnalité | Backend | Frontend | Intégré | Testable |
|----|---------------|---------|----------|---------|----------|
| US 1 | Pharmacies proches | ✅ | ✅ | ✅ | ✅ |
| US 2 | Recherche médicaments | ✅ | ✅ | ✅ | ✅ |
| US 3 | Gestion stocks | ✅ | ✅ | ✅ | ✅ |
| US 4 | Authentification | ✅ | ✅ | ✅ | ✅ |
| US 5 | Panier | ✅ | ✅ | ⚠️ | ⚠️ |
| US 6 | Réservation | ✅ | ⚠️ | ⚠️ | ⚠️ |

**Légende** :
- ✅ : Complet et fonctionnel
- ⚠️ : Partiel ou à vérifier
- ❌ : Non implémenté

---

## 🎊 Résumé

**L'application FindPharma est maintenant complètement testable !**

**URL principale** : http://localhost:3000/

**Compte test** : `admin_centrale / admin123`

**Tout est testable directement dans l'interface React, sans fichiers HTML externes.**

**Temps de test complet** : 5-10 minutes

**Documentation complète** : GUIDE_TEST_APPLICATION.md

---

## 📞 Besoin d'Aide ?

**Si problème de connexion** :
- Vérifier que les 2 serveurs tournent (backend port 8000, frontend port 3000)
- Console F12 pour voir les erreurs

**Si /stocks redirige** :
- Se connecter d'abord avec admin_centrale
- Vérifier localStorage : `localStorage.getItem('user')`

**Si erreur "Identifiants invalides"** :
- Backend tourne ?
- Mot de passe correct : `admin123`

---

**Bon test ! 🚀**

