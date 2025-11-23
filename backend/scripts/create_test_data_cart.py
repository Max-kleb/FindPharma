"""
Script pour créer des données de test pour le système de panier
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from medicines.models import Medicine
from pharmacies.models import Pharmacy
from stocks.models import Stock
from decimal import Decimal

print("🔧 Création des données de test pour le panier...")

# Créer des médicaments
print("\n📦 Création des médicaments...")
medicines = [
    {
        'name': 'Doliprane 1000mg',
        'description': 'Paracétamol pour douleurs et fièvre',
        'dosage': '1000mg',
        'form': 'Comprimé',
        'average_price': Decimal('3.50'),
        'requires_prescription': False
    },
    {
        'name': 'Ibuprofène 400mg',
        'description': 'Anti-inflammatoire non stéroïdien',
        'dosage': '400mg',
        'form': 'Comprimé',
        'average_price': Decimal('4.20'),
        'requires_prescription': False
    },
    {
        'name': 'Spasfon',
        'description': 'Antispasmodique pour douleurs abdominales',
        'dosage': '80mg',
        'form': 'Comprimé',
        'average_price': Decimal('5.80'),
        'requires_prescription': False
    },
    {
        'name': 'Amoxicilline 500mg',
        'description': 'Antibiotique à large spectre',
        'dosage': '500mg',
        'form': 'Gélule',
        'average_price': Decimal('8.50'),
        'requires_prescription': True
    },
    {
        'name': 'Ventoline',
        'description': 'Bronchodilatateur pour asthme',
        'dosage': '100µg',
        'form': 'Inhalateur',
        'average_price': Decimal('12.00'),
        'requires_prescription': True
    },
]

created_medicines = []
for med_data in medicines:
    medicine, created = Medicine.objects.get_or_create(
        name=med_data['name'],
        defaults=med_data
    )
    created_medicines.append(medicine)
    status = "✓ Créé" if created else "✓ Existe déjà"
    print(f"  {status}: {medicine.name}")

# Créer des pharmacies
print("\n🏥 Création des pharmacies...")
pharmacies_data = [
    {
        'name': 'Pharmacie Centrale',
        'address': '15 Avenue des Champs-Élysées, 75008 Paris',
        'phone': '0142250101',
        'email': 'contact@pharmacie-centrale.fr',
        'latitude': 48.8566,
        'longitude': 2.3522,
        'is_active': True
    },
    {
        'name': 'Pharmacie du Marché',
        'address': '23 Rue de la République, 69002 Lyon',
        'phone': '0472345678',
        'email': 'contact@pharmacie-marche.fr',
        'latitude': 45.7640,
        'longitude': 4.8357,
        'is_active': True
    },
    {
        'name': 'Pharmacie Saint-Michel',
        'address': '42 Boulevard Saint-Michel, 75006 Paris',
        'phone': '0143267890',
        'email': 'contact@pharmacie-stmichel.fr',
        'latitude': 48.8499,
        'longitude': 2.3437,
        'is_active': True
    },
]

created_pharmacies = []
for pharm_data in pharmacies_data:
    pharmacy, created = Pharmacy.objects.get_or_create(
        name=pharm_data['name'],
        defaults=pharm_data
    )
    created_pharmacies.append(pharmacy)
    status = "✓ Créé" if created else "✓ Existe déjà"
    print(f"  {status}: {pharmacy.name}")

# Créer des stocks
print("\n📊 Création des stocks...")
import random

stocks_created = 0
for pharmacy in created_pharmacies:
    for medicine in created_medicines:
        # Créer un stock pour chaque combinaison pharmacie-médicament
        quantity = random.randint(10, 100)
        price = medicine.average_price + Decimal(random.uniform(-0.5, 1.5))
        price = round(price, 2)
        
        stock, created = Stock.objects.get_or_create(
            pharmacy=pharmacy,
            medicine=medicine,
            defaults={
                'quantity': quantity,
                'price': price,
                'is_available': True
            }
        )
        
        if created:
            stocks_created += 1
            print(f"  ✓ {medicine.name} @ {pharmacy.name}: {quantity} unités à {price}€")

print(f"\n✅ Données de test créées avec succès!")
print(f"   - {len(created_medicines)} médicaments")
print(f"   - {len(created_pharmacies)} pharmacies")
print(f"   - {stocks_created} stocks créés")
