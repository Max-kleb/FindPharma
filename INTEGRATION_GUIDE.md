# 🚀 Guide d'Intégration Frontend-Backend - FindPharma

## ✅ État Actuel - Prêt pour l'Intégration

**Date** : 24 novembre 2025  
**Statut Backend** : ✅ Opérationnel sur http://127.0.0.1:8000  
**Statut Base de Données** : ✅ Peuplée avec données de test  
**Statut Frontend** : ⏳ Prêt à démarrer

---

## 📊 Base de Données Peuplée

✅ **8 Pharmacies créées** :
- Pharmacie Centrale de Yaoundé
- Pharmacie du Marché Central
- Pharmacie de la Paix
- Pharmacie Bastos
- Pharmacie Mvog-Ada
- Pharmacie Messa
- Pharmacie Nlongkak
- Pharmacie Omnisports

✅ **23 Médicaments créés** :
- Paracétamol (500mg, 1000mg)
- Ibuprofène, Aspirine
- Antibiotiques (Amoxicilline, Azithromycine, Ciprofloxacine)
- Anti-paludéens (Artemether-Lumefantrine, Artesunate, Quinine)
- Anti-allergiques (Cétirizine, Loratadine)
- Digestifs (Oméprazole, Métoclopramide, Smecta)
- Vitamines (Vitamine C, Fer, Multivitamines)
- Antihypertenseurs (Amlodipine, Losartan)
- Antidiabétiques (Metformine 500mg, 850mg)

✅ **Stocks créés** :
- Chaque pharmacie a entre 15-20 médicaments en stock
- Prix réalistes en XAF (500-15000 FCFA)
- Quantités variables (10-200 unités)
- Disponibilité aléatoire

---

## 🔧 Configuration Frontend

### Variables d'Environnement (`.env`)

```properties
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_DEFAULT_LAT=3.8480
REACT_APP_DEFAULT_LNG=11.5021
REACT_APP_DEFAULT_RADIUS=5000
```

### Dépendances Installées

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-leaflet": "^5.0.0",
  "leaflet": "^1.9.4"
}
```

---

## 🚀 Démarrage de l'Intégration

### Terminal 1 - Backend (déjà en cours)

```bash
# Le serveur Django tourne déjà sur http://127.0.0.1:8000
# Pour vérifier :
curl http://127.0.0.1:8000/api/docs/
```

### Terminal 2 - Frontend (à démarrer maintenant)

```bash
cd /home/mitou/FindPharma/frontend
npm start
```

Le frontend démarrera sur **http://localhost:3000/**

---

## 🧪 Tests à Effectuer

### 1. Test d'Accès à l'Application

- [ ] L'application React se charge sans erreur
- [ ] La page d'accueil s'affiche
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] La carte Leaflet se charge

### 2. Test US 1 - Recherche de Médicaments

**Scénario** :
1. Entrer "paracétamol" dans la barre de recherche
2. Cliquer sur "Rechercher"

**Résultat attendu** :
- ✅ Liste des pharmacies qui ont du Paracétamol
- ✅ Prix affichés en FCFA
- ✅ Distances calculées depuis Yaoundé
- ✅ Stocks disponibles affichés

**Test manuel** :
```bash
# Vérifier l'endpoint backend
curl "http://127.0.0.1:8000/api/search/?medicine=paracetamol"
```

### 3. Test US 2 - Pharmacies à Proximité

**Scénario** :
1. Activer la géolocalisation (ou utiliser position par défaut)
2. Sélectionner un rayon de recherche (ex: 5km)
3. Cliquer sur "Pharmacies proches"

**Résultat attendu** :
- ✅ Carte centrée sur Yaoundé (3.8480, 11.5021)
- ✅ Marqueurs des pharmacies affichés
- ✅ Liste des 8 pharmacies avec distances
- ✅ Possibilité de cliquer sur une pharmacie

**Test manuel** :
```bash
# Vérifier l'endpoint backend
curl "http://127.0.0.1:8000/api/nearby/?lat=3.8480&lon=11.5021&radius=5000"
```

### 4. Test US 4 - Authentification

#### 4.1 Inscription

**Scénario** :
1. Cliquer sur "S'inscrire" ou "Connexion"
2. Choisir "Créer un compte"
3. Remplir le formulaire :
   - Nom d'utilisateur : `test_client`
   - Email : `test@findpharma.cm`
   - Mot de passe : `TestPass123!`
   - Confirmer le mot de passe : `TestPass123!`
   - Type : Client
   - Téléphone : `+237600000001`
4. Cliquer sur "S'inscrire"

**Résultat attendu** :
- ✅ Message "Inscription réussie"
- ✅ Utilisateur connecté automatiquement
- ✅ Token JWT stocké dans localStorage
- ✅ Bouton "Mon profil" visible
- ✅ Nom d'utilisateur affiché dans le header

**Test manuel** :
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_client2",
    "email": "test2@findpharma.cm",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "user_type": "customer",
    "phone": "+237600000002"
  }'
```

#### 4.2 Connexion

**Scénario** :
1. Se déconnecter
2. Cliquer sur "Connexion"
3. Entrer email et mot de passe
4. Cliquer sur "Se connecter"

**Résultat attendu** :
- ✅ Connexion réussie
- ✅ Token récupéré
- ✅ Redirection vers page d'accueil
- ✅ État utilisateur mis à jour

**Test manuel** :
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@findpharma.cm",
    "password": "TestPass123!"
  }'
```

#### 4.3 Profil Utilisateur

**Scénario** :
1. Connecté, cliquer sur "Mon profil"
2. Voir les informations du compte

**Résultat attendu** :
- ✅ Nom, email, téléphone affichés
- ✅ Type d'utilisateur affiché
- ✅ Date d'inscription visible

### 5. Test US 5 - Panier et Réservation

#### 5.1 Ajout au Panier

**Scénario** :
1. Rechercher "paracétamol"
2. Choisir une pharmacie
3. Sélectionner une quantité (ex: 2)
4. Cliquer sur "Ajouter au panier"

**Résultat attendu** :
- ✅ Message "Ajouté au panier"
- ✅ Badge du panier mis à jour (icône panier)
- ✅ Compteur d'articles incrémenté

**Test manuel** :
```bash
TOKEN="[VOTRE_ACCESS_TOKEN]"
curl -X POST http://127.0.0.1:8000/api/cart/carts/add_item/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "pharmacy_id": 1,
    "quantity": 2
  }'
```

#### 5.2 Voir le Panier

**Scénario** :
1. Cliquer sur l'icône panier
2. Voir la liste des articles

**Résultat attendu** :
- ✅ Liste des médicaments ajoutés
- ✅ Nom de la pharmacie pour chaque article
- ✅ Prix unitaire et total
- ✅ Quantité modifiable
- ✅ Bouton "Retirer" fonctionnel
- ✅ Total général calculé

#### 5.3 Créer une Réservation

**Scénario** :
1. Dans le panier, cliquer sur "Réserver"
2. Confirmer les informations de contact
3. Valider la réservation

**Résultat attendu** :
- ✅ Réservation créée
- ✅ Numéro de confirmation affiché
- ✅ Panier vidé
- ✅ Message de succès

### 6. Test US 3 - Gestion des Stocks (Compte Pharmacie)

#### 6.1 Créer un Compte Pharmacie

**Prérequis** : Avoir une pharmacie créée (ID=1 par exemple)

**Test manuel** :
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_centrale",
    "email": "admin@pharmaciecentrale.cm",
    "password": "AdminPass123!",
    "password2": "AdminPass123!",
    "user_type": "pharmacy",
    "pharmacy_id": 1,
    "phone": "+237222234567"
  }'
```

#### 6.2 Accéder au Dashboard Pharmacie

**Scénario** :
1. Se connecter avec le compte pharmacie
2. Accéder au "Dashboard Pharmacie" ou "Gestion des stocks"

**Résultat attendu** :
- ✅ Liste des stocks de la pharmacie
- ✅ Possibilité d'ajouter un médicament
- ✅ Possibilité de modifier quantité/prix
- ✅ Possibilité de marquer disponible/indisponible
- ✅ Possibilité de supprimer un stock

#### 6.3 Ajouter un Stock

**Scénario** :
1. Cliquer sur "Ajouter un médicament"
2. Sélectionner un médicament (ex: ID=5, Amoxicilline)
3. Entrer quantité : 50
4. Entrer prix : 2500
5. Cocher "Disponible"
6. Valider

**Résultat attendu** :
- ✅ Stock ajouté
- ✅ Liste mise à jour
- ✅ Message de succès

**Test manuel** :
```bash
TOKEN="[PHARMACY_ACCESS_TOKEN]"
curl -X POST http://127.0.0.1:8000/api/pharmacies/1/stocks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine": 5,
    "quantity": 50,
    "price": 2500.00,
    "is_available": true
  }'
```

#### 6.4 Modifier un Stock

**Scénario** :
1. Cliquer sur "Modifier" sur un stock existant
2. Changer la quantité ou le prix
3. Valider

**Résultat attendu** :
- ✅ Stock mis à jour
- ✅ Changements visibles immédiatement

---

## 🐛 Dépannage

### Problème : Frontend ne se connecte pas au backend

**Symptômes** :
- Erreurs CORS dans la console
- Requêtes qui échouent
- Message "Network Error"

**Solution** :
1. Vérifier que le backend tourne : `curl http://127.0.0.1:8000/`
2. Vérifier la configuration CORS dans `backend/FindPharma/settings.py`
3. S'assurer que `.env` contient `REACT_APP_API_URL=http://127.0.0.1:8000`

### Problème : Token JWT invalide

**Symptômes** :
- Erreur 401 Unauthorized
- Déconnexion automatique

**Solution** :
1. Se reconnecter (token expiré après 60 minutes)
2. Vérifier que le token est bien dans localStorage
3. Utiliser le refresh token pour obtenir un nouveau access token

### Problème : Panier vide après rechargement

**Solution** :
- Le panier est lié au compte utilisateur côté backend
- Se reconnecter pour récupérer le panier

### Problème : Carte ne s'affiche pas

**Solution** :
1. Vérifier que Leaflet CSS est chargé
2. Vérifier la connexion internet (tiles de la carte)
3. Vérifier les coordonnées dans `.env`

---

## 📋 Checklist d'Intégration Finale

### Backend ✅
- [x] Serveur Django en cours d'exécution
- [x] Base de données migrée
- [x] 8 pharmacies créées
- [x] 23 médicaments créés
- [x] Stocks peuplés
- [x] Documentation API accessible
- [x] CORS configuré

### Frontend ⏳
- [ ] Serveur React démarré sur localhost:3000
- [ ] Page d'accueil charge sans erreur
- [ ] Connexion backend établie
- [ ] Pas d'erreurs dans la console

### Tests Fonctionnels ⏳
- [ ] Recherche de médicaments fonctionne
- [ ] Pharmacies proches affichées sur la carte
- [ ] Inscription d'un utilisateur réussie
- [ ] Connexion fonctionne
- [ ] Profil utilisateur accessible
- [ ] Ajout au panier fonctionne
- [ ] Panier affiche les articles
- [ ] Réservation peut être créée
- [ ] Dashboard pharmacie accessible (compte pharmacie)
- [ ] Gestion des stocks fonctionne (compte pharmacie)

---

## 🎯 Prochaines Étapes

1. **Démarrer le frontend** :
   ```bash
   cd /home/mitou/FindPharma/frontend
   npm start
   ```

2. **Ouvrir le navigateur** : http://localhost:3000

3. **Tester chaque US** selon les scénarios ci-dessus

4. **Documenter les bugs** éventuels

5. **Valider l'intégration complète**

---

## 📞 Commandes Utiles

### Backend
```bash
# Voir les logs du serveur
tail -f /tmp/django_server.log

# Arrêter le serveur
pkill -f "manage.py runserver"

# Redémarrer le serveur
cd /home/mitou/FindPharma/backend
python manage.py runserver

# Accéder à la console Django
python manage.py shell
```

### Frontend
```bash
# Démarrer le frontend
npm start

# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install

# Build de production
npm run build
```

### Base de Données
```bash
# Repeupler la base
cd /home/mitou/FindPharma/backend
printf "o\n" | python populate_database.py

# Créer un superutilisateur
python manage.py createsuperuser

# Accéder à l'admin Django
# URL: http://127.0.0.1:8000/admin/
```

---

**Prêt pour l'intégration ! 🚀**

Date de préparation : 24 novembre 2025  
Backend : ✅ Opérationnel  
Base de données : ✅ Peuplée  
Frontend : ⏳ Prêt à démarrer
