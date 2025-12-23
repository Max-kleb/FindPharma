#!/bin/bash
# deploy.sh - Script de déploiement FindPharma pour Oracle Cloud
# Usage: ./deploy.sh [init|ssl|start|stop|logs|status|backup]

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="findpharma.app"
EMAIL="contact.findpharma@gmail.com"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Créer les dossiers nécessaires
setup_directories() {
    log_info "Création des dossiers..."
    mkdir -p "$PROJECT_DIR/certbot/www"
    mkdir -p "$PROJECT_DIR/certbot/conf"
    log_success "Dossiers créés"
}

# Initialisation (première exécution)
init() {
    log_info "=== Initialisation du déploiement ==="
    
    check_prerequisites
    setup_directories
    
    # Vérifier le fichier .env.production
    if [ ! -f "$PROJECT_DIR/backend/.env.production" ]; then
        log_error "Le fichier backend/.env.production n'existe pas!"
        log_info "Copiez backend/.env.production.example et configurez-le"
        exit 1
    fi
    
    log_info "Construction des images Docker..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    log_success "Initialisation terminée"
    log_info "Prochaine étape: ./deploy.sh ssl"
}

# Obtenir le certificat SSL
ssl() {
    log_info "=== Configuration SSL avec Let's Encrypt ==="
    
    setup_directories
    
    # Utiliser la configuration Nginx initiale
    cp "$PROJECT_DIR/nginx/nginx.init.conf" "$PROJECT_DIR/nginx/nginx.prod.conf.backup"
    cp "$PROJECT_DIR/nginx/nginx.init.conf" "$PROJECT_DIR/nginx/nginx.prod.conf.tmp"
    
    # Démarrer Nginx avec config initiale
    log_info "Démarrage de Nginx pour validation ACME..."
    
    # Créer un docker-compose temporaire pour le SSL
    docker run -d --name nginx_ssl_init \
        -p 80:80 \
        -v "$PROJECT_DIR/nginx/nginx.init.conf:/etc/nginx/nginx.conf:ro" \
        -v "$PROJECT_DIR/certbot/www:/var/www/certbot:ro" \
        nginx:alpine
    
    sleep 5
    
    # Obtenir le certificat
    log_info "Obtention du certificat SSL pour $DOMAIN..."
    docker run --rm \
        -v "$PROJECT_DIR/certbot/www:/var/www/certbot" \
        -v "$PROJECT_DIR/certbot/conf:/etc/letsencrypt" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"
    
    # Arrêter Nginx temporaire
    docker stop nginx_ssl_init && docker rm nginx_ssl_init
    
    # Restaurer la vraie config Nginx
    mv "$PROJECT_DIR/nginx/nginx.prod.conf.backup" "$PROJECT_DIR/nginx/nginx.prod.conf"
    rm -f "$PROJECT_DIR/nginx/nginx.prod.conf.tmp"
    
    log_success "Certificat SSL obtenu avec succès!"
    log_info "Prochaine étape: ./deploy.sh start"
}

# Démarrer l'application
start() {
    log_info "=== Démarrage de FindPharma ==="
    
    check_prerequisites
    
    # Vérifier le certificat SSL
    if [ ! -d "$PROJECT_DIR/certbot/conf/live/$DOMAIN" ]; then
        log_warning "Certificat SSL non trouvé. Exécutez d'abord: ./deploy.sh ssl"
        log_info "Démarrage en mode HTTP uniquement..."
    fi
    
    log_info "Démarrage des containers..."
    docker compose -f docker-compose.prod.yml up -d
    
    sleep 10
    
    log_success "FindPharma est démarré!"
    log_info "Vérifiez le statut avec: ./deploy.sh status"
    log_info "Site accessible sur: https://$DOMAIN"
}

# Arrêter l'application
stop() {
    log_info "=== Arrêt de FindPharma ==="
    docker compose -f docker-compose.prod.yml down
    log_success "Application arrêtée"
}

# Voir les logs
logs() {
    local service="${1:-}"
    if [ -n "$service" ]; then
        docker compose -f docker-compose.prod.yml logs -f "$service"
    else
        docker compose -f docker-compose.prod.yml logs -f
    fi
}

# Statut des services
status() {
    log_info "=== Statut des services FindPharma ==="
    docker compose -f docker-compose.prod.yml ps
}

# Backup de la base de données
backup() {
    log_info "=== Backup de la base de données ==="
    
    local backup_dir="$PROJECT_DIR/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/findpharma_$timestamp.sql"
    
    mkdir -p "$backup_dir"
    
    docker compose -f docker-compose.prod.yml exec -T db \
        pg_dump -U findpharmauser findpharma > "$backup_file"
    
    log_success "Backup créé: $backup_file"
}

# Restaurer la base de données
restore() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Usage: ./deploy.sh restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Fichier de backup non trouvé: $backup_file"
        exit 1
    fi
    
    log_warning "Cette action va remplacer toutes les données actuelles!"
    read -p "Continuer? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f docker-compose.prod.yml exec -T db \
            psql -U findpharmauser -d findpharma < "$backup_file"
        log_success "Base de données restaurée"
    else
        log_info "Restauration annulée"
    fi
}

# Mise à jour de l'application
update() {
    log_info "=== Mise à jour de FindPharma ==="
    
    # Pull les dernières modifications
    git pull origin main
    
    # Rebuild et redémarrer
    docker compose -f docker-compose.prod.yml build
    docker compose -f docker-compose.prod.yml up -d
    
    log_success "Application mise à jour!"
}

# Renouveler le certificat SSL
renew_ssl() {
    log_info "=== Renouvellement du certificat SSL ==="
    
    docker compose -f docker-compose.prod.yml run --rm certbot renew
    docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
    
    log_success "Certificat renouvelé"
}

# Menu d'aide
help() {
    echo "Usage: ./deploy.sh [commande]"
    echo ""
    echo "Commandes disponibles:"
    echo "  init        Première initialisation (build des images)"
    echo "  ssl         Obtenir le certificat SSL Let's Encrypt"
    echo "  start       Démarrer l'application"
    echo "  stop        Arrêter l'application"
    echo "  logs [srv]  Voir les logs (optionnel: service spécifique)"
    echo "  status      Voir le statut des services"
    echo "  backup      Créer un backup de la base de données"
    echo "  restore     Restaurer un backup"
    echo "  update      Mettre à jour l'application"
    echo "  renew_ssl   Renouveler le certificat SSL"
    echo "  help        Afficher cette aide"
}

# Main
case "${1:-help}" in
    init)       init ;;
    ssl)        ssl ;;
    start)      start ;;
    stop)       stop ;;
    logs)       logs "$2" ;;
    status)     status ;;
    backup)     backup ;;
    restore)    restore "$2" ;;
    update)     update ;;
    renew_ssl)  renew_ssl ;;
    help|*)     help ;;
esac
