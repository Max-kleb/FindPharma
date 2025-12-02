# 🏥 FindPharma

**Plateforme de Localisation de Pharmacies et Médicaments au Cameroun**

[![Django](https://img.shields.io/badge/Django-5.2.7-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.3-orange)](https://postgis.net/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Description

FindPharma est une application web fullstack qui révolutionne l'accès aux médicaments au Cameroun. Elle permet aux utilisateurs de :

- 🔍 **Rechercher des médicaments** et trouver instantanément les pharmacies qui les ont en stock
- 📍 **Localiser les pharmacies proches** avec géolocalisation GPS et rayon personnalisable (1-20 km)
- 💰 **Comparer les prix** et consulter la disponibilité en temps réel
- 🗺️ **Visualiser sur une carte interactive** avec marqueurs colorés
- 🛒 **Réserver des médicaments** et gérer son panier
- 🌐 **Multilingue** : Français, Anglais, Espagnol

---

## 🎯 Fonctionnalités Principales

### Pour les Patients

✅ **Recherche Intelligente**
- Recherche par nom de médicament ou principe actif
- Filtres avancés (prix, distance, disponibilité)
- Suggestions de recherche en temps réel

✅ **Géolocalisation**
- Localisation automatique via GPS
- Rayon de recherche personnalisable (1-20 km)
- Calcul de distance précis avec PostGIS

✅ **Informations Détaillées**
- Prix en FCFA
- Stock disponible (En stock, Stock limité, Épuisé)
- Dosage, forme pharmaceutique
- Adresse et contact de la pharmacie

✅ **Réservation & Panier**
- Ajout au panier
- Réservation en ligne
- Historique des réservations

✅ **Carte Interactive**
- Visualisation sur carte Leaflet
- Marqueurs colorés (vert = pharmacie, bleu = utilisateur)
- Informations au clic

### Pour les Pharmacies

✅ **Gestion des Stocks**
- Dashboard complet
- CRUD médicaments et stocks
- Statistiques en temps réel

✅ **Gestion des Réservations**
- Voir les réservations clients
- Confirmer/Annuler les réservations
- Notifications

✅ **Profil Pharmacie**
- Informations de contact
- Horaires d'ouverture
- Localisation sur carte

### Pour les Administrateurs

✅ **Administration Complète**
- Gestion des utilisateurs
- Gestion des pharmacies
- Gestion des médicaments
- Statistiques globales

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Backend
- **Framework** : Django 5.2.7
- **API** : Django REST Framework 3.16
- **Base de données** : PostgreSQL 15 + PostGIS 3.3
- **Authentification** : JWT (Simple JWT)
- **Documentation** : Swagger (drf-spectacular)

#### Frontend
- **Framework** : React 19.2.0
- **Routing** : React Router DOM 7.9.6
- **Cartographie** : Leaflet + React Leaflet
- **Charts** : Recharts
- **Internationalisation** : i18next + react-i18next

#### Infrastructure
- **Conteneurisation** : Docker + Docker Compose
- **Proxy** : Nginx
- **CI/CD** : GitHub Actions

---

## 📁 Structure du Projet

```
FindPharma/
├── backend/                      # 🐍 Backend Django REST API
│   ├── FindPharma/              # Configuration Django
│   ├── core/                    # App core (utils, base models)
│   ├── pharmacies/              # Gestion des pharmacies
│   ├── medicines/               # Gestion des médicaments
│   ├── stocks/                  # Gestion des stocks
│   ├── users/                   # Authentification et utilisateurs
│   ├── cart/                    # Panier et réservations
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-entrypoint.sh
│
├── frontend/                     # ⚛️ Frontend React
│   ├── public/                  # Fichiers publics
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   ├── pages/               # Pages de l'application
│   │   ├── services/            # Services API
│   │   ├── styles/              # Styles CSS
│   │   ├── i18n/                # Traductions (FR/EN/ES)
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
│
├── docker-compose.yml            # 🐳 Configuration Docker (production)
├── docker-compose.dev.yml        # 🔥 Configuration Docker (dev avec hot-reload)
├── docker-compose.prod.yml       # 🚀 Configuration Docker (production optimisée)
├── docker-compose.test.yml       # 🧪 Configuration Docker (tests)
│
├── .github/
│   └── workflows/
│       └── docker.yml            # CI/CD GitHub Actions
│
├── Makefile                      # ⚡ Commandes simplifiées
├── docker-setup.sh               # 🚀 Script d'installation rapide
├── DOCKER_GUIDE.md               # 📖 Guide Docker complet
├── DOCKER_README.md              # 📖 Quick Start Docker
├── .env.example                  # 🔐 Template variables d'environnement
└── README.md                     # 📖 Ce fichier
```

---

## 🚀 Installation Rapide

### Prérequis

- **Docker** version 20.10+ ([Installer Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** version 2.0+ ([Installer Docker Compose](https://docs.docker.com/compose/install/))
- 4 GB RAM minimum

### Installation en 3 commandes

```bash
# 1. Cloner le projet
git clone https://github.com/Max-kleb/FindPharma.git
cd FindPharma

# 2. Configuration rapide
./docker-setup.sh

# 3. Créer un superutilisateur
make createsuperuser
```

**C'est tout ! 🎉**

Accédez à l'application :
- **Frontend** : http://localhost
- **Backend API** : http://localhost:8000/api
- **Admin Django** : http://localhost:8000/admin
- **Documentation API** : http://localhost:8000/api/docs

### Installation Manuelle

Si vous préférez installer manuellement :

```bash
# 1. Cloner le projet
git clone https://github.com/Max-kleb/FindPharma.git
cd FindPharma

# 2. Créer le fichier .env
cp .env.example .env
# Éditez .env avec vos vraies valeurs

# 3. Construire les images Docker
docker-compose build

# 4. Démarrer les services
docker-compose up -d

# 5. Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# 6. (Optionnel) Peupler avec des données de test
docker-compose exec backend python populate_database.py
```

---

## 🔧 Commandes Utiles

Nous avons créé un **Makefile** pour simplifier les commandes Docker :

### Commandes Principales

```bash
make help              # 📖 Afficher toutes les commandes disponibles
make up                # 🚀 Démarrer tous les services
make down              # 🛑 Arrêter tous les services
make restart           # 🔄 Redémarrer tous les services
make logs              # 📋 Voir les logs en temps réel
make ps                # 📊 Voir le statut des services
```

### Développement

```bash
make dev               # 🔥 Mode développement avec hot-reload
make logs-backend      # 📋 Logs du backend uniquement
make logs-frontend     # 📋 Logs du frontend uniquement
make shell-backend     # 🐚 Accéder au shell du backend
make shell-db          # 🗄️  Accéder au shell PostgreSQL
```

### Base de Données

```bash
make migrate           # 🔄 Exécuter les migrations Django
make makemigrations    # 📝 Créer de nouvelles migrations
make backup-db         # 💾 Sauvegarder la base de données
make restore-db FILE=backup.sql  # 🔄 Restaurer la base de données
```

### Tests

```bash
make test-backend      # 🧪 Tests backend
make test-frontend     # 🧪 Tests frontend
```

### Production

```bash
make prod-build        # 🏗️  Build pour production
make prod-up           # 🚀 Démarrer en production
make prod-down         # 🛑 Arrêter production
make prod-logs         # 📋 Logs production
```

---

## 📚 Documentation

- **[Guide Docker Complet](./DOCKER_GUIDE.md)** - Documentation détaillée de la dockerisation
- **[Quick Start Docker](./DOCKER_README.md)** - Démarrage rapide Docker
- **[Documentation API](http://localhost:8000/api/docs)** - Swagger automatique (après démarrage)

---

## 🌐 API REST

### Points de terminaison principaux

#### Pharmacies
```
GET    /api/pharmacies/          # Liste des pharmacies
GET    /api/pharmacies/{id}/     # Détails d'une pharmacie
GET    /api/pharmacies/nearby/   # Pharmacies proches (géolocalisation)
POST   /api/pharmacies/          # Créer une pharmacie (admin)
PUT    /api/pharmacies/{id}/     # Modifier une pharmacie
DELETE /api/pharmacies/{id}/     # Supprimer une pharmacie
```

#### Médicaments
```
GET    /api/medicines/           # Liste des médicaments
GET    /api/medicines/{id}/      # Détails d'un médicament
GET    /api/medicines/search/    # Rechercher des médicaments
POST   /api/medicines/           # Créer un médicament (admin)
```

#### Stocks
```
GET    /api/stocks/              # Liste des stocks
GET    /api/stocks/by-medicine/  # Stocks par médicament
POST   /api/stocks/              # Créer un stock (pharmacie)
PUT    /api/stocks/{id}/         # Modifier un stock
DELETE /api/stocks/{id}/         # Supprimer un stock
```

#### Authentification
```
POST   /api/token/               # Obtenir un token JWT
POST   /api/token/refresh/       # Rafraîchir le token
POST   /api/register/            # S'inscrire
POST   /api/login/               # Se connecter
```

#### Réservations
```
GET    /api/reservations/        # Mes réservations
POST   /api/reservations/        # Créer une réservation
PUT    /api/reservations/{id}/   # Modifier une réservation
DELETE /api/reservations/{id}/   # Annuler une réservation
```

### Documentation Interactive

Une fois l'application démarrée, accédez à la documentation Swagger :
- **Swagger UI** : http://localhost:8000/api/docs
- **ReDoc** : http://localhost:8000/api/redoc
- **OpenAPI Schema** : http://localhost:8000/api/schema

---

## 🌍 Internationalisation

FindPharma est disponible en **3 langues** :

- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **Anglais**
- 🇪🇸 **Espagnol**

Le changement de langue est instantané et couvre toute l'interface, y compris :
- Toutes les pages (Accueil, À propos, FAQ, Mentions légales)
- Les messages d'erreur
- Les notifications
- Les formulaires

---

## 👥 Équipe de Développement

- **NGOM Françoise Lorraine** - Développeuse Frontend
- **NKOT Jean Franky** - Chef d'Équipe & Développeur Backend
- **KENMOE MEUGANG Oriane Stevye** - Développeuse Frontend
- **SONKE KAMGHA Maxime Klebert** - Développeur Backend
- **DONGMO TCHOUTEZO Evenis** - Développeur Frontend

---

## 🔒 Sécurité

### En Développement
- Debug mode activé
- CORS permissif
- Secret key par défaut
- Console email backend

### En Production (Recommandations)
- ✅ `DEBUG=False`
- ✅ Secret key forte et unique
- ✅ `ALLOWED_HOSTS` configuré
- ✅ CORS restreint aux domaines autorisés
- ✅ HTTPS avec certificat SSL
- ✅ Passwords PostgreSQL forts
- ✅ Backups automatiques de la DB
- ✅ Monitoring et logs

---

## 🧪 Tests

### Tests Backend (Django)

```bash
# Tous les tests
make test-backend

# Tests spécifiques
docker-compose exec backend python manage.py test pharmacies
docker-compose exec backend python manage.py test medicines
docker-compose exec backend python manage.py test stocks
```

### Tests Frontend (React)

```bash
# Tous les tests
make test-frontend

# Tests avec coverage
docker-compose exec frontend npm test -- --coverage
```

### Tests d'Intégration

```bash
# Lancer les tests dans des conteneurs isolés
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
make stats
# OU
docker stats
```

### Logs en temps réel

```bash
# Tous les services
make logs

# Service spécifique
make logs-backend
make logs-frontend
make logs-db
```

---

## 🚢 Déploiement

### Déploiement sur VPS (DigitalOcean, AWS, etc.)

```bash
# 1. Sur le serveur, installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Cloner le projet
git clone https://github.com/Max-kleb/FindPharma.git
cd FindPharma

# 3. Configurer .env pour production
cp .env.example .env
nano .env  # Modifier avec vraies valeurs

# 4. Démarrer en mode production
make prod-up

# 5. Créer le superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Déploiement avec CI/CD

Le projet inclut une configuration GitHub Actions (`.github/workflows/docker.yml`) qui :
- ✅ Exécute les tests automatiquement
- ✅ Build les images Docker
- ✅ Vérifie la configuration Docker Compose

---

## 🆘 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
make logs-backend

# Redémarrer le service
docker-compose restart backend

# Si la DB n'est pas prête, attendez 30 secondes
sleep 30 && docker-compose restart backend
```

### Le frontend affiche une erreur 502

```bash
# Vérifier que le backend est accessible
docker-compose ps
make logs-backend
```

### Erreur "Port already in use"

```bash
# Trouver quel processus utilise le port
sudo lsof -i :80
sudo lsof -i :8000

# Arrêter le processus OU changer le port dans docker-compose.yml
```

### Réinitialisation complète

```bash
# Tout supprimer et recommencer
make clean
make build
make up
```

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📞 Contact

Pour toute question ou suggestion :

- **Email** : contact@findpharma.cm
- **GitHub Issues** : https://github.com/Max-kleb/FindPharma/issues
- **Facebook** : FindPharma Cameroun

---

## 🙏 Remerciements

- [Django](https://www.djangoproject.com/) - Framework backend
- [React](https://react.dev/) - Framework frontend
- [PostgreSQL](https://www.postgresql.org/) - Base de données
- [PostGIS](https://postgis.net/) - Extension géospatiale
- [Leaflet](https://leafletjs.com/) - Cartographie
- [Docker](https://www.docker.com/) - Conteneurisation

---

<div align="center">

**⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ by the FindPharma Team

</div>
