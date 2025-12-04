# 🚀 Guide de Démarrage Rapide - FindPharma Docker

## Prérequis

- Docker ou Podman installé
- Docker Compose installé
- Ports 3000, 5432, 8000 disponibles

---

## Démarrage en 3 Commandes

```bash
# 1. Cloner le projet (si pas déjà fait)
cd /home/mitou/FindPharma

# 2. Démarrer tous les services
docker compose up -d

# 3. Attendre que les services soient prêts (environ 30 secondes)
docker compose logs -f backend
# Attendez de voir "Starting development server at http://0.0.0.0:8000/"
# Puis Ctrl+C pour sortir
```

---

## Vérification Rapide

```bash
# Vérifier que les services tournent
podman ps --format "{{.Names}}: {{.Ports}}"

# Devrait afficher:
# findpharma_db: 0.0.0.0:5432->5432/tcp
# findpharma_backend: 0.0.0.0:8000->8000/tcp
# findpharma_frontend: 0.0.0.0:3000->80/tcp
```

---

## Accès Rapide

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Application Web** | http://localhost:3000 | - |
| **API Backend** | http://localhost:8000/api | - |
| **Admin Django** | http://localhost:8000/admin | admin / admin123 |

---

## Test Rapide API

```bash
# Voir le nombre de pharmacies
curl -s http://localhost:8000/api/pharmacies/ | python3 -c "import sys,json; data=json.load(sys.stdin); print(f'✅ {data[\"count\"]} pharmacies disponibles')"

# Devrait afficher: ✅ 50 pharmacies disponibles
```

---

## Données Disponibles

✅ **50 pharmacies** déjà créées:
- 30 pharmacies à Yaoundé
- 10 pharmacies à Douala
- 10 pharmacies à Bafoussam

✅ **Superutilisateur** admin créé:
- Username: `admin`
- Password: `admin123`
- Email: `admin@findpharma.cm`

---

## Commandes Utiles

```bash
# Arrêter les services
docker compose down

# Redémarrer les services
docker compose restart

# Voir les logs en temps réel
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend

# Entrer dans un container
docker compose exec backend bash
docker compose exec db psql -U findpharmauser -d findpharma
```

---

## Repeupler la Base de Données (Optionnel)

```bash
# Si vous voulez repartir de zéro avec les 50 pharmacies
docker compose exec backend python populate_cameroun_30_10.py
```

---

## En Cas de Problème

### Les ports sont occupés

```bash
# Arrêter PostgreSQL local
sudo systemctl stop postgresql

# Vérifier les ports
sudo lsof -i :5432
sudo lsof -i :8000
sudo lsof -i :3000
```

### Services ne démarrent pas

```bash
# Supprimer tous les volumes et redémarrer
docker compose down -v
docker compose up -d
```

### Backend ne se connecte pas à la DB

```bash
# Voir les logs
docker compose logs db
docker compose logs backend

# Redémarrer uniquement le backend
docker compose restart backend
```

---

## Documentation Complète

Pour plus de détails, consultez :
- [DOCKER_DEPLOYMENT_SUCCESS.md](DOCKER_DEPLOYMENT_SUCCESS.md) - Documentation complète
- [DOCKER_SETUP.md](docs/DOCKER_SETUP.md) - Guide d'installation
- [README.md](README.md) - Documentation du projet

---

**C'est tout ! L'application devrait maintenant fonctionner. 🎉**

Ouvrez http://localhost:3000 dans votre navigateur pour voir l'application FindPharma !
