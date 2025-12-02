#!/usr/bin/env python
"""
Health check script pour Docker
Vérifie que Django est prêt à accepter des requêtes
"""
import sys
import os

# Ajouter le chemin du projet au PYTHONPATH
sys.path.insert(0, '/app')

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')

import django
django.setup()

from django.db import connections
from django.db.utils import OperationalError

def check_database():
    """Vérifie la connexion à la base de données"""
    try:
        db_conn = connections['default']
        db_conn.cursor()
        return True
    except OperationalError:
        return False

def main():
    """Point d'entrée principal"""
    if not check_database():
        print("❌ Database connection failed")
        sys.exit(1)
    
    print("✅ Health check passed")
    sys.exit(0)

if __name__ == '__main__':
    main()
