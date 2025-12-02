# 🐳 Guide de Dockerisation - FindPharma

## 📋 Prérequis

- Docker version 20.10+
- Docker Compose version 2.0+
- Au moins 4 GB de RAM disponible

## 🏗️ Architecture Docker

Le projet est divisé en 3 services :

1. **db** : PostgreSQL 15 avec PostGIS (base de données géospatiale)
2. **backend** : Django 5.2.7 (API REST)
3. **frontend** : React 19.2.0 + Nginx (interface utilisateur)

## 🚀 Démarrage Rapide

### 1. Cloner le projet (si pas déjà fait)

```bash
git clone https://github.com/Max-kleb/FindPharma.git
cd FindPharma
```

### 2. Créer le fichier `.env`

```bash
cp .env.example .env
```

**⚠️ IMPORTANT** : Modifiez le fichier `.env` avec vos vraies valeurs :

```bash
nano .env
```

Changez au minimum :
- `POSTGRES_PASSWORD` : mot de passe fort
- `SECRET_KEY` : clé secrète Django (générez-en une nouvelle)
- `EMAIL_HOST_USER` et `EMAIL_HOST_PASSWORD` : vos identifiants Gmail

### 3. Construire les images Docker

```bash
docker-compose build
```

Cette commande va :
- Télécharger les images de base (Python, Node, PostgreSQL)
- Installer toutes les dépendances
- Construire les images personnalisées

⏱️ Durée : 5-10 minutes la première fois

### 4. Démarrer tous les services

```bash
docker-compose up -d
```

Options :
- `-d` : mode détaché (tourne en arrière-plan)
- Sans `-d` : voir les logs en temps réel

### 5. Vérifier que tout fonctionne

```bash
docker-compose ps
```

Vous devriez voir 3 services `running` :
```
NAME                    STATUS      PORTS
findpharma_db          Up          0.0.0.0:5432->5432/tcp
findpharma_backend     Up          0.0.0.0:8000->8000/tcp
findpharma_frontend    Up          0.0.0.0:80->80/tcp
```

### 6. Accéder à l'application

- **Frontend** : http://localhost
- **Backend API** : http://localhost:8000/api
- **Admin Django** : http://localhost:8000/admin

## 📊 Initialisation des Données

### Créer un superutilisateur Django

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Peupler la base de données (données de test)

```bash
docker-compose exec backend python manage.py loaddata test_data.json
```

OU exécuter le script de population :

```bash
docker-compose exec backend python populate_database.py
```

## 🔧 Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Arrêter les services

```bash
docker-compose stop
```

### Redémarrer les services

```bash
docker-compose restart
```

### Arrêter et supprimer les conteneurs

```bash
docker-compose down
```

### Arrêter et supprimer TOUT (conteneurs + volumes + images)

⚠️ **ATTENTION** : Cela supprime la base de données !

```bash
docker-compose down -v --rmi all
```

### Exécuter des commandes dans un conteneur

```bash
# Django migrations
docker-compose exec backend python manage.py migrate

# Django shell
docker-compose exec backend python manage.py shell

# Accéder au shell bash du backend
docker-compose exec backend bash

# Accéder à PostgreSQL
docker-compose exec db psql -U findpharma_user -d findpharma_db
```

### Rebuild un service spécifique

```bash
docker-compose build backend
docker-compose up -d backend
```

## 🐛 Dépannage

### Problème : Le backend ne démarre pas

**Vérifier les logs** :
```bash
docker-compose logs backend
```

**Solutions courantes** :
1. Base de données pas prête → Attendez 30 secondes et redémarrez
2. Migrations échouées → Supprimez le volume et recréez :
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Problème : Le frontend affiche une erreur 502

**Cause** : Le backend n'est pas accessible

**Solution** :
```bash
docker-compose restart backend
docker-compose logs backend
```

### Problème : "Port already in use"

**Solution** : Un service utilise déjà le port (80, 8000 ou 5432)

```bash
# Trouver quel processus utilise le port
sudo lsof -i :80
sudo lsof -i :8000
sudo lsof -i :5432

# Arrêter le processus OU changer le port dans docker-compose.yml
```

### Problème : Les modifications du code ne sont pas prises en compte

**Frontend** : Rebuild l'image
```bash
docker-compose build frontend
docker-compose up -d frontend
```

**Backend** : Les modifications sont automatiques (volume monté)
```bash
docker-compose restart backend
```

## 📦 Structure des Fichiers Docker

```
FindPharma/
├── docker-compose.yml           # Orchestration des services
├── .env                          # Variables d'environnement (NE PAS COMMIT)
├── .env.example                  # Template des variables
├── backend/
│   ├── Dockerfile                # Image Docker du backend
│   ├── docker-entrypoint.sh      # Script de démarrage
│   ├── .dockerignore             # Fichiers à ignorer
│   └── requirements.txt          # Dépendances Python
└── frontend/
    ├── Dockerfile                # Image Docker multi-stage
    ├── nginx.conf                # Configuration Nginx
    ├── .dockerignore             # Fichiers à ignorer
    └── package.json              # Dépendances Node
```

## 🔒 Sécurité en Production

**⚠️ Avant de déployer en production** :

1. ✅ Changez `DEBUG=False` dans `.env`
2. ✅ Générez une nouvelle `SECRET_KEY`
3. ✅ Utilisez un mot de passe PostgreSQL fort
4. ✅ Configurez `ALLOWED_HOSTS` correctement
5. ✅ Utilisez HTTPS (ajoutez un reverse proxy comme Traefik ou Nginx)
6. ✅ Ne commitez JAMAIS le fichier `.env` sur Git
7. ✅ Utilisez des volumes nommés pour la persistance
8. ✅ Configurez les backups automatiques de la base de données

## 🌐 Déploiement en Production

### Option 1 : VPS (DigitalOcean, Linode, AWS EC2)

1. Installer Docker et Docker Compose sur le serveur
2. Cloner le projet
3. Configurer le fichier `.env` avec les vraies valeurs
4. Lancer : `docker-compose -f docker-compose.prod.yml up -d`

### Option 2 : Services Cloud

- **AWS ECS** : Elastic Container Service
- **Google Cloud Run** : Containers managés
- **Azure Container Instances** : Containers Azure
- **Heroku** : Avec Heroku PostgreSQL

## 📈 Monitoring

### Voir l'utilisation des ressources

```bash
docker stats
```

### Nettoyer les ressources inutilisées

```bash
docker system prune -a
```

## 🆘 Support

Pour toute question :
- Email : contact@findpharma.cm
- GitHub Issues : https://github.com/Max-kleb/FindPharma/issues

---

**✅ Votre application est maintenant dockerisée et prête à être déployée !**
