# Makefile pour FindPharma Docker

.PHONY: help build up down restart logs clean test shell migrate createsuperuser populate backup restore

help: ## Afficher l'aide
	@echo "🐳 FindPharma - Commandes Docker disponibles :"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Construire toutes les images Docker
	@echo "🏗️  Construction des images Docker..."
	docker-compose build

up: ## Démarrer tous les services
	@echo "🚀 Démarrage des services..."
	docker-compose up -d
	@echo "✅ Services démarrés !"
	@echo "   Frontend: http://localhost"
	@echo "   Backend:  http://localhost:8000"
	@echo "   Admin:    http://localhost:8000/admin"

down: ## Arrêter tous les services
	@echo "🛑 Arrêt des services..."
	docker-compose down

restart: ## Redémarrer tous les services
	@echo "🔄 Redémarrage des services..."
	docker-compose restart

logs: ## Voir les logs de tous les services
	docker-compose logs -f

logs-backend: ## Voir les logs du backend
	docker-compose logs -f backend

logs-frontend: ## Voir les logs du frontend
	docker-compose logs -f frontend

logs-db: ## Voir les logs de la base de données
	docker-compose logs -f db

ps: ## Voir le statut des services
	docker-compose ps

clean: ## Supprimer tous les conteneurs et volumes
	@echo "🧹 Nettoyage complet..."
	docker-compose down -v
	docker system prune -f

shell-backend: ## Accéder au shell du backend
	docker-compose exec backend bash

shell-frontend: ## Accéder au shell du frontend
	docker-compose exec frontend sh

shell-db: ## Accéder au shell PostgreSQL
	docker-compose exec db psql -U findpharma_user -d findpharma_db

migrate: ## Exécuter les migrations Django
	@echo "🔄 Exécution des migrations..."
	docker-compose exec backend python manage.py migrate

makemigrations: ## Créer de nouvelles migrations Django
	@echo "📝 Création des migrations..."
	docker-compose exec backend python manage.py makemigrations

createsuperuser: ## Créer un superutilisateur Django
	docker-compose exec backend python manage.py createsuperuser

populate: ## Peupler la base de données avec des données de test
	@echo "📊 Peuplement de la base de données..."
	docker-compose exec backend python populate_database.py

collectstatic: ## Collecter les fichiers statiques Django
	docker-compose exec backend python manage.py collectstatic --noinput

test-backend: ## Exécuter les tests du backend
	docker-compose exec backend python manage.py test

test-frontend: ## Exécuter les tests du frontend
	docker-compose exec frontend npm test

backup-db: ## Backup de la base de données
	@echo "💾 Backup de la base de données..."
	docker-compose exec -T db pg_dump -U findpharma_user findpharma_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup créé : backup_$(shell date +%Y%m%d_%H%M%S).sql"

restore-db: ## Restaurer la base de données (usage: make restore-db FILE=backup.sql)
	@echo "🔄 Restauration de la base de données..."
	docker-compose exec -T db psql -U findpharma_user findpharma_db < $(FILE)
	@echo "✅ Base de données restaurée depuis $(FILE)"

stats: ## Voir les statistiques d'utilisation des ressources
	docker stats

# Production
prod-build: ## Construire pour la production
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Démarrer en mode production
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Arrêter en mode production
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Voir les logs en production
	docker-compose -f docker-compose.prod.yml logs -f

# Développement
dev: ## Démarrer en mode développement (avec hot-reload)
	@echo "🔥 Mode développement avec hot-reload..."
	docker-compose up

rebuild: ## Rebuild et restart un service (usage: make rebuild SERVICE=backend)
	docker-compose build $(SERVICE)
	docker-compose up -d $(SERVICE)

# Utilitaires
check: ## Vérifier que Docker est installé
	@echo "🔍 Vérification de l'environnement..."
	@docker --version
	@docker-compose --version
	@echo "✅ Docker est installé et fonctionnel"

setup: ## Installation initiale complète
	@echo "🚀 Installation initiale de FindPharma..."
	@make check
	@make build
	@make up
	@sleep 10
	@make migrate
	@echo "✅ Installation terminée !"
	@echo ""
	@echo "Créez maintenant un superutilisateur avec : make createsuperuser"
