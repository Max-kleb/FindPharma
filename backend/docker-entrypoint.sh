#!/bin/bash
set -e

echo "🐳 FindPharma Backend - Docker Entrypoint"
echo "=========================================="

# Fonction pour attendre PostgreSQL
wait_for_db() {
    echo "🔄 Waiting for PostgreSQL database..."
    
    max_retries=30
    retries=0
    
    until python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(
        dbname="${DATABASE_NAME:-findpharma}",
        user="${DATABASE_USER:-findpharmauser}",
        password="${DATABASE_PASSWORD:-root}",
        host="${DATABASE_HOST:-db}",
        port="${DATABASE_PORT:-5432}"
    )
    conn.close()
    sys.exit(0)
except psycopg2.OperationalError:
    sys.exit(1)
END
    do
        retries=$((retries + 1))
        if [ $retries -eq $max_retries ]; then
            echo "❌ Could not connect to database after $max_retries attempts"
            exit 1
        fi
        echo "   Attempt $retries/$max_retries - Retrying in 2 seconds..."
        sleep 2
    done
    
    echo "✅ Database is ready!"
}

# Attendre la base de données
wait_for_db

# Exécuter les migrations
echo "🔄 Running database migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "🔄 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Créer le superuser si les variables sont définies
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "👤 Creating superuser..."
    python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser(
        username='$DJANGO_SUPERUSER_USERNAME',
        email='${DJANGO_SUPERUSER_EMAIL:-admin@findpharma.cm}',
        password='$DJANGO_SUPERUSER_PASSWORD'
    )
    print('✅ Superuser created')
else:
    print('ℹ️  Superuser already exists')
END
fi

echo "🚀 Starting Django development server..."
echo "   Listening on 0.0.0.0:8000"
echo ""

# Exécuter la commande passée en argument ou runserver par défaut
if [ "$#" -eq 0 ]; then
    exec python manage.py runserver 0.0.0.0:8000
else
    exec "$@"
fi
