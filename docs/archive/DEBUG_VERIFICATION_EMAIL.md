# 🔍 GUIDE DE DÉBOGAGE - Vérification Email

## ✅ Corrections Appliquées

### 1. Expiration réduite à 3 minutes
- **Avant** : 15 minutes (900 secondes)
- **Après** : 3 minutes (180 secondes)
- **Fichiers modifiés** :
  - `backend/FindPharma/settings.py` : `EMAIL_VERIFICATION_CODE_EXPIRY = 3`
  - `backend/users/verification_views.py` : Utilise dynamiquement la valeur de settings
  - `backend/users/email_service.py` : Email affiche "3 minute(s)"
  - `frontend/src/EmailVerificationModal.js` : Timer à 180 secondes

### 2. Logs de debug ajoutés
Maintenant, quand vous testez, vous verrez dans le terminal Django :
```
✅ Code généré pour email@example.com: ABC123 (expire dans 3 min)
🔍 Vérification pour email@example.com
   Code reçu: ABC123
   Session data: {'code': 'ABC123', 'username': 'John', ...}
   Code attendu: ABC123
   Expire à: 2025-11-25 12:45:00
   Maintenant: 2025-11-25 12:42:00
✅ Code correct pour email@example.com
```

## 🐛 Problème : "Code non reconnu"

### Causes possibles :

#### 1. **Sessions Django perdues**
Les sessions peuvent être perdues si :
- Le serveur Django a redémarré entre l'envoi et la vérification
- Les cookies ne sont pas partagés entre requêtes
- Le backend et frontend sont sur des domaines différents

**Solution** : Vérifier que les cookies de session fonctionnent

#### 2. **Majuscules/Minuscules**
Le code est converti en MAJUSCULES côté serveur :
```python
code = request.data.get('code', '').upper()
```

**Solution** : S'assurer que la comparaison se fait en majuscules des deux côtés

#### 3. **Espaces dans le code**
Si l'utilisateur copie-colle avec des espaces.

**Solution** : Le frontend devrait nettoyer les espaces

## 🧪 Tests à Faire Maintenant

### Test 1 : Vérifier les logs Django

1. Ouvrir le terminal Django
2. Aller sur http://localhost:3000/register
3. Remplir le formulaire et cliquer "Vérifier mon email"
4. **Regarder le terminal Django** - vous devriez voir :
   ```
   ✅ Code généré pour jeanfrankynkot@gmail.com: ABC123 (expire dans 3 min)
   ```

5. Noter le code (ex: `ABC123`)
6. Entrer le code dans le modal
7. **Regarder à nouveau le terminal** - vous devriez voir :
   ```
   🔍 Vérification pour jeanfrankynkot@gmail.com
      Code reçu: ABC123
      Code attendu: ABC123
   ✅ Code correct
   ```

### Test 2 : Vérifier l'email Gmail

1. Aller sur Gmail : https://mail.google.com
2. Chercher l'email de FindPharma
3. Le code devrait être en gros caractères
4. Copier exactement le code (sans espaces)
5. Coller dans le modal

### Test 3 : Test manuel avec curl

```bash
# 1. Envoyer un code
curl -X POST http://localhost:8000/api/auth/send-verification-code/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"Test"}' \
  -c cookies.txt

# Regarder le terminal Django pour voir le code généré

# 2. Vérifier le code (remplacer ABC123 par le vrai code)
curl -X POST http://localhost:8000/api/auth/verify-code/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"ABC123"}' \
  -b cookies.txt
```

## 📊 Debug Checklist

Après redémarrage de Django, vérifiez :

- [ ] Terminal Django affiche le code généré avec `✅ Code généré pour...`
- [ ] Email reçu dans Gmail avec le bon code
- [ ] Code dans l'email = Code dans le terminal
- [ ] Quand vous entrez le code, terminal affiche `🔍 Vérification pour...`
- [ ] Terminal affiche `Code reçu:` et `Code attendu:` (doivent être identiques)
- [ ] Si identiques mais erreur, vérifier les sessions Django

## 🔧 Si le problème persiste

### Activer le stockage en base de données

Au lieu d'utiliser les sessions, on peut stocker dans la table `EmailVerification` :

```python
# Dans verification_views.py, remplacer les sessions par :
verification = EmailVerification.objects.create(
    user=user,  # ou None si pas encore créé
    code=code,
    expires_at=timezone.now() + timedelta(minutes=3)
)
```

Mais cela nécessite de gérer la création d'utilisateur avant la vérification.

### Vérifier les cookies de session

```bash
# Dans le navigateur (Console DevTools)
document.cookie

# Devrait contenir quelque chose comme :
# "sessionid=abc123..."
```

## 📧 Format de l'Email

L'email reçu devrait ressembler à :

```
Subject: 🔐 FindPharma - Code de vérification

Bonjour Jean Franky 👋

Votre code de vérification :

┌─────────┐
│ ABC123  │
└─────────┘

⚠️ Important :
• Ce code expire dans 3 minute(s)
• Ne partagez jamais ce code
```

Le code est affiché en **gros caractères**, **lettres majuscules**, **6 caractères**.

## 🎯 Après les Tests

Si ça fonctionne maintenant :
- ✅ L'expiration est bien de 3 minutes
- ✅ Les logs de debug vous aident à comprendre
- ✅ Le code arrive dans votre Gmail
- ✅ La vérification fonctionne

Si ça ne fonctionne toujours pas :
1. Copiez les logs du terminal Django
2. Montrez-les moi pour analyse
3. On pourra passer au stockage en DB si nécessaire

---

**Prochaine étape** : Redémarrer Django et tester !
