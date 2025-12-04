# 🎯 Guide de Démarrage Rapide - FindPharma avec Podman

## ✅ Images Docker déjà construites

- ✅ **Backend**: `findpharma-backend:latest` (1.27 GB) 
- ⏳ **Frontend**: En cours de construction...

---

## 🚀 Étapes pour démarrer FindPharma

### 1️⃣ Construire l'image Frontend (si pas déjà fait)

```bash
cd /home/mitou/FindPharma
podman build -t findpharma-frontend:latest -f frontend/Dockerfile frontend/
```

⏳ **Temps estimé**: 5-10 minutes (téléchargement des dépendances npm)

### 2️⃣ Démarrer tous les services

```bash
cd /home/mitou/FindPharma
./start-with-podman.sh
```

Ce script va :
- ✅ Créer le réseau `findpharma_network`
- ✅ Créer les volumes pour PostgreSQL et les fichiers statiques
- ✅ Démarrer PostgreSQL + PostGIS
- ✅ Démarrer le backend Django
- ✅ Démarrer le frontend React + Nginx

### 3️⃣ Créer un superuser Django

```bash
podman exec -it findpharma-backend python manage.py createsuperuser
```

---

## 🌐 Accès à l'application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Interface utilisateur React |
| **API Backend** | http://localhost:8000/api | API REST Django |
| **Admin Django** | http://localhost:8000/admin | Interface d'administration |
| **Base de données** | localhost:5432 | PostgreSQL + PostGIS |

---

## 📝 Commandes utiles

### Voir les logs

```bash
# Logs du backend
podman logs -f findpharma-backend

# Logs du frontend  
podman logs -f findpharma-frontend

# Logs de la base de données
podman logs -f findpharma-db
```

### Voir les conteneurs en cours

```bash
podman ps
```

### Arrêter tous les services

```bash
./stop-with-podman.sh
```

Ou manuellement :

```bash
podman stop findpharma-frontend findpharma-backend findpharma-db
```

### Supprimer les conteneurs

```bash
podman rm findpharma-frontend findpharma-backend findpharma-db
```

### Accéder au shell du backend

```bash
podman exec -it findpharma-backend /bin/bash
```

### Exécuter des migrations Django

```bash
podman exec -it findpharma-backend python manage.py makemigrations
podman exec -it findpharma-backend python manage.py migrate
```

### Peupler la base de données

```bash
podman exec -it findpharma-backend python manage.py shell
```

Puis dans le shell Python :

```python
from pharmacies.models import Pharmacy
# Créer des pharmacies...
```

---

## 🔧 Résolution de problèmes

### ❌ Le frontend ne se construit pas

**Problème**: `npm ci` échoue

**Solution**: Le Dockerfile a été modifié pour utiliser `npm install` au lieu de `npm ci`

### ❌ Erreur "address already in use"

**Problème**: Les ports 80, 8000 ou 5432 sont déjà utilisés

**Solution**: Arrêtez les services qui utilisent ces ports ou modifiez les ports dans le script

### ❌ Le backend ne se connecte pas à la base de données

**Solution**: Attendez 30 secondes après le démarrage de PostgreSQL avant de démarrer le backend

---

## 📦 Structure des volumes

- `findpharma_postgres_data`: Données PostgreSQL (persistantes)
- `findpharma_static`: Fichiers statiques Django  
- `findpharma_media`: Fichiers média uploadés

⚠️ **Attention**: Ne supprimez pas ces volumes si vous voulez conserver vos données !

---

## 🎓 Pour en savoir plus

- **Documentation Docker complète**: `DOCKER_GUIDE.md`
- **Documentation Podman**: `PODMAN_GUIDE.md`
- **Architecture du projet**: `README.md`

---

## 👥 Équipe FindPharma

- **NGOM Françoise Lorraine** - Développeuse Frontend
- **NKOT Jean Franky** - Chef d'Équipe & Développeur Backend
- **KENMOE MEUGANG Oriane Stevye** - Développeuse Frontend
- **SONKE KAMGHA Maxime Klebert** - Développeur Backend
- **DONGMO TCHOUTEZO Evenis** - Développeur Frontend

---

🎉 **Bon développement avec FindPharma !**
