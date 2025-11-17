"""
Script d'importation des données de test depuis test_data.json
Usage: python import_test_data.py
"""

import os
import sys
import json
import django
from decimal import Decimal

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from medicines.models import Medicine
from pharmacies.models import Pharmacy
from stocks.models import Stock 


def import_data():
    """Importe les données depuis test_data.json"""
    
    print("=" * 60)
    print("IMPORTATION DES DONNÉES TEST - FindPharma")
    print("=" * 60)
    
    # Charger le fichier JSON
    try:
        with open('test_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ Fichier test_data.json chargé avec succès")
    except FileNotFoundError:
        print("❌ ERREUR: Le fichier test_data.json est introuvable")
        print("   Assurez-vous qu'il est dans le même dossier que ce script")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ ERREUR: Le fichier JSON est invalide: {e}")
        sys.exit(1)
    
    # Demander confirmation avant de supprimer
    print("\n⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes")
    confirmation = input("Voulez-vous continuer ? (oui/non): ").lower().strip()
    
    if confirmation not in ['oui', 'o', 'yes', 'y']:
        print("❌ Importation annulée")
        sys.exit(0)
    
    print("\n🗑️  Suppression des anciennes données...")
    Stock.objects.all().delete()
    Medicine.objects.all().delete()
    Pharmacy.objects.all().delete()
    print("   ✓ Anciennes données supprimées")
    
    # Importer les pharmacies
    print("\n📍 Importation des pharmacies...")
    pharmacies_list = []
    for idx, pharma_data in enumerate(data['pharmacies'], 1):
        pharmacy = Pharmacy.objects.create(
            name=pharma_data['name'],
            address=pharma_data['address'],
            phone=pharma_data['phone'],
            email=pharma_data.get('email', ''),
            latitude=pharma_data['latitude'],
            longitude=pharma_data['longitude'],
            opening_hours=pharma_data.get('opening_hours', {}),
            is_active=pharma_data.get('is_active', True)
        )
        pharmacies_list.append(pharmacy)
        print(f"   ✓ [{idx}/{len(data['pharmacies'])}] {pharmacy.name}")
    
    print(f"\n✅ {len(pharmacies_list)} pharmacies importées")
    
    # Importer les médicaments
    print("\n💊 Importation des médicaments...")
    medicaments_list = []
    for idx, med_data in enumerate(data['medicaments'], 1):
        medicament = Medicine.objects.create(
            name=med_data['name'],
            description=med_data.get('description', ''),
            dosage=med_data.get('dosage', ''),
            form=med_data.get('form', ''),
            average_price=Decimal(str(med_data.get('average_price', 0))),
            requires_prescription=med_data.get('requires_prescription', False)
        )
        medicaments_list.append(medicament)
        print(f"   ✓ [{idx}/{len(data['medicaments'])}] {medicament.name} {medicament.dosage}")
    
    print(f"\n✅ {len(medicaments_list)} médicaments importés")
    
    # Importer les stocks
    print("\n📦 Importation des stocks...")
    stocks_created = 0
    for idx, stock_data in enumerate(data['stocks'], 1):
        pharmacy = pharmacies_list[stock_data['pharmacy_index']]
        medicament = medicaments_list[stock_data['medicament_index']]
        
        stock = Stock.objects.create(
            pharmacy=pharmacy,
            medicine=medicament,
            quantity=stock_data['quantity'],
            price=Decimal(str(stock_data['price'])),
            is_available=True
        )
        stocks_created += 1
        
        if idx % 10 == 0:  # Afficher tous les 10 stocks
            print(f"   ✓ [{idx}/{len(data['stocks'])}] stocks créés...")
    
    print(f"\n✅ {stocks_created} stocks importés")
    
    # Afficher les statistiques
    print("\n" + "=" * 60)
    print("📊 STATISTIQUES FINALES")
    print("=" * 60)
    print(f"   🏥 Pharmacies  : {Pharmacy.objects.count()}")
    print(f"   💊 Médicaments : {Medicine.objects.count()}")
    print(f"   📦 Stocks      : {Stock.objects.count()}")
    print("=" * 60)
    
    # Exemples de requêtes
    print("\n📝 EXEMPLES DE REQUÊTES À TESTER:")
    print("-" * 60)
    print("1. Rechercher Doliprane:")
    print("   GET /api/search/?q=doliprane")
    print("\n2. Rechercher avec géolocalisation (Centre de Yaoundé):")
    print("   GET /api/search/?q=doliprane&latitude=3.848&longitude=11.502")
    print("\n3. Pharmacies à proximité:")
    print("   GET /api/nearby/?latitude=3.848&longitude=11.502&radius=5")
    print("\n4. Détails d'une pharmacie:")
    print("   GET /api/pharmacy/1/")
    print("-" * 60)
    
    print("\n✅ Importation terminée avec succès!")
    print("🚀 Vous pouvez maintenant lancer le serveur: python manage.py runserver\n")


if __name__ == '__main__':
    import_data()