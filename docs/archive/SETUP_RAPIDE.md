# 🚀 Setup Rapide - FindPharma

## Pour les nouveaux développeurs

### 1️⃣ Configuration de l'environnement

```bash
# Copier le fichier de configuration
cp .env.example .env
```

Le fichier `.env.example` contient déjà toutes les configurations nécessaires, y compris :
- ✅ Configuration de la base de données
- ✅ Configuration email (Gmail SMTP)
- ✅ Credentials pour l'envoi d'emails en temps réel

### 2️⃣ Démarrer l'application

```bash
# Démarrer tous les conteneurs Docker
docker compose up -d

# Vérifier que tout fonctionne
docker compose ps
```

### 3️⃣ Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin

### 📧 Configuration Email

Le projet utilise le compte Gmail : **contact.findpharma@gmail.com**

- Les emails de vérification sont envoyés automatiquement lors de l'inscription
- Le mot de passe d'application est déjà configuré dans `.env.example`
- **Aucune configuration supplémentaire n'est nécessaire**

### ⚠️ Important

- Ne modifiez JAMAIS le fichier `.env.example`
- Si vous devez tester avec votre propre email, modifiez uniquement votre fichier `.env` local
- Le fichier `.env` est ignoré par Git (sécurité)

### 🆘 En cas de problème

```bash
# Arrêter et supprimer tous les conteneurs
docker compose down

# Rebuilder et redémarrer
docker compose up -d --build

# Voir les logs
docker compose logs -f
```
