#!/usr/bin/env python
"""
Script de peuplement de la base de données FindPharma
Crée des données réalistes pour pharmacies, médicaments et stocks

Usage:
    python populate_database.py

Pré-requis:
    - Base de données configurée dans .env
    - Migrations appliquées
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


# Données pour le peuplement
PHARMACIES_DATA = [
    {
        "name": "Pharmacie Centrale de Yaoundé",
        "address": "Avenue Kennedy, Centre-ville, Yaoundé",
        "phone": "+237 222 234 567",
        "email": "centrale.yaounde@pharmacy.cm",
        "latitude": 3.8480,
        "longitude": 11.5021,
        "opening_hours": {
            "lundi-vendredi": "07:30-19:00",
            "samedi": "08:00-18:00",
            "dimanche": "09:00-13:00"
        }
    },
    {
        "name": "Pharmacie du Marché Central",
        "address": "Marché Central, Quartier Mokolo, Yaoundé",
        "phone": "+237 222 345 678",
        "email": "marche.mokolo@pharmacy.cm",
        "latitude": 3.8656,
        "longitude": 11.5177,
        "opening_hours": {
            "lundi-samedi": "07:00-20:00",
            "dimanche": "08:00-14:00"
        }
    },
    {
        "name": "Pharmacie de la Paix",
        "address": "Boulevard de la Réunification, Yaoundé",
        "phone": "+237 222 456 789",
        "email": "paix@pharmacy.cm",
        "latitude": 3.8420,
        "longitude": 11.4950,
        "opening_hours": {
            "tous les jours": "24h/24"
        }
    },
    {
        "name": "Pharmacie Bastos",
        "address": "Quartier Bastos, Yaoundé",
        "phone": "+237 222 567 890",
        "email": "bastos@pharmacy.cm",
        "latitude": 3.8757,
        "longitude": 11.4984,
        "opening_hours": {
            "lundi-vendredi": "08:00-20:00",
            "samedi": "09:00-19:00",
            "dimanche": "10:00-16:00"
        }
    },
    {
        "name": "Pharmacie Mvog-Ada",
        "address": "Quartier Mvog-Ada, Yaoundé",
        "phone": "+237 222 678 901",
        "email": "mvogada@pharmacy.cm",
        "latitude": 3.8377,
        "longitude": 11.5168,
        "opening_hours": {
            "lundi-samedi": "08:00-18:00"
        }
    },
    {
        "name": "Pharmacie Messa",
        "address": "Quartier Messa, Yaoundé",
        "phone": "+237 222 789 012",
        "email": "messa@pharmacy.cm",
        "latitude": 3.8598,
        "longitude": 11.5284,
        "opening_hours": {
            "lundi-vendredi": "07:30-19:30",
            "samedi": "08:00-18:00"
        }
    },
    {
        "name": "Pharmacie Nlongkak",
        "address": "Quartier Nlongkak, Yaoundé",
        "phone": "+237 222 890 123",
        "email": "nlongkak@pharmacy.cm",
        "latitude": 3.8847,
        "longitude": 11.5220,
        "opening_hours": {
            "lundi-samedi": "08:00-19:00",
            "dimanche": "09:00-13:00"
        }
    },
    {
        "name": "Pharmacie Omnisports",
        "address": "Avenue de l'Omnisports, Yaoundé",
        "phone": "+237 222 901 234",
        "email": "omnisports@pharmacy.cm",
        "latitude": 3.8645,
        "longitude": 11.5432,
        "opening_hours": {
            "lundi-vendredi": "08:00-18:30",
            "samedi": "09:00-17:00"
        }
    },
]

MEDICINES_DATA = [
    # Analgésiques / Antipyrétiques
    {"name": "Paracétamol", "dosage": "500mg", "form": "Comprimé", "description": "Analgésique et antipyrétique", "average_price": 2.50, "requires_prescription": False},
    {"name": "Paracétamol", "dosage": "1000mg", "form": "Comprimé effervescent", "description": "Analgésique et antipyrétique forte dose", "average_price": 3.50, "requires_prescription": False},
    {"name": "Ibuprofène", "dosage": "400mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien", "average_price": 3.50, "requires_prescription": False},
    {"name": "Aspirine", "dosage": "500mg", "form": "Comprimé", "description": "Analgésique, antipyrétique, anti-inflammatoire", "average_price": 2.00, "requires_prescription": False},
    
    # Antibiotiques
    {"name": "Amoxicilline", "dosage": "500mg", "form": "Gélule", "description": "Antibiotique de la famille des pénicillines", "average_price": 6.00, "requires_prescription": True},
    {"name": "Amoxicilline", "dosage": "1g", "form": "Comprimé", "description": "Antibiotique de la famille des pénicillines", "average_price": 8.00, "requires_prescription": True},
    {"name": "Azithromycine", "dosage": "250mg", "form": "Comprimé", "description": "Antibiotique macrolide", "average_price": 12.00, "requires_prescription": True},
    {"name": "Ciprofloxacine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone", "average_price": 10.00, "requires_prescription": True},
    
    # Antipaludéens
    {"name": "Artemether-Lumefantrine", "dosage": "20/120mg", "form": "Comprimé", "description": "Antipaludéen (traitement du paludisme)", "average_price": 15.00, "requires_prescription": True},
    {"name": "Artesunate", "dosage": "50mg", "form": "Comprimé", "description": "Antipaludéen", "average_price": 18.00, "requires_prescription": True},
    {"name": "Quinine", "dosage": "500mg", "form": "Comprimé", "description": "Antipaludéen", "average_price": 8.00, "requires_prescription": True},
    
    # Antihistaminiques
    {"name": "Cétirizine", "dosage": "10mg", "form": "Comprimé", "description": "Antihistaminique anti-allergique", "average_price": 4.00, "requires_prescription": False},
    {"name": "Loratadine", "dosage": "10mg", "form": "Comprimé", "description": "Antihistaminique anti-allergique", "average_price": 5.00, "requires_prescription": False},
    
    # Gastro-intestinaux
    {"name": "Oméprazole", "dosage": "20mg", "form": "Gélule", "description": "Inhibiteur de la pompe à protons", "average_price": 7.00, "requires_prescription": False},
    {"name": "Métoclopramide", "dosage": "10mg", "form": "Comprimé", "description": "Antiémétique", "average_price": 3.00, "requires_prescription": False},
    {"name": "Smecta", "dosage": "3g", "form": "Poudre", "description": "Antidiarrhéique", "average_price": 4.50, "requires_prescription": False},
    
    # Vitamines et suppléments
    {"name": "Vitamine C", "dosage": "500mg", "form": "Comprimé effervescent", "description": "Supplément vitaminique", "average_price": 3.00, "requires_prescription": False},
    {"name": "Fer + Acide Folique", "dosage": "200mg/0.25mg", "form": "Comprimé", "description": "Supplément pour anémie", "average_price": 5.00, "requires_prescription": False},
    {"name": "Multivitamines", "dosage": "N/A", "form": "Comprimé", "description": "Complexe multivitaminé", "average_price": 6.00, "requires_prescription": False},
    
    # Antihypertenseurs
    {"name": "Amlodipine", "dosage": "5mg", "form": "Comprimé", "description": "Antihypertenseur inhibiteur calcique", "average_price": 8.00, "requires_prescription": True},
    {"name": "Losartan", "dosage": "50mg", "form": "Comprimé", "description": "Antihypertenseur", "average_price": 9.00, "requires_prescription": True},
    
    # Antidiabétiques
    {"name": "Metformine", "dosage": "500mg", "form": "Comprimé", "description": "Antidiabétique oral", "average_price": 7.00, "requires_prescription": True},
    {"name": "Metformine", "dosage": "850mg", "form": "Comprimé", "description": "Antidiabétique oral", "average_price": 9.00, "requires_prescription": True},
]


def clear_database():
    """Vide la base de données"""
    print("🗑️  Nettoyage de la base de données...")
    Stock.objects.all().delete()
    Medicine.objects.all().delete()
    Pharmacy.objects.all().delete()
    print("✅ Base de données nettoyée")


def create_pharmacies():
    """Crée les pharmacies"""
    print(f"\n🏥 Création de {len(PHARMACIES_DATA)} pharmacies...")
    pharmacies = []
    
    for data in PHARMACIES_DATA:
        pharmacy = Pharmacy.objects.create(
            name=data["name"],
            address=data["address"],
            phone=data["phone"],
            email=data["email"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            opening_hours=data["opening_hours"],
            is_active=True
        )
        pharmacies.append(pharmacy)
        print(f"  ✓ {pharmacy.name}")
    
    print(f"✅ {len(pharmacies)} pharmacies créées")
    return pharmacies


def create_medicines():
    """Crée les médicaments"""
    print(f"\n💊 Création de {len(MEDICINES_DATA)} médicaments...")
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
        print(f"  ✓ {medicine.name} {medicine.dosage}")
    
    print(f"✅ {len(medicines)} médicaments créés")
    return medicines


def create_stocks(pharmacies, medicines):
    """Crée les stocks de médicaments dans les pharmacies"""
    print(f"\n📦 Création des stocks...")
    stock_count = 0
    
    for pharmacy in pharmacies:
        # Chaque pharmacie a entre 15 et 22 médicaments différents
        available_medicines = choice([15, 18, 20, 22])
        selected_medicines = medicines[:available_medicines]
        
        for medicine in selected_medicines:
            # Quantité aléatoire entre 10 et 150
            quantity = randint(10, 150)
            
            # Prix avec une variation de ±10% par rapport au prix moyen
            price_variation = uniform(0.9, 1.1)
            price = medicine.average_price * Decimal(str(price_variation))
            price = price.quantize(Decimal('0.01'))
            
            # Disponibilité (95% de chances d'être disponible)
            is_available = quantity > 5 and choice([True] * 95 + [False] * 5)
            
            Stock.objects.create(
                pharmacy=pharmacy,
                medicine=medicine,
                quantity=quantity,
                price=price,
                is_available=is_available
            )
            stock_count += 1
        
        print(f"  ✓ {pharmacy.name}: {len(selected_medicines)} médicaments en stock")
    
    print(f"✅ {stock_count} stocks créés")
    return stock_count


def print_statistics():
    """Affiche les statistiques de la base de données"""
    print("\n" + "="*60)
    print("📊 STATISTIQUES DE LA BASE DE DONNÉES")
    print("="*60)
    
    pharmacies_count = Pharmacy.objects.count()
    medicines_count = Medicine.objects.count()
    stocks_count = Stock.objects.count()
    available_stocks = Stock.objects.filter(is_available=True).count()
    
    print(f"🏥 Pharmacies: {pharmacies_count}")
    print(f"💊 Médicaments: {medicines_count}")
    print(f"📦 Stocks totaux: {stocks_count}")
    print(f"✅ Stocks disponibles: {available_stocks}")
    print(f"❌ Stocks indisponibles: {stocks_count - available_stocks}")
    
    print("\n📋 Médicaments par catégorie:")
    prescription_required = Medicine.objects.filter(requires_prescription=True).count()
    no_prescription = Medicine.objects.filter(requires_prescription=False).count()
    print(f"  - Avec ordonnance: {prescription_required}")
    print(f"  - Sans ordonnance: {no_prescription}")
    
    print("\n🏥 Pharmacies par statut:")
    active_pharmacies = Pharmacy.objects.filter(is_active=True).count()
    print(f"  - Actives: {active_pharmacies}")
    
    print("="*60)


@transaction.atomic
def main():
    """Fonction principale"""
    print("="*60)
    print("🚀 SCRIPT DE PEUPLEMENT DE LA BASE FINDPHARMA")
    print("="*60)
    
    # Confirmation
    response = input("\n⚠️  Voulez-vous vider la base avant de la peupler? (o/N): ")
    if response.lower() in ['o', 'oui', 'y', 'yes']:
        clear_database()
    
    # Création des données
    pharmacies = create_pharmacies()
    medicines = create_medicines()
    create_stocks(pharmacies, medicines)
    
    # Affichage des statistiques
    print_statistics()
    
    print("\n✅ Peuplement terminé avec succès!")
    print("🌐 Vous pouvez maintenant tester l'API sur http://127.0.0.1:8000/api/docs/")


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
