#!/usr/bin/env python
"""
Script de peuplement des médicaments et stocks pour FindPharma
CONSERVE les pharmacies existantes et ajoute uniquement les médicaments et stocks

Usage:
    python populate_medicines_only.py
"""

import os
import sys
import django
from decimal import Decimal
from random import randint, choice, uniform

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from pharmacies.models import Pharmacy
from medicines.models import Medicine
from stocks.models import Stock
from django.db import transaction


# Médicaments réalistes pour le Cameroun
MEDICINES_DATA = [
    # Analgésiques / Antipyrétiques
    {"name": "Paracétamol", "dosage": "500mg", "form": "Comprimé", "description": "Analgésique et antipyrétique", "average_price": 500, "requires_prescription": False},
    {"name": "Paracétamol", "dosage": "1000mg", "form": "Comprimé effervescent", "description": "Analgésique et antipyrétique forte dose", "average_price": 750, "requires_prescription": False},
    {"name": "Ibuprofène", "dosage": "400mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien", "average_price": 800, "requires_prescription": False},
    {"name": "Aspirine", "dosage": "500mg", "form": "Comprimé", "description": "Analgésique, antipyrétique, anti-inflammatoire", "average_price": 400, "requires_prescription": False},
    {"name": "Diclofénac", "dosage": "50mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien", "average_price": 600, "requires_prescription": False},
    
    # Antibiotiques
    {"name": "Amoxicilline", "dosage": "500mg", "form": "Gélule", "description": "Antibiotique de la famille des pénicillines", "average_price": 1500, "requires_prescription": True},
    {"name": "Amoxicilline", "dosage": "1g", "form": "Comprimé", "description": "Antibiotique de la famille des pénicillines", "average_price": 2000, "requires_prescription": True},
    {"name": "Amoxicilline + Acide Clavulanique", "dosage": "500/125mg", "form": "Comprimé", "description": "Antibiotique à large spectre", "average_price": 2500, "requires_prescription": True},
    {"name": "Azithromycine", "dosage": "250mg", "form": "Comprimé", "description": "Antibiotique macrolide", "average_price": 3000, "requires_prescription": True},
    {"name": "Ciprofloxacine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone", "average_price": 2500, "requires_prescription": True},
    {"name": "Métronidazole", "dosage": "250mg", "form": "Comprimé", "description": "Antibiotique antiprotozoaire", "average_price": 800, "requires_prescription": True},
    
    # Antipaludéens (très important au Cameroun)
    {"name": "Artemether-Lumefantrine", "dosage": "20/120mg", "form": "Comprimé", "description": "Antipaludéen - traitement du paludisme", "average_price": 3500, "requires_prescription": True},
    {"name": "Artesunate", "dosage": "50mg", "form": "Comprimé", "description": "Antipaludéen", "average_price": 4000, "requires_prescription": True},
    {"name": "Quinine", "dosage": "500mg", "form": "Comprimé", "description": "Antipaludéen", "average_price": 2000, "requires_prescription": True},
    {"name": "Artémether", "dosage": "80mg", "form": "Injectable", "description": "Antipaludéen injectable", "average_price": 5000, "requires_prescription": True},
    
    # Antihistaminiques
    {"name": "Cétirizine", "dosage": "10mg", "form": "Comprimé", "description": "Antihistaminique anti-allergique", "average_price": 1000, "requires_prescription": False},
    {"name": "Loratadine", "dosage": "10mg", "form": "Comprimé", "description": "Antihistaminique anti-allergique", "average_price": 1200, "requires_prescription": False},
    {"name": "Chlorphéniramine", "dosage": "4mg", "form": "Comprimé", "description": "Antihistaminique", "average_price": 600, "requires_prescription": False},
    
    # Gastro-intestinaux
    {"name": "Oméprazole", "dosage": "20mg", "form": "Gélule", "description": "Inhibiteur de la pompe à protons", "average_price": 1500, "requires_prescription": False},
    {"name": "Métoclopramide", "dosage": "10mg", "form": "Comprimé", "description": "Antiémétique", "average_price": 800, "requires_prescription": False},
    {"name": "Smecta", "dosage": "3g", "form": "Poudre", "description": "Antidiarrhéique", "average_price": 1000, "requires_prescription": False},
    {"name": "Lopéramide", "dosage": "2mg", "form": "Gélule", "description": "Antidiarrhéique", "average_price": 1200, "requires_prescription": False},
    {"name": "Sels de Réhydratation Orale (SRO)", "dosage": "N/A", "form": "Poudre", "description": "Réhydratation en cas de diarrhée", "average_price": 300, "requires_prescription": False},
    
    # Vitamines et suppléments
    {"name": "Vitamine C", "dosage": "500mg", "form": "Comprimé effervescent", "description": "Supplément vitaminique", "average_price": 800, "requires_prescription": False},
    {"name": "Vitamine C", "dosage": "1000mg", "form": "Comprimé effervescent", "description": "Supplément vitaminique forte dose", "average_price": 1200, "requires_prescription": False},
    {"name": "Fer + Acide Folique", "dosage": "200mg/0.25mg", "form": "Comprimé", "description": "Supplément pour anémie", "average_price": 1500, "requires_prescription": False},
    {"name": "Multivitamines", "dosage": "N/A", "form": "Comprimé", "description": "Complexe multivitaminé", "average_price": 2000, "requires_prescription": False},
    {"name": "Vitamine B Complex", "dosage": "N/A", "form": "Comprimé", "description": "Complexe de vitamines B", "average_price": 1800, "requires_prescription": False},
    {"name": "Calcium + Vitamine D3", "dosage": "500mg/200UI", "form": "Comprimé", "description": "Supplément calcium", "average_price": 2500, "requires_prescription": False},
    
    # Antihypertenseurs
    {"name": "Amlodipine", "dosage": "5mg", "form": "Comprimé", "description": "Antihypertenseur inhibiteur calcique", "average_price": 2000, "requires_prescription": True},
    {"name": "Amlodipine", "dosage": "10mg", "form": "Comprimé", "description": "Antihypertenseur inhibiteur calcique", "average_price": 2500, "requires_prescription": True},
    {"name": "Losartan", "dosage": "50mg", "form": "Comprimé", "description": "Antihypertenseur", "average_price": 2200, "requires_prescription": True},
    {"name": "Enalapril", "dosage": "10mg", "form": "Comprimé", "description": "Antihypertenseur IEC", "average_price": 1800, "requires_prescription": True},
    
    # Antidiabétiques
    {"name": "Metformine", "dosage": "500mg", "form": "Comprimé", "description": "Antidiabétique oral", "average_price": 1500, "requires_prescription": True},
    {"name": "Metformine", "dosage": "850mg", "form": "Comprimé", "description": "Antidiabétique oral", "average_price": 2000, "requires_prescription": True},
    {"name": "Gliclazide", "dosage": "80mg", "form": "Comprimé", "description": "Antidiabétique oral", "average_price": 2500, "requires_prescription": True},
    
    # Antiparasitaires
    {"name": "Albendazole", "dosage": "400mg", "form": "Comprimé", "description": "Antiparasitaire à large spectre", "average_price": 800, "requires_prescription": False},
    {"name": "Mébendazole", "dosage": "100mg", "form": "Comprimé", "description": "Antiparasitaire", "average_price": 600, "requires_prescription": False},
    
    # Autres médicaments courants
    {"name": "Prednisolone", "dosage": "5mg", "form": "Comprimé", "description": "Corticoïde anti-inflammatoire", "average_price": 1500, "requires_prescription": True},
    {"name": "Dexaméthasone", "dosage": "0.5mg", "form": "Comprimé", "description": "Corticoïde", "average_price": 1000, "requires_prescription": True},
    {"name": "Salbutamol", "dosage": "100mcg", "form": "Inhalateur", "description": "Bronchodilatateur pour asthme", "average_price": 3500, "requires_prescription": True},
    {"name": "Hydrocortisone", "dosage": "1%", "form": "Crème", "description": "Corticoïde topique", "average_price": 1500, "requires_prescription": False},
    {"name": "Econazole", "dosage": "1%", "form": "Crème", "description": "Antifongique topique", "average_price": 2000, "requires_prescription": False},
]


def create_medicines():
    """Crée les médicaments"""
    print(f"\n💊 Création de {len(MEDICINES_DATA)} médicaments...")
    
    # Supprimer les médicaments existants
    existing_count = Medicine.objects.count()
    if existing_count > 0:
        print(f"⚠️  Suppression de {existing_count} médicaments existants...")
        Medicine.objects.all().delete()
    
    medicines = []
    
    for data in MEDICINES_DATA:
        medicine = Medicine.objects.create(
            name=data["name"],
            dosage=data["dosage"],
            form=data["form"],
            description=data["description"],
            average_price=Decimal(str(data["average_price"])),
            requires_prescription=data["requires_prescription"]
        )
        medicines.append(medicine)
        print(f"  ✅ {medicine.name} {medicine.dosage} ({medicine.form})")
    
    print(f"\n✅ {len(medicines)} médicaments créés")
    return medicines


def create_stocks(pharmacies, medicines):
    """Crée les stocks de médicaments dans les pharmacies"""
    print(f"\n📦 Création des stocks pour {len(pharmacies)} pharmacies...")
    
    # Supprimer les stocks existants
    existing_stocks = Stock.objects.count()
    if existing_stocks > 0:
        print(f"⚠️  Suppression de {existing_stocks} stocks existants...")
        Stock.objects.all().delete()
    
    stock_count = 0
    
    for pharmacy in pharmacies:
        # Chaque pharmacie a entre 25 et 35 médicaments différents
        available_medicines_count = randint(25, 35)
        
        # Sélectionner aléatoirement des médicaments
        import random
        selected_medicines = random.sample(medicines, min(available_medicines_count, len(medicines)))
        
        for medicine in selected_medicines:
            # Quantité aléatoire entre 5 et 200
            quantity = randint(5, 200)
            
            # Prix avec une variation de ±15% par rapport au prix moyen
            price_variation = uniform(0.85, 1.15)
            price = medicine.average_price * Decimal(str(price_variation))
            price = price.quantize(Decimal('1'))  # Arrondi à l'unité (FCFA)
            
            # Disponibilité (90% de chances d'être disponible)
            is_available = quantity > 10 and (random.random() < 0.90)
            
            Stock.objects.create(
                pharmacy=pharmacy,
                medicine=medicine,
                quantity=quantity,
                price=price,
                is_available=is_available
            )
            stock_count += 1
        
        print(f"  ✅ {pharmacy.name}: {len(selected_medicines)} médicaments en stock")
    
    print(f"\n✅ {stock_count} stocks créés")
    return stock_count


def print_statistics():
    """Affiche les statistiques de la base de données"""
    print("\n" + "="*70)
    print("📊 STATISTIQUES DE LA BASE DE DONNÉES FINDPHARMA")
    print("="*70)
    
    pharmacies_count = Pharmacy.objects.count()
    medicines_count = Medicine.objects.count()
    stocks_count = Stock.objects.count()
    available_stocks = Stock.objects.filter(is_available=True).count()
    
    print(f"\n🏥 Pharmacies: {pharmacies_count}")
    print(f"💊 Médicaments: {medicines_count}")
    print(f"📦 Stocks totaux: {stocks_count}")
    print(f"   ├─ ✅ Disponibles: {available_stocks} ({available_stocks*100//stocks_count if stocks_count > 0 else 0}%)")
    print(f"   └─ ❌ Indisponibles: {stocks_count - available_stocks}")
    
    print("\n💊 Médicaments par catégorie:")
    prescription_required = Medicine.objects.filter(requires_prescription=True).count()
    no_prescription = Medicine.objects.filter(requires_prescription=False).count()
    print(f"   ├─ Avec ordonnance: {prescription_required} ({prescription_required*100//medicines_count if medicines_count > 0 else 0}%)")
    print(f"   └─ Sans ordonnance: {no_prescription} ({no_prescription*100//medicines_count if medicines_count > 0 else 0}%)")
    
    print("\n🏥 Distribution géographique:")
    yaounde = Pharmacy.objects.filter(address__icontains='Yaoundé').count()
    douala = Pharmacy.objects.filter(address__icontains='Douala').count()
    bafoussam = Pharmacy.objects.filter(address__icontains='Bafoussam').count()
    print(f"   ├─ Yaoundé: {yaounde} pharmacies")
    print(f"   ├─ Douala: {douala} pharmacies")
    print(f"   └─ Bafoussam: {bafoussam} pharmacies")
    
    print("\n📊 Statistiques des stocks:")
    if stocks_count > 0:
        from django.db.models import Avg, Min, Max
        stats = Stock.objects.aggregate(
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price'),
            avg_quantity=Avg('quantity')
        )
        print(f"   ├─ Prix moyen: {stats['avg_price']:.0f} FCFA")
        print(f"   ├─ Prix min: {stats['min_price']:.0f} FCFA")
        print(f"   ├─ Prix max: {stats['max_price']:.0f} FCFA")
        print(f"   └─ Quantité moyenne: {stats['avg_quantity']:.0f} unités")
    
    print("="*70)


@transaction.atomic
def main():
    """Fonction principale"""
    print("="*70)
    print("🚀 PEUPLEMENT DES MÉDICAMENTS ET STOCKS - FINDPHARMA")
    print("="*70)
    
    # Vérifier qu'il y a des pharmacies
    pharmacies = list(Pharmacy.objects.all())
    if not pharmacies:
        print("\n❌ ERREUR: Aucune pharmacie dans la base de données!")
        print("   Veuillez d'abord exécuter: python populate_cameroun_30_10.py")
        sys.exit(1)
    
    print(f"\n✅ {len(pharmacies)} pharmacies trouvées dans la base")
    print("   Ces pharmacies vont être approvisionnées en médicaments\n")
    
    # Création des données
    medicines = create_medicines()
    create_stocks(pharmacies, medicines)
    
    # Affichage des statistiques
    print_statistics()
    
    print("\n✅ Peuplement terminé avec succès!")
    print("\n🌐 URLs disponibles:")
    print("   - API Backend: http://localhost:8000/api")
    print("   - API Pharmacies: http://localhost:8000/api/pharmacies/")
    print("   - API Médicaments: http://localhost:8000/api/medicines/")
    print("   - API Stocks: http://localhost:8000/api/stocks/")
    print("   - Admin Django: http://localhost:8000/admin (admin/admin123)")
    print("   - Frontend: http://localhost:3000")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Opération annulée par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
