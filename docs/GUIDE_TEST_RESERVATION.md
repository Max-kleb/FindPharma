# 🧪 Guide de Test - Corrections Réservation

## Tests à effectuer immédiatement

### ✅ Test 1: Auto-complétion du téléphone (2 min)

**Prérequis:** Un utilisateur avec un numéro de téléphone enregistré

**Étapes:**
1. Connectez-vous à l'application
2. Allez dans "Mon Profil" et vérifiez/ajoutez votre numéro de téléphone
3. Ajoutez un article au panier
4. Cliquez sur "Panier" puis "Réserver"
5. **VÉRIFICATION:** Le champ téléphone doit être pré-rempli avec votre numéro

**Résultat attendu:** ✅ Champ téléphone contient votre numéro

---

### ✅ Test 2: Formatage automatique (3 min)

**Scénarios à tester:**

#### A. Entrer un numéro commençant par 6
```
Entrée: 677001001
Résultat: +237 677 001 001
```

#### B. Entrer un numéro avec +237
```
Entrée: +237677001001
Résultat: +237 677 001 001
```

#### C. Entrer un numéro avec 237
```
Entrée: 237677001001
Résultat: +237 677 001 001
```

#### D. Entrer un fixe commençant par 2
```
Entrée: 222234567
Résultat: +237 222 234 567
```

**Comment tester:**
1. Dans la modal de réservation, effacez le champ téléphone
2. Tapez chaque numéro test ci-dessus
3. Vérifiez que le formatage se fait automatiquement en temps réel

---

### ✅ Test 3: Pas de déconnexion (5 min)

**⚠️ Test complexe - simulation d'expiration de token**

**Option A - Test manuel simple:**
1. Connectez-vous
2. Ajoutez des articles au panier
3. Cliquez sur "Réserver"
4. Remplissez le formulaire
5. Cliquez sur "Confirmer la Réservation"
6. **VÉRIFICATION:** 
   - Si tout va bien → réservation créée ✅
   - Si erreur de session → message "Votre session a expiré..." mais PAS de déconnexion ✅

**Option B - Test avec Chrome DevTools:**
1. Ouvrez Chrome DevTools (F12)
2. Onglet "Application" → "Local Storage"
3. Modifiez manuellement le token pour le rendre invalide
4. Tentez de créer une réservation
5. **VÉRIFICATION:** Message d'erreur mais vous restez sur la page

---

### ✅ Test 4: Messages d'aide (1 min)

1. Ouvrez la modal de réservation
2. Regardez sous le champ "Téléphone"
3. **VÉRIFICATION:** Vous devez voir le texte gris en italique:
   ```
   Format: +237 6XX XXX XXX (formaté automatiquement)
   ```

---

## 🐛 Problèmes Connus à Surveiller

### Si le téléphone n'est pas pré-rempli:
- Vérifiez que votre profil utilisateur contient bien un numéro
- Allez sur `/profile` et ajoutez votre numéro
- Déconnectez-vous et reconnectez-vous

### Si le formatage ne fonctionne pas:
- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez la console pour les erreurs JavaScript

### Si vous êtes quand même déconnecté:
- Vérifiez les logs de la console navigateur
- Regardez si `handleLogout()` est appelé (ne devrait pas)
- Créez un ticket avec les logs console

---

## 📝 Checklist Complète

- [ ] Téléphone pré-rempli automatiquement
- [ ] Formatage automatique fonctionne pour 6XXXXXXXX
- [ ] Formatage automatique fonctionne pour +237XXXXXXXXX
- [ ] Formatage automatique fonctionne pour 237XXXXXXXXX
- [ ] Formatage automatique fonctionne pour 2XXXXXXXX (fixes)
- [ ] Texte d'aide visible sous le champ téléphone
- [ ] Auto-complétion du navigateur propose des suggestions
- [ ] Pas de déconnexion lors d'une erreur de token
- [ ] Message d'erreur en français compréhensible
- [ ] Réservation fonctionne normalement quand tout est OK

---

## 🚀 Test de Bout en Bout (10 min)

**Scénario complet:**

1. **Inscription/Connexion**
   - Créez un nouveau compte ou connectez-vous
   - Allez sur votre profil
   - Ajoutez un numéro de téléphone: +237 677 001 001

2. **Recherche de médicaments**
   - Recherchez "Paracétamol"
   - Ajoutez 2 médicaments au panier

3. **Réservation**
   - Cliquez sur l'icône panier
   - Cliquez sur "Réserver"
   - **VÉRIFIEZ:** 
     - ✅ Nom pré-rempli
     - ✅ Téléphone pré-rempli (+237 677 001 001)
     - ✅ Email pré-rempli

4. **Test de formatage**
   - Effacez le téléphone
   - Tapez: 699123456
   - **VÉRIFIEZ:** Devient automatiquement "+237 699 123 456"

5. **Soumission**
   - Remplissez la date de récupération
   - Ajoutez des notes (optionnel)
   - Cliquez sur "Confirmer la Réservation"
   - **VÉRIFIEZ:** 
     - ✅ Message de succès
     - ✅ Panier vidé
     - ✅ Modal fermée
     - ✅ Réservation visible dans "Mes Réservations"

---

## ✅ Critères de Succès

**Le test est réussi si:**
1. ✅ Tous les champs sont pré-remplis correctement
2. ✅ Le formatage du téléphone fonctionne pour tous les cas
3. ✅ Aucune déconnexion inattendue
4. ✅ Messages d'erreur clairs en français
5. ✅ L'expérience utilisateur est fluide

**Le test échoue si:**
1. ❌ Déconnexion lors d'une erreur
2. ❌ Téléphone non pré-rempli
3. ❌ Formatage ne fonctionne pas
4. ❌ Messages d'erreur techniques ou en anglais
5. ❌ Erreurs JavaScript dans la console

---

**Bonne chance ! 🚀**
