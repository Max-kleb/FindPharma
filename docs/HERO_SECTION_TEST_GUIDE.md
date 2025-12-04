# 🧪 Guide de Test - Hero Section

## 🎯 Objectif
Vérifier que la nouvelle section Hero fonctionne correctement sur la page d'accueil avec affichage conditionnel des CTAs.

---

## ✅ Tests Fonctionnels

### Test 1 : Affichage pour Utilisateur Non Connecté

**Étapes :**
1. Ouvrir le navigateur sur `http://localhost:3000`
2. Ouvrir la console (F12)
3. Exécuter : `localStorage.removeItem('token')`
4. Rafraîchir la page (F5)

**Résultats attendus :**
- ✅ Section Hero visible en haut de la page
- ✅ Badge vert "⚕️ Trouvez vos médicaments rapidement"
- ✅ Titre principal avec gradient : "Trouvez la pharmacie la plus proche..."
- ✅ 4 fonctionnalités affichées (Recherche, Géolocalisation, Prix, Réservation)
- ✅ **2 boutons CTA visibles** :
  - Bouton vert "Créer un compte"
  - Bouton blanc bordure verte "Se connecter"
- ✅ Illustration avec 3 cartes animées à droite
- ✅ Section statistiques (500+, 10 000+, 50 000+, 24/7)
- ✅ Section "Comment ça marche ?" avec 4 étapes
- ✅ Section avantages (4 cartes)
- ✅ **CTA final visible** : "Prêt à commencer ?"

---

### Test 2 : Affichage pour Utilisateur Connecté

**Étapes :**
1. Se connecter avec un compte existant
2. Vérifier que `localStorage.token` existe
3. Rafraîchir la page

**Résultats attendus :**
- ✅ Section Hero visible en haut de la page
- ✅ Tout le contenu présent (titre, features, stats, etc.)
- ❌ **Boutons CTA masqués** (ni "Créer un compte" ni "Se connecter")
- ❌ **CTA final masqué** ("Prêt à commencer ?")
- ✅ Section de recherche accessible immédiatement après le Hero

---

### Test 3 : Navigation des Boutons

**Étapes :**
1. Se déconnecter (ou supprimer le token)
2. Cliquer sur "Créer un compte"

**Résultats attendus :**
- ✅ Redirection vers `/register`
- ✅ Formulaire d'inscription affiché

**Étapes :**
3. Retour sur la page d'accueil
4. Cliquer sur "Se connecter"

**Résultats attendus :**
- ✅ Redirection vers `/login`
- ✅ Formulaire de connexion affiché

**Étapes :**
5. Retour sur la page d'accueil
6. Scroller jusqu'au CTA final
7. Cliquer sur "Créer un compte gratuitement"

**Résultats attendus :**
- ✅ Redirection vers `/register`

---

## 🎨 Tests Visuels

### Test 4 : Animations

**Étapes :**
1. Rafraîchir la page
2. Observer les animations

**Résultats attendus :**
- ✅ 3 cercles flottent doucement en arrière-plan (animation float)
- ✅ 3 cartes apparaissent progressivement (slideInRight) :
  - Carte 1 (pharmacie) apparaît en premier
  - Carte 2 (médicament) après un délai
  - Carte 3 (position) en dernier
- ✅ Hover sur les cartes : décalage vers la gauche + ombre plus forte

**Étapes :**
3. Hover sur les éléments interactifs

**Résultats attendus :**
- ✅ Bouton "Créer un compte" : élévation + ombre
- ✅ Flèche "→" se déplace vers la droite au hover
- ✅ Cartes de features : élévation au hover
- ✅ Statistiques : élévation au hover
- ✅ Étapes "Comment ça marche" : élévation au hover
- ✅ Avantages : élévation + bordure verte au hover

---

### Test 5 : Responsive Design

**Test Desktop (> 1024px) :**
- ✅ Grid 2 colonnes (texte à gauche, illustration à droite)
- ✅ Stats en 4 colonnes
- ✅ Avantages en 2 colonnes
- ✅ Étapes en ligne horizontale avec flèches "→"

**Test Tablette (768px - 1024px) :**
1. Réduire la fenêtre à 900px de largeur

**Résultats attendus :**
- ✅ Grid 1 colonne (texte au-dessus, illustration en dessous)
- ✅ Stats en 2 colonnes (2x2)
- ✅ Avantages en 1 colonne
- ✅ Étapes en colonne verticale
- ✅ Flèches pivotées (90°) entre les étapes

**Test Mobile (< 768px) :**
1. Réduire la fenêtre à 400px de largeur (ou ouvrir en mode responsive mobile)

**Résultats attendus :**
- ✅ Titre réduit (36px au lieu de 56px)
- ✅ Features en 1 colonne
- ✅ Boutons CTA en full-width (100%)
- ✅ Stats en 1 colonne
- ✅ Illustration réduite (400px de hauteur)
- ✅ Cartes de l'illustration sans margin-left
- ✅ Padding réduit sur toutes les sections

---

## 🔍 Tests de Contenu

### Test 6 : Textes et Icônes

**Vérifier que tous les textes sont présents :**
- ✅ Badge : "⚕️ Trouvez vos médicaments rapidement"
- ✅ Titre : "Trouvez la pharmacie la plus proche avec vos médicaments"
- ✅ Description : "FindPharma vous aide à localiser..."

**Features (4) :**
- ✅ 🔍 Recherche intelligente
- ✅ 📍 Géolocalisation
- ✅ 💰 Comparaison de prix
- ✅ 🛒 Réservation facile

**Stats (4) :**
- ✅ 500+ Pharmacies partenaires
- ✅ 10 000+ Médicaments référencés
- ✅ 50 000+ Utilisateurs actifs
- ✅ 24/7 Service disponible

**Étapes (4) :**
- ✅ 1 - 🔍 Recherchez
- ✅ 2 - 📋 Comparez
- ✅ 3 - 🛒 Réservez
- ✅ 4 - ✅ Récupérez

**Avantages (4) :**
- ✅ ⚡ Rapide et efficace
- ✅ 💯 Fiable
- ✅ 🔒 Sécurisé
- ✅ 🆓 Gratuit

**Illustration (3 cartes) :**
- ✅ 🏥 Pharmacie de la Mairie - 1.2 km - En stock
- ✅ 💊 Paracétamol 500mg - 2 500 XAF
- ✅ 📍 Position détectée - Yaoundé, Cameroun

---

## 🌐 Tests de Navigation

### Test 7 : Flux Utilisateur Complet

**Scénario 1 : Nouveau visiteur → Inscription**
1. Visiteur arrive sur `/`
2. Voit le Hero avec présentation
3. Clique "Créer un compte"
4. Remplit le formulaire
5. Se connecte
6. Retour sur `/`
7. Hero visible SANS CTAs
8. Peut utiliser la recherche

**Scénario 2 : Utilisateur existant → Connexion directe**
1. Visiteur arrive sur `/`
2. Voit le Hero
3. Clique "Se connecter"
4. S'identifie
5. Retour sur `/`
6. Hero visible SANS CTAs
7. Utilise directement la recherche

**Scénario 3 : Exploration puis inscription**
1. Visiteur arrive sur `/`
2. Scroller pour voir "Comment ça marche"
3. Scroller pour voir les avantages
4. Arrive au CTA final
5. Clique "Créer un compte gratuitement"
6. S'inscrit
7. Revient sur `/` connecté

---

## 🐛 Tests de Régression

### Test 8 : Fonctionnalités Existantes

**Vérifier que le Hero n'a pas cassé les features existantes :**

1. **SearchSection** :
   - ✅ Barre de recherche fonctionne
   - ✅ Sélection de médicament fonctionne
   - ✅ Rayon de recherche fonctionne
   - ✅ Géolocalisation fonctionne

2. **ResultsDisplay** :
   - ✅ Résultats s'affichent après recherche
   - ✅ Liste des pharmacies correcte
   - ✅ Prix et disponibilité visibles

3. **Cart (Panier)** :
   - ✅ Panier sticky visible à droite
   - ✅ Ajout au panier fonctionne
   - ✅ Suppression fonctionne
   - ✅ Total calculé correctement

4. **Layout général** :
   - ✅ Navbar toujours visible
   - ✅ Footer présent
   - ✅ Pas de chevauchement d'éléments

---

## 📊 Tests de Performance

### Test 9 : Vitesse de Chargement

**Utiliser Chrome DevTools :**
1. F12 → Network → Disable cache
2. Rafraîchir la page
3. Observer le temps de chargement

**Critères de succès :**
- ✅ DOMContentLoaded < 1s
- ✅ Load complet < 2s
- ✅ Pas de layout shift (CLS < 0.1)
- ✅ First Contentful Paint < 1s

---

### Test 10 : Fluidité des Animations

**Utiliser Chrome DevTools :**
1. F12 → More tools → Rendering
2. Cocher "FPS meter"
3. Scroller la page et hover sur les éléments

**Critères de succès :**
- ✅ FPS constant à 60fps
- ✅ Pas de drop de framerate au hover
- ✅ Animations fluides sur mobile (tester avec throttling)

---

## ♿ Tests d'Accessibilité

### Test 11 : Navigation au Clavier

**Étapes :**
1. Rafraîchir la page
2. Utiliser uniquement le clavier (Tab, Enter)

**Résultats attendus :**
- ✅ Tab passe sur "Créer un compte"
- ✅ Tab passe sur "Se connecter"
- ✅ Enter sur un bouton fonctionne (navigation)
- ✅ Focus visible sur tous les éléments interactifs
- ✅ Ordre de focus logique

---

### Test 12 : Contrastes et Lisibilité

**Vérifier les contrastes WCAG :**
- ✅ Titre noir sur fond clair : ratio > 7:1
- ✅ Description grise sur fond clair : ratio > 4.5:1
- ✅ Bouton blanc sur gradient vert : ratio > 4.5:1

**Tester avec un zoom 200% :**
- ✅ Tout le contenu reste lisible
- ✅ Pas de chevauchement de texte
- ✅ Boutons restent cliquables

---

## 🔧 Commandes de Test

### Simuler Utilisateur Non Connecté
```javascript
// Console du navigateur
localStorage.removeItem('token');
location.reload();
```

### Simuler Utilisateur Connecté
```javascript
// Console du navigateur
localStorage.setItem('token', 'fake-token-for-testing');
location.reload();
```

### Vérifier le localStorage
```javascript
// Console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Tester Responsive
```bash
# Chrome DevTools
Ctrl + Shift + M (ou Cmd + Shift + M sur Mac)
# Choisir : iPhone SE, iPad, Desktop HD
```

### Mesurer Performance
```bash
# Lighthouse dans Chrome DevTools
F12 → Lighthouse → Generate report
```

---

## 📋 Checklist Complète

### Fonctionnel
- [ ] Hero s'affiche en haut de la page d'accueil
- [ ] CTAs visibles quand non connecté
- [ ] CTAs masqués quand connecté
- [ ] Bouton "Créer un compte" → `/register`
- [ ] Bouton "Se connecter" → `/login`
- [ ] CTA final masqué quand connecté

### Visuel
- [ ] Gradient de couleur sur le titre
- [ ] Animations float des cercles
- [ ] SlideInRight des cartes
- [ ] Hover effects fonctionnent
- [ ] Ombres visibles et esthétiques

### Responsive
- [ ] Desktop : 2 colonnes (texte + illustration)
- [ ] Tablette : 1 colonne, stats 2x2
- [ ] Mobile : 1 colonne, CTA full-width
- [ ] Pas de débordement horizontal

### Performance
- [ ] Page charge en < 2s
- [ ] Animations à 60fps
- [ ] Pas de layout shift

### Accessibilité
- [ ] Navigation au clavier fonctionne
- [ ] Contrastes WCAG AAA
- [ ] Zoom 200% sans casse

### Régression
- [ ] SearchSection fonctionne
- [ ] ResultsDisplay fonctionne
- [ ] Cart fonctionne
- [ ] Layout général intact

---

## ✅ Résultat Attendu

Après tous ces tests, vous devriez avoir :
- ✅ Une page d'accueil professionnelle et engageante
- ✅ Un message clair sur FindPharma
- ✅ Des CTAs visibles pour convertir les visiteurs
- ✅ Une expérience utilisateur fluide et responsive
- ✅ Aucune régression sur les fonctionnalités existantes

---

## 🆘 Dépannage

### Problème : CTAs toujours visibles même connecté
**Solution :**
```javascript
// Vérifier dans la console
console.log('isLoggedIn:', localStorage.getItem('token') !== null);
// Si le token existe mais CTAs visibles, vérifier HomePage.js ligne 25
```

### Problème : Animations ne fonctionnent pas
**Solution :**
```bash
# Vérifier que le CSS a bien été mis à jour
grep "animation: float" frontend/src/App.css
# Si rien, le CSS n'a pas été sauvegardé
```

### Problème : Hero ne s'affiche pas
**Solution :**
```bash
# Vérifier que HeroSection est bien importé
grep "import HeroSection" frontend/src/pages/HomePage.js
# Vérifier la console pour des erreurs
```

### Problème : Layout cassé
**Solution :**
```bash
# Vérifier qu'il n'y a pas de conflits CSS
grep "\.hero-" frontend/src/App.css | wc -l
# Devrait retourner 22 classes hero
```

---

**Durée estimée des tests** : 15-20 minutes  
**Navigateurs à tester** : Chrome, Firefox, Safari (si possible)  
**Devices à tester** : Desktop (1920px), Tablette (768px), Mobile (375px)

