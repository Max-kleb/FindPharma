# 🚀 SOLUTION : Recevoir des Emails en Temps Réel

## ⚡ En 5 Minutes - 3 Étapes

### 1️⃣ Créer un Mot de Passe Gmail (2 min)

🔗 **https://myaccount.google.com/security**

1. Activer **"Validation en 2 étapes"**
2. Cliquer **"Mots de passe des applications"**
3. Créer un mot de passe pour **"FindPharma"**
4. Copier le mot de passe (format: `xxxx xxxx xxxx xxxx`)

---

### 2️⃣ Configurer le Backend (2 min)

```bash
cd /home/mitou/FindPharma
./setup_email.sh
```

- Choisir option **1** (Gmail)
- Entrer votre email Gmail
- Coller le mot de passe d'application
- ✅ Fichier `.env` créé automatiquement

---

### 3️⃣ Redémarrer et Tester (1 min)

```bash
# Redémarrer
podman restart findpharma_backend

# Tester
curl -X POST http://localhost:8000/api/auth/send-verification-code/ \
  -H "Content-Type: application/json" \
  -d '{"email": "votre-email@gmail.com", "username": "test"}'
```

**Résultat :** Email reçu en **2-5 secondes** dans votre boîte Gmail ! ⚡

---

## ✅ C'est Tout !

L'inscription fonctionne maintenant avec des **vrais emails** :

1. L'utilisateur s'inscrit
2. Il reçoit un email avec le code
3. Il entre le code
4. Son compte est créé ✅

---

## 📚 Documentation Complète

- **Guide rapide :** `GUIDE_RAPIDE_EMAIL.md`
- **Configuration détaillée :** `CONFIGURATION_EMAIL_SMTP.md`
- **Résumé technique :** `RESUME_SOLUTION_EMAIL.md`

---

**Problème ?** Consultez `GUIDE_RAPIDE_EMAIL.md` section "🚨 Résolution de Problèmes"
