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

# Peupler automatiquement la base de données si elle est vide
echo "🔄 Checking if database needs population..."
python << 'POPULATE_SCRIPT'
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from medicines.models import Medicine
from pharmacies.models import Pharmacy
from stocks.models import Stock

medicine_count = Medicine.objects.count()
pharmacy_count = Pharmacy.objects.count()
stock_count = Stock.objects.count()

print(f"📊 État actuel de la base de données:")
print(f"   - Médicaments: {medicine_count}")
print(f"   - Pharmacies: {pharmacy_count}")
print(f"   - Stocks: {stock_count}")

needs_population = False

# Vérifier si on doit peupler les médicaments
if medicine_count < 10:
    print("📦 Peu de médicaments - peuplement nécessaire")
    needs_population = True

# Vérifier si on doit peupler les pharmacies et stocks
if pharmacy_count < 5 or stock_count < 100:
    print("🏥 Peu de pharmacies/stocks - peuplement nécessaire")
    needs_population = True

if needs_population:
    print("\n🚀 Lancement du peuplement automatique...")
    try:
        # Exécuter le script de peuplement camerounais
        exec(open('scripts/populate_cameroon_pharmacies.py').read())
        print("\n✅ Peuplement terminé avec succès!")
    except Exception as e:
        print(f"⚠️  Erreur lors du peuplement: {e}")
        # Essayer le peuplement basique des médicaments
        try:
            from django.core.management import call_command
            call_command('populate_medicines')
            print("✅ Médicaments peuplés via commande Django")
        except Exception as e2:
            print(f"⚠️  Erreur secondaire: {e2}")
else:
    print("✅ Base de données déjà peuplée - aucune action nécessaire")

POPULATE_SCRIPT

echo "🚀 Starting Django development server..."
echo "   Listening on 0.0.0.0:8000"
echo ""

# Exécuter la commande passée en argument ou runserver par défaut
if [ "$#" -eq 0 ]; then
    exec python manage.py runserver 0.0.0.0:8000
else
    exec "$@"
fi
