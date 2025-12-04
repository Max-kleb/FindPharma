# 🔄 Migration Configuration Docker - FindPharma

## 📊 Alignement des Configurations

### ✅ Configurations Harmonisées (Local ↔️ Docker)

| Paramètre | Configuration Locale (.env) | Configuration Docker | Statut |
|-----------|----------------------------|---------------------|--------|
| **Nom BDD** | `findpharma` | `findpharma` | ✅ ALIGNÉ |
| **Utilisateur** | `findpharmauser` | `findpharmauser` | ✅ ALIGNÉ |
| **Mot de passe** | `root` | `root` | ✅ ALIGNÉ |
| **Host** | `localhost` | `db` (container) | ✅ OK |
| **Port** | `5432` | `5432` | ✅ ALIGNÉ |

---

## 🐳 Services Docker Configurés

### 1. PostgreSQL + PostGIS
```yaml
Container: findpharma_db
Image: postgis/postgis:15-3.3
Port: 5432:5432
Base de données: findpharma
Utilisateur: findpharmauser
Mot de passe: root
```

### 2. Backend Django
```yaml
Container: findpharma_backend
Port: 8000:8000
Variables d'environnement:
  - DATABASE_NAME=findpharma
  - DATABASE_USER=findpharmauser
  - DATABASE_PASSWORD=root
  - DATABASE_HOST=db
  - DATABASE_PORT=5432
  - STATIC_ROOT=/app/staticfiles
  - MEDIA_ROOT=/app/media
```

### 3. Frontend React
```yaml
Container: findpharma_frontend
Port: 3000:80
```

---

## 📝 Migrations et Peuplement

### Les migrations sont automatiques au démarrage

Le script `backend/docker-entrypoint.sh` exécute automatiquement :

1. ✅ Attente que PostgreSQL soit prêt
2. ✅ Exécution des migrations : `python manage.py migrate`
3. ✅ Collection des fichiers statiques : `python manage.py collectstatic --noinput`
4. ✅ Démarrage du serveur Django

### Scripts de peuplement disponibles

#### Option 1 : Script complet (Recommandé)
```bash
docker compose exec backend python populate_database.py
```

Ce script crée :
- 50+ pharmacies au Cameroun (Yaoundé, Douala, etc.)
- 100+ médicaments avec catégories
- Stocks pour chaque pharmacie

#### Option 2 : Script spécifique Cameroun
```bash
docker compose exec backend python scripts/populate_cameroon_pharmacies.py
```

#### Option 3 : Peuplement manuel via shell Django
```bash
docker compose exec backend python manage.py shell
```

Puis :
```python
from pharmacies.models import Pharmacy
from django.contrib.gis.geos import Point

Pharmacy.objects.create(
    name="Pharmacie Centrale",
    address="Avenue Kennedy, Yaoundé",
    location=Point(11.5167, 3.8667),  # longitude, latitude
    phone_number="+237677123456",
    email="centrale@example.com",
    is_open_24h=True
)
```

---

## 🔄 Migration des Données Existantes (si nécessaire)

### Si vous aviez des données dans la base locale

#### 1. Sauvegarder la base locale
```bash
# Démarrer PostgreSQL local
sudo systemctl start postgresql

# Exporter les données
pg_dump -U findpharmauser -d findpharma --data-only --inserts -f backup_data.sql
```

#### 2. Importer dans Docker
```bash
# Copier le fichier dans le conteneur
docker cp backup_data.sql findpharma_db:/tmp/

# Importer
docker compose exec db psql -U findpharmauser -d findpharma -f /tmp/backup_data.sql
```

---

## ✅ Vérifications Post-Migration

### 1. Vérifier la connexion à la base de données
```bash
docker compose exec backend python manage.py check --database default
```

### 2. Vérifier les migrations
```bash
docker compose exec backend python manage.py showmigrations
```

### 3. Compter les données
```bash
docker compose exec backend python manage.py shell -c "
from pharmacies.models import Pharmacy
from medicines.models import Medicine
from stocks.models import Stock
print(f'Pharmacies: {Pharmacy.objects.count()}')
print(f'Médicaments: {Medicine.objects.count()}')
print(f'Stocks: {Stock.objects.count()}')
"
```

### 4. Créer un superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 🌐 URLs d'accès

| Service | URL | Utilisation |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Interface utilisateur |
| Backend API | http://localhost:8000/api | Endpoints REST |
| Admin Django | http://localhost:8000/admin | Administration |
| Documentation API | http://localhost:8000/api/docs | Swagger/OpenAPI |

---

## 📦 Volumes Docker (Données Persistantes)

| Volume | Chemin Container | Usage |
|--------|-----------------|-------|
| `postgres_data` | `/var/lib/postgresql/data` | Base de données PostgreSQL |
| `static_volume` | `/app/staticfiles` | Fichiers statiques Django |
| `media_volume` | `/app/media` | Fichiers média uploadés |

⚠️ **Important** : Les données restent persistantes même après `docker compose down`

Pour supprimer toutes les données :
```bash
docker compose down -v
```

---

## 🔧 Commandes Utiles

### Gestion des services
```bash
# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Redémarrer un service spécifique
docker compose restart backend

# Voir les logs
docker compose logs -f backend
```

### Gestion de la base de données
```bash
# Accéder à psql
docker compose exec db psql -U findpharmauser -d findpharma

# Sauvegarder la base
docker compose exec db pg_dump -U findpharmauser findpharma > backup.sql

# Restaurer la base
cat backup.sql | docker compose exec -T db psql -U findpharmauser findpharma
```

### Gestion Django
```bash
# Shell Django
docker compose exec backend python manage.py shell

# Migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Créer superuser
docker compose exec backend python manage.py createsuperuser
```

---

## ✅ Checklist Post-Configuration

- [x] Configurations alignées (Local ↔️ Docker)
- [x] PostgreSQL + PostGIS démarré
- [x] Backend Django fonctionnel
- [x] Frontend React accessible
- [x] Migrations automatiques configurées
- [ ] Superuser créé
- [ ] Base de données peuplée
- [ ] Tests de l'application

---

## 📚 Fichiers de Configuration Modifiés

1. **docker-compose.yml** : Credentials alignés avec `.env` local
2. **backend/FindPharma/settings.py** : Ajout `STATIC_ROOT` et `MEDIA_ROOT`
3. **frontend/Dockerfile** : Corrigé pour utiliser `docker.io/library/nginx:alpine`

---

## 🎯 Prochaines Étapes

1. **Créer un superuser** :
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```

2. **Peupler la base de données** :
   ```bash
   docker compose exec backend python populate_database.py
   ```

3. **Tester l'application** :
   - Frontend : http://localhost:3000
   - Admin : http://localhost:8000/admin

4. **Vérifier les fonctionnalités** :
   - Recherche de pharmacies
   - Géolocalisation
   - Affichage de la carte
   - Changement de langue (FR/EN)

---

**Date de migration** : 3 décembre 2025  
**Configuration finale** : Docker Compose avec credentials originaux préservés
