#!/usr/bin/env python3
"""
Script pour repeupler la base de données avec des pharmacies camerounaises
Usage: python populate_cameroon_pharmacies.py
"""

import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from pharmacies.models import Pharmacy
from medicines.models import Medicine
from stocks.models import Stock
from decimal import Decimal

print("🇨🇲 Repeuplement de la base avec des pharmacies camerounaises\n")

# ============================================================================
# ÉTAPE 1 : Supprimer les anciennes données
# ============================================================================
print("🗑️  Suppression des anciennes données...")
Stock.objects.all().delete()
print("   ✅ Stocks supprimés")
Pharmacy.objects.all().delete()
print("   ✅ Pharmacies supprimées")
# On garde les médicaments car ils sont universels

# ============================================================================
# ÉTAPE 2 : Créer les pharmacies camerounaises
# ============================================================================
print("\n📍 Création des pharmacies camerounaises...")

pharmacies_data = [
    # YAOUNDÉ (Capitale)
    {
        'name': 'Pharmacie Centrale de Yaoundé',
        'address': 'Avenue Kennedy, Centre-ville, Yaoundé',
        'phone': '+237 222 23 45 67',
        'email': 'centrale.yde@pharma.cm',
        'latitude': 3.8480,
        'longitude': 11.5021,
        'is_active': True,
    },
    {
        'name': 'Pharmacie du Mfoundi',
        'address': 'Rue de Nachtigal, Quartier Administratif, Yaoundé',
        'phone': '+237 222 23 56 78',
        'email': 'mfoundi@pharma.cm',
        'latitude': 3.8667,
        'longitude': 11.5167,
        'city': 'Yaoundé',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Bastos',
        'address': 'Quartier Bastos, près de l\'Ambassade de France, Yaoundé',
        'phone': '+237 222 23 67 89',
        'email': 'bastos@pharma.cm',
        'latitude': 3.8850,
        'longitude': 11.5180,
        'city': 'Yaoundé',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Mokolo',
        'address': 'Marché Mokolo, Yaoundé',
        'phone': '+237 222 23 78 90',
        'email': 'mokolo@pharma.cm',
        'latitude': 3.8700,
        'longitude': 11.4900,
        'city': 'Yaoundé',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Essos',
        'address': 'Quartier Essos, Yaoundé',
        'phone': '+237 222 23 89 01',
        'email': 'essos@pharma.cm',
        'latitude': 3.8300,
        'longitude': 11.5300,
        'city': 'Yaoundé',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Mvog-Ada',
        'address': 'Quartier Mvog-Ada, Yaoundé',
        'phone': '+237 222 24 12 34',
        'email': 'mvogada@pharma.cm',
        'latitude': 3.8400,
        'longitude': 11.5100,
        'city': 'Yaoundé',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Omnisport',
        'address': 'Face au Stade Omnisport, Yaoundé',
        'phone': '+237 222 24 23 45',
        'email': 'omnisport@pharma.cm',
        'latitude': 3.8580,
        'longitude': 11.5250,
        'city': 'Yaoundé',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Melen',
        'address': 'Quartier Melen, Yaoundé',
        'phone': '+237 222 24 34 56',
        'email': 'melen@pharma.cm',
        'latitude': 3.8200,
        'longitude': 11.4800,
        'city': 'Yaoundé',
        'is_active': True,
    },
    
    # DOUALA (Capitale économique)
    {
        'name': 'Pharmacie Centrale de Douala',
        'address': 'Boulevard de la Liberté, Akwa, Douala',
        'phone': '+237 233 42 12 34',
        'email': 'centrale.dla@pharma.cm',
        'latitude': 4.0511,
        'longitude': 9.7679,
        'city': 'Douala',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Akwa',
        'address': 'Quartier Akwa, Douala',
        'phone': '+237 233 42 23 45',
        'email': 'akwa@pharma.cm',
        'latitude': 4.0500,
        'longitude': 9.7700,
        'city': 'Douala',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Bonanjo',
        'address': 'Quartier Bonanjo, Douala',
        'phone': '+237 233 42 34 56',
        'email': 'bonanjo@pharma.cm',
        'latitude': 4.0600,
        'longitude': 9.7100,
        'city': 'Douala',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Bonabéri',
        'address': 'Bonabéri, Douala',
        'phone': '+237 233 42 45 67',
        'email': 'bonaberi@pharma.cm',
        'latitude': 4.0800,
        'longitude': 9.6900,
        'city': 'Douala',
        'is_active': True,
    },
    {
        'name': 'Pharmacie New Bell',
        'address': 'Marché New Bell, Douala',
        'phone': '+237 233 42 56 78',
        'email': 'newbell@pharma.cm',
        'latitude': 4.0400,
        'longitude': 9.7200,
        'city': 'Douala',
        'is_active': True,
    },
    
    # BAFOUSSAM (Ouest)
    {
        'name': 'Pharmacie Centrale de Bafoussam',
        'address': 'Centre-ville, Bafoussam',
        'phone': '+237 233 44 12 34',
        'email': 'centrale.baf@pharma.cm',
        'latitude': 5.4781,
        'longitude': 10.4178,
        'city': 'Bafoussam',
        'is_active': True,
    },
    {
        'name': 'Pharmacie Marché A',
        'address': 'Marché A, Bafoussam',
        'phone': '+237 233 44 23 45',
        'email': 'marchea@pharma.cm',
        'latitude': 5.4800,
        'longitude': 10.4200,
        'city': 'Bafoussam',
        'is_active': True,
    },
    
    # GAROUA (Nord)
    {
        'name': 'Pharmacie Centrale de Garoua',
        'address': 'Centre-ville, Garoua',
        'phone': '+237 222 27 12 34',
        'email': 'centrale.gar@pharma.cm',
        'latitude': 9.3012,
        'longitude': 13.3976,
        'city': 'Garoua',
        'is_active': True,
    },
    
    # BAMENDA (Nord-Ouest)
    {
        'name': 'Pharmacy Central Bamenda',
        'address': 'Commercial Avenue, Bamenda',
        'phone': '+237 233 36 12 34',
        'email': 'central.bda@pharma.cm',
        'latitude': 5.9597,
        'longitude': 10.1453,
        'city': 'Bamenda',
        'is_active': True,
    },
    
    # BUEA (Sud-Ouest)
    {
        'name': 'Pharmacy Mount Cameroon',
        'address': 'Main Street, Buea',
        'phone': '+237 233 32 12 34',
        'email': 'mountcam@pharma.cm',
        'latitude': 4.1560,
        'longitude': 9.2320,
        'city': 'Buea',
        'is_active': True,
    },
    
    # KRIBI (Sud, ville côtière)
    {
        'name': 'Pharmacie du Littoral',
        'address': 'Route de la Plage, Kribi',
        'phone': '+237 243 46 12 34',
        'email': 'littoral.kbi@pharma.cm',
        'latitude': 2.9387,
        'longitude': 9.9087,
        'city': 'Kribi',
        'is_active': True,
    },
]

# Créer les pharmacies
pharmacies_dict = {}
for data in pharmacies_data:
    pharmacy, created = Pharmacy.objects.get_or_create(
        name=data['name'],
        defaults=data
    )
    pharmacies_dict[pharmacy.name] = pharmacy
    if created:
        print(f"   ✅ {pharmacy.name} ({pharmacy.city})")
    else:
        print(f"   ℹ️  {pharmacy.name} ({pharmacy.city}) - existe déjà")

print(f"\n✅ Total: {Pharmacy.objects.count()} pharmacies créées")

# ============================================================================
# ÉTAPE 3 : Créer ou récupérer les médicaments
# ============================================================================
print("\n💊 Vérification des médicaments...")

medicines_data = [
    {
        'name': 'Doliprane',
        'description': 'Paracétamol - Antalgique et antipyrétique',
        'dosage': '1000mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Ibuprofène',
        'description': 'Anti-inflammatoire non stéroïdien',
        'dosage': '400mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Amoxicilline',
        'description': 'Antibiotique à large spectre',
        'dosage': '500mg',
        'form': 'Gélule',
    },
    {
        'name': 'Efferalgan',
        'description': 'Paracétamol effervescent',
        'dosage': '1g',
        'form': 'Comprimé effervescent',
    },
    {
        'name': 'Spasfon',
        'description': 'Antispasmodique',
        'dosage': '80mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Artésunate',
        'description': 'Antipaludique (important au Cameroun)',
        'dosage': '50mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Coartem',
        'description': 'Traitement du paludisme',
        'dosage': '20/120mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Nivaquine',
        'description': 'Chloroquine - Antipaludique',
        'dosage': '100mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Flagyl',
        'description': 'Métronidazole - Antibiotique',
        'dosage': '500mg',
        'form': 'Comprimé',
    },
    {
        'name': 'Vitamine C',
        'description': 'Acide ascorbique - Complément vitaminique',
        'dosage': '500mg',
        'form': 'Comprimé',
    },
]

medicines_dict = {}
for data in medicines_data:
    medicine, created = Medicine.objects.get_or_create(
        name=data['name'],
        dosage=data['dosage'],
        defaults=data
    )
    medicines_dict[medicine.name] = medicine
    if created:
        print(f"   ✅ {medicine.name} {medicine.dosage}")
    else:
        print(f"   ℹ️  {medicine.name} {medicine.dosage} - existe déjà")

print(f"\n✅ Total: {Medicine.objects.count()} médicaments disponibles")

# ============================================================================
# ÉTAPE 4 : Créer les stocks
# ============================================================================
print("\n📦 Création des stocks...")

# Distribution des médicaments dans les pharmacies
import random

stock_count = 0
for pharmacy in Pharmacy.objects.all():
    # Chaque pharmacie aura entre 5 et 10 médicaments différents
    num_medicines = random.randint(5, 10)
    selected_medicines = random.sample(list(medicines_dict.values()), num_medicines)
    
    for medicine in selected_medicines:
        # Prix en FCFA (Franc CFA)
        description = medicine.description or ""
        if 'paludisme' in description.lower() or 'Artésunate' in medicine.name or 'Coartem' in medicine.name:
            # Antipaludiques plus chers
            price = Decimal(random.randint(3000, 8000))
        else:
            price = Decimal(random.randint(500, 5000))
        
        quantity = random.randint(5, 100)
        is_available = quantity > 10
        
        stock = Stock.objects.create(
            pharmacy=pharmacy,
            medicine=medicine,
            quantity=quantity,
            price=price,
            is_available=is_available
        )
        stock_count += 1

print(f"   ✅ {stock_count} entrées de stock créées")

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
print("\n" + "="*70)
print("✅ BASE DE DONNÉES REPEUPLÉE AVEC SUCCÈS")
print("="*70)
print(f"📍 Pharmacies: {Pharmacy.objects.count()}")
print(f"💊 Médicaments: {Medicine.objects.count()}")
print(f"📦 Stocks: {Stock.objects.count()}")
print("\n🇨🇲 Pharmacies créées:")
print("   • Yaoundé: 8 pharmacies")
print("   • Douala: 5 pharmacies")
print("   • Bafoussam: 2 pharmacies")
print("   • Garoua, Bamenda, Buea, Kribi: 1 pharmacie chacune")

print("\n💡 Médicaments importants pour le Cameroun:")
important = ['Artésunate', 'Coartem', 'Nivaquine']
for med_name in important:
    if med_name in medicines_dict:
        count = Stock.objects.filter(medicine=medicines_dict[med_name], is_available=True).count()
        print(f"   • {med_name}: disponible dans {count} pharmacie(s)")

print("\n🚀 Vous pouvez maintenant tester l'application!")
print("   - Recherchez 'doliprane', 'artésunate', ou 'coartem'")
print("   - Localisez-vous pour trouver les pharmacies proches")
print("="*70)
