# 🧪 Plan de Test Frontend FindPharma

**Date** : 23 novembre 2025  
**Version** : Post-restructuration  
**Branche** : restructure-project

---

## ✅ Tests à Effectuer

### 1. Installation et Démarrage

- [x] Node.js et npm installés (v20.19.5 / v9.2.0)
- [ ] `npm install` réussi
- [ ] `npm start` démarre sans erreur
- [ ] Application accessible sur http://localhost:3000

### 2. Interface Utilisateur

- [ ] Header s'affiche correctement
- [ ] Section de recherche visible
- [ ] Bouton de géolocalisation présent
- [ ] Carte Leaflet s'affiche

### 3. Fonctionnalité Géolocalisation

- [ ] Clic sur bouton géolocalisation fonctionne
- [ ] Navigateur demande permission
- [ ] Position utilisateur détectée
- [ ] Pharmacies proches s'affichent (données simulées)

### 4. Fonctionnalité Recherche

- [ ] Input de recherche fonctionnel
- [ ] Recherche "Paracétamol" lance la recherche
- [ ] Résultats s'affichent (données simulées)
- [ ] Liste des pharmacies visible

### 5. Carte Interactive

- [ ] Carte Leaflet chargée
- [ ] Zoom fonctionnel
- [ ] Marqueurs visibles
- [ ] Clic sur marqueur affiche popup

### 6. Responsive Design

- [ ] Affichage correct sur écran large
- [ ] Affichage correct sur mobile (si testable)

---

## 🔍 Résultats des Tests

### Test 1: Installation

**Commande** : `npm install`

```bash
Status: ⏳ En cours...
```

**Attendu** :
- Installation de ~1500 packages
- Aucune erreur critique
- Warnings acceptables

### Test 2: Démarrage

**Commande** : `npm start`

```bash
Status: ⏳ Attente fin installation
```

**Attendu** :
- Compilation webpack réussie
- Serveur sur port 3000
- Ouverture automatique du navigateur

---

## 📝 Notes

### Données Simulées Actuelles

Le frontend contient des données hardcodées :

```javascript
// Dans App.js
const nearbyPharmacies = [
  {
    id: 1,
    name: "Pharmacie de la Mairie",
    address: "Rue de la Mairie, Yaoundé",
    stock: "Disponible",
    distance: "0.5 km",
    lat: 3.8550,
    lng: 11.5100
  },
  {
    id: 2,
    name: "Grande Pharmacie Centrale",
    address: "Boulevard du 20 Mai, Yaoundé",
    stock: "Disponible",
    distance: "1.2 km",
    lat: 3.8650,
    lng: 11.5150
  },
  {
    id: 3,
    name: "Pharmacie d'Urgence",
    address: "Carrefour Bastos, Yaoundé",
    stock: "Disponible",
    distance: "2.0 km",
    lat: 3.8750,
    lng: 11.5050
  }
];
```

### Prochaines Étapes Après Tests

Si les tests passent :
1. ✅ Merger restructure-project → main
2. 🔧 Intégration API backend
3. 🌐 Configuration CORS
4. 🔗 Connexion frontend-backend

---

## 🐛 Problèmes Rencontrés

### Problème 1: node_modules corrompus

**Symptôme** :
```
react-scripts: not found
```

**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
```

**Status** : 🔧 En cours de résolution

---

## ✨ Checklist Avant Merge

- [ ] Frontend démarre sans erreur
- [ ] Interface utilisateur fonctionnelle
- [ ] Aucune erreur console JavaScript
- [ ] Géolocalisation testée
- [ ] Recherche testée
- [ ] Carte interactive testée
- [ ] Documentation à jour
- [ ] README.md vérifié

---

**Testeur** : Max-kleb  
**Environnement** : Kali Linux, Node v20.19.5
