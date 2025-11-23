# Guide de Test - Intégration API FindPharma
**Date**: 23 novembre 2025  
**URL**: http://localhost:3000

## 🎯 Objectif
Tester l'intégration complète entre le frontend React et le backend Django en conditions réelles.

## ✅ Pré-requis
- [x] Backend Django actif sur port 8000
- [x] Frontend React actif sur port 3000
- [x] Navigateur ouvert sur http://localhost:3000

## 📋 Tests à Effectuer

### Test 1: Interface Initiale
**Vérifications**:
- [ ] La page se charge sans erreur
- [ ] Le titre "FindPharma" est visible
- [ ] Le champ de recherche est présent
- [ ] Le bouton "Ma Position" est visible
- [ ] La carte Leaflet s'affiche correctement

**Console Browser** (F12 → Console):
- [ ] Aucune erreur JavaScript
- [ ] Aucune erreur CORS
- [ ] Aucune erreur 404

---

### Test 2: Recherche de Médicament (Backend Réel)

#### 2.1 Recherche avec résultats
**Actions**:
1. Taper "**Paracétamol**" dans le champ de recherche
2. Cliquer sur "Rechercher" ou appuyer sur Entrée
3. Observer les résultats

**Résultats attendus**:
- [ ] Message "Recherche de médicaments: Paracétamol..." s'affiche brièvement
- [ ] Liste de résultats s'affiche (2 pharmacies attendues)
- [ ] Chaque résultat contient:
  - [ ] Nom du médicament (Paracétamol)
  - [ ] Dosage (500mg)
  - [ ] Forme (Comprimé)
  - [ ] Prix (ex: 2.28 FCFA)
  - [ ] Stock disponible (ex: 142 unités)
  - [ ] Nom de la pharmacie
  - [ ] Adresse
  - [ ] Bouton "Voir l'itinéraire"
- [ ] Marqueurs apparaissent sur la carte
- [ ] Cliquer sur un marqueur affiche un popup avec infos

**Console Browser**:
- [ ] Vérifier requête: `GET http://127.0.0.1:8000/api/search/?q=Paracétamol`
- [ ] Status: 200 OK
- [ ] Aucune erreur CORS

**Exemple de réponse attendue**:
```json
{
  "query": "Paracétamol",
  "count": 2,
  "results": [
    {
      "name": "Paracétamol",
      "dosage": "500mg",
      "pharmacies": [
        {
          "name": "Pharmacie Omnisports",
          "stock": {
            "quantity": 142,
            "price": "2.28"
          }
        }
      ]
    }
  ]
}
```

#### 2.2 Recherche sans résultats
**Actions**:
1. Taper "**XYZ123NonExistant**" dans le champ
2. Cliquer sur "Rechercher"

**Résultats attendus**:
- [ ] Message "Aucun médicament trouvé"
- [ ] Liste de résultats vide
- [ ] Pas d'erreur JavaScript

---

### Test 3: Géolocalisation (Backend Réel)

#### 3.1 Autoriser la géolocalisation
**Actions**:
1. Cliquer sur le bouton "📍 Ma Position"
2. Autoriser l'accès à la localisation (popup navigateur)
3. Observer les résultats

**Résultats attendus**:
- [ ] Popup navigateur demande autorisation géolocalisation
- [ ] Après autorisation, message "Recherche des pharmacies proches..."
- [ ] Liste de pharmacies s'affiche (8 pharmacies attendues dans rayon 5km)
- [ ] Chaque pharmacie contient:
  - [ ] Nom de la pharmacie
  - [ ] Adresse
  - [ ] Distance (ex: "1.03 km" ou "0 m")
  - [ ] Téléphone
  - [ ] Horaires d'ouverture
  - [ ] Bouton "Voir l'itinéraire"
- [ ] Carte se centre sur position utilisateur
- [ ] Marqueur bleu indique position utilisateur
- [ ] Marqueurs rouges indiquent pharmacies proches

**Console Browser**:
- [ ] Vérifier requête: `GET http://127.0.0.1:8000/api/nearby/?latitude=X.XXX&longitude=Y.YYY&radius=5000`
- [ ] Status: 200 OK
- [ ] Logs de géolocalisation: latitude et longitude affichées

**Exemple de réponse attendue**:
```json
{
  "count": 8,
  "radius_km": 5000.0,
  "pharmacies": [
    {
      "name": "Pharmacie Centrale de Yaoundé",
      "latitude": 3.848,
      "longitude": 11.5021,
      "distance": 0.0
    }
  ]
}
```

#### 3.2 Refuser la géolocalisation
**Actions**:
1. Cliquer sur "📍 Ma Position"
2. Refuser l'accès à la localisation

**Résultats attendus**:
- [ ] Message d'erreur affiché: "Impossible d'obtenir votre position"
- [ ] Aucune erreur JavaScript critique
- [ ] Application reste fonctionnelle

---

### Test 4: Interaction Carte

**Actions**:
1. Effectuer une recherche (Paracétamol)
2. Observer la carte Leaflet

**Vérifications carte**:
- [ ] Carte centrée sur Yaoundé (lat: 3.848, lon: 11.502)
- [ ] Zoom approprié
- [ ] Marqueurs affichés pour chaque pharmacie
- [ ] Cliquer sur un marqueur:
  - [ ] Popup s'ouvre
  - [ ] Nom de la pharmacie affiché
  - [ ] Informations du stock affichées
- [ ] Contrôles de zoom fonctionnent (+/-)
- [ ] Glisser-déposer pour déplacer la carte fonctionne

---

### Test 5: Gestion d'Erreurs

#### 5.1 Backend Offline
**Actions**:
1. Arrêter le backend Django: `pkill -f "manage.py runserver"`
2. Effectuer une recherche

**Résultats attendus**:
- [ ] Message d'erreur affiché
- [ ] Message mentionne "serveur backend"
- [ ] Application ne plante pas

#### 5.2 Backend Online
**Actions**:
1. Redémarrer backend: `cd backend && python manage.py runserver &`
2. Re-tester recherche

**Résultats attendus**:
- [ ] Application fonctionne normalement

---

### Test 6: Responsive Design (Optionnel)

**Actions**:
1. Ouvrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Tester différentes résolutions:
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)

**Vérifications**:
- [ ] Layout s'adapte correctement
- [ ] Boutons restent cliquables
- [ ] Carte reste visible et fonctionnelle
- [ ] Texte reste lisible

---

## 🐛 Problèmes Courants et Solutions

### Erreur CORS
**Symptôme**: `Access to fetch at 'http://127.0.0.1:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:
```python
# backend/FindPharma/settings.py
CORS_ALLOW_ALL_ORIGINS = True  # Vérifier que c'est activé
```

### Erreur 404 sur API
**Symptôme**: `GET http://127.0.0.1:8000/api/search/ 404 (Not Found)`

**Solution**:
- Vérifier que backend est lancé
- Vérifier `REACT_APP_API_URL` dans `frontend/.env`

### Géolocalisation refusée
**Symptôme**: `User denied geolocation`

**Solution**:
- Navigateur bloque géolocalisation sur localhost
- Utiliser Chrome/Firefox avec `--unsafely-treat-insecure-origin-as-secure`
- Ou tester avec coordonnées hardcodées

### Marqueurs ne s'affichent pas
**Symptôme**: Pharmacies listées mais rien sur la carte

**Solution**:
- Vérifier console pour erreurs Leaflet
- Vérifier que `latitude` et `longitude` sont présents dans données
- Vérifier que Leaflet CSS est chargé

---

## ✅ Checklist Finale

### Fonctionnalités
- [ ] Recherche médicament fonctionne
- [ ] Géolocalisation fonctionne
- [ ] Carte s'affiche correctement
- [ ] Marqueurs affichés et cliquables
- [ ] Popups contiennent infos correctes
- [ ] Distances calculées correctement
- [ ] Prix affichés au bon format

### Qualité
- [ ] Aucune erreur dans console browser
- [ ] Aucune erreur CORS
- [ ] Messages d'erreur utilisateur clairs
- [ ] Loading states visibles
- [ ] Performance acceptable (<3s chargement)

### UX
- [ ] Interface intuitive
- [ ] Boutons facilement cliquables
- [ ] Feedback visuel sur actions
- [ ] Messages informatifs
- [ ] Pas de bugs visuels

---

## 📊 Résultats des Tests

### ✅ Tests Réussis
(À remplir pendant les tests)
- [ ] Test 1 - Interface initiale
- [ ] Test 2.1 - Recherche avec résultats
- [ ] Test 2.2 - Recherche sans résultats
- [ ] Test 3.1 - Géolocalisation autorisée
- [ ] Test 3.2 - Géolocalisation refusée
- [ ] Test 4 - Interaction carte
- [ ] Test 5 - Gestion erreurs

### ❌ Tests Échoués
(Noter les problèmes rencontrés)
- 

### 🐛 Bugs Identifiés
(À corriger avant merge)
- 

---

## 📝 Notes de Test

**Navigateur utilisé**: _____________  
**Version**: _____________  
**Système d'exploitation**: Linux (Kali)  
**Date/Heure**: 23 novembre 2025  

**Observations**:
(Ajouter notes pendant les tests)
- 
- 
-

---

## 🚀 Prochaines Étapes

### Si tous les tests passent ✅
```bash
# Marquer le todo comme complété
# Passer au commit final
git add -A
git commit -m "test: Validation complète intégration frontend-backend"
git push origin restructure-project

# Créer Pull Request pour merge vers main
```

### Si des bugs sont trouvés ❌
1. Noter les bugs dans la section "Bugs Identifiés"
2. Créer un fichier de bug report
3. Corriger les bugs un par un
4. Re-tester après chaque correction
5. Revenir à ce guide une fois corrigé

---

## 🎓 Conseils de Test

1. **Testez méthodiquement**: Un test à la fois
2. **Utilisez la console**: F12 pour voir requêtes/erreurs
3. **Network tab**: Observer appels API en temps réel
4. **Prenez des screenshots**: Documenter bugs visuels
5. **Testez cas limites**: Requêtes vides, caractères spéciaux, etc.
6. **Testez navigation**: Back/Forward browser
7. **Testez refresh**: F5 pour recharger page

---

*Guide de test généré pour FindPharma - Intégration API*  
*Pour questions: consulter INTEGRATION_API_REPORT.md*
