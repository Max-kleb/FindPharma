# 🐳 FindPharma - Quick Start Docker

## Installation en 3 commandes

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Construire et démarrer (tout automatique !)
make setup

# 3. Créer un superutilisateur
make createsuperuser
```

**C'est tout ! 🎉**

- Frontend : http://localhost
- Backend : http://localhost:8000
- Admin : http://localhost:8000/admin

## Commandes principales

```bash
make up              # Démarrer
make down            # Arrêter
make logs            # Voir les logs
make restart         # Redémarrer
make shell-backend   # Shell du backend
make migrate         # Migrations Django
make populate        # Données de test
make backup-db       # Backup DB
```

Voir toutes les commandes : `make help`

## Documentation complète

Voir [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) pour la documentation détaillée.
