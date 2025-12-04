# 🐳 FindPharma avec Docker - Guide Simplifié

## 🚀 Démarrage Rapide (3 étapes)

### 1️⃣ Installer Docker (si pas déjà fait)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

**Important** : Déconnectez-vous et reconnectez-vous après l'installation pour que les changements prennent effet.

### 2️⃣ Démarrer FindPharma

```bash
cd /home/mitou/FindPharma
./start-docker.sh
```

Ce script va automatiquement :
- ✅ Construire les images Docker
- ✅ Démarrer PostgreSQL + PostGIS
- ✅ Démarrer le backend Django
- ✅ Démarrer le frontend React + Nginx
- ✅ Effectuer les migrations de base de données

### 3️⃣ Créer un superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## 🌐 Accès à l'application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **API Backend** | http://localhost:8000/api |
| **Admin Django** | http://localhost:8000/admin |

---

## 📝 Commandes Docker Utiles

### Voir les conteneurs en cours

```bash
docker-compose ps
```

### Voir les logs

```bash
# Tous les logs
docker-compose logs -f

# Logs du backend seulement
docker-compose logs -f backend

# Logs du frontend seulement
docker-compose logs -f frontend

# Logs de la base de données
docker-compose logs -f db
```

### Arrêter l'application

```bash
docker-compose down
```

### Redémarrer l'application

```bash
docker-compose restart
```

### Reconstruire les images

```bash
docker-compose build --no-cache
```

### Accéder au shell du backend

```bash
docker-compose exec backend bash
```

### Exécuter des migrations Django

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Collecter les fichiers statiques

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

---

## 🔧 Utilisation du Makefile

Le projet inclut un **Makefile** avec des commandes simplifiées :

```bash
# Démarrer l'application
make up

# Arrêter l'application
make down

# Voir les logs
make logs

# Redémarrer
make restart

# Créer un superuser
make createsuperuser

# Effectuer les migrations
make migrate

# Accéder au shell backend
make shell-backend

# Voir toutes les commandes disponibles
make help
```

---

## 🐛 Résolution de problèmes

### ❌ Erreur "permission denied" avec Docker

**Solution** : Ajoutez votre utilisateur au groupe docker

```bash
sudo usermod -aG docker $USER
```

Puis déconnectez-vous et reconnectez-vous.

### ❌ Port 80 ou 8000 déjà utilisé

**Solution 1** : Arrêtez les services qui utilisent ces ports

```bash
sudo lsof -i :80
sudo lsof -i :8000
```

**Solution 2** : Modifiez les ports dans `docker-compose.yml`

### ❌ Les migrations ne s'exécutent pas

**Solution** : Exécutez-les manuellement

```bash
docker-compose exec backend python manage.py migrate
```

### ❌ L'image ne se construit pas

**Solution** : Reconstruisez sans cache

```bash
docker-compose build --no-cache
```

---

## 🔄 Modes de développement

### Mode Développement (avec hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

Le code source est monté en volume, les modifications sont immédiatement visibles.

### Mode Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Utilise Gunicorn pour le backend avec 4 workers.

### Mode Test

```bash
docker-compose -f docker-compose.test.yml up
```

Lance les tests automatiquement.

---

## 📦 Gestion des données

### Sauvegarder la base de données

```bash
docker-compose exec db pg_dump -U findpharma_user findpharma_db > backup.sql
```

### Restaurer la base de données

```bash
cat backup.sql | docker-compose exec -T db psql -U findpharma_user findpharma_db
```

### Supprimer toutes les données

⚠️ **Attention** : Cette commande supprime tout !

```bash
docker-compose down -v
```

---

## 👥 Équipe FindPharma

- **NGOM Françoise Lorraine** - Développeuse Frontend
- **NKOT Jean Franky** - Chef d'Équipe & Développeur Backend
- **KENMOE MEUGANG Oriane Stevye** - Développeuse Frontend
- **SONKE KAMGHA Maxime Klebert** - Développeur Backend
- **DONGMO TCHOUTEZO Evenis** - Développeur Frontend

---

## 📚 Documentation complète

- `README.md` - Documentation générale du projet
- `DOCKER_GUIDE.md` - Guide Docker détaillé
- `DOCKERISATION_COMPLETE.md` - Récapitulatif technique complet

---

🎉 **Bon développement avec FindPharma !**
