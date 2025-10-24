import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from pharmacies.models import Pharmacy

# Données de test pour Yaoundé
pharmacies_data = [
    {
        'name': 'Pharmacie Centrale',
        'address': 'Avenue Kennedy, Yaoundé',
        'phone': '+237 222 23 45 67',
        'email': 'centrale@pharma.cm',
        'latitude': 3.8480,
        'longitude': 11.5021,
    },
    {
        'name': 'Pharmacie du Mfoundi',
        'address': 'Rue de Nachtigal, Yaoundé',
        'phone': '+237 222 23 56 78',
        'email': 'mfoundi@pharma.cm',
        'latitude': 3.8667,
        'longitude': 11.5167,
    },
    {
        'name': 'Pharmacie Bastos',
        'address': 'Quartier Bastos, Yaoundé',
        'phone': '+237 222 23 67 89',
        'email': 'bastos@pharma.cm',
        'latitude': 3.8850,
        'longitude': 11.5180,
    },
    {
        'name': 'Pharmacie Mokolo',
        'address': 'Marché Mokolo, Yaoundé',
        'phone': '+237 222 23 78 90',
        'email': 'mokolo@pharma.cm',
        'latitude': 3.8700,
        'longitude': 11.4900,
    },
    {
        'name': 'Pharmacie Essos',
        'address': 'Quartier Essos, Yaoundé',
        'phone': '+237 222 23 89 01',
        'email': 'essos@pharma.cm',
        'latitude': 3.8300,
        'longitude': 11.5300,
    },
]

# Créer les pharmacies
for data in pharmacies_data:
    pharmacy, created = Pharmacy.objects.get_or_create(
        name=data['name'],
        defaults=data
    )
    if created:
        print(f"✅ Pharmacie créée : {pharmacy.name}")
    else:
        print(f"ℹ️  Pharmacie existe déjà : {pharmacy.name}")

print(f"\n✅ Total de pharmacies dans la base : {Pharmacy.objects.count()}")