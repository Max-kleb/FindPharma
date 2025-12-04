#!/usr/bin/env python
"""
Script de peuplement de la base de données FindPharma
Crée 30 pharmacies à Yaoundé et 10 dans deux autres régions du Cameroun

Usage:
    python populate_cameroun_30_10.py
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from pharmacies.models import Pharmacy
from django.contrib.gis.geos import Point
from django.db import transaction

# Données des pharmacies

# 30 Pharmacies à Yaoundé (Capitale)
PHARMACIES_YAOUNDE = [
    # Quartier Centre-ville
    {"name": "Pharmacie du Centre", "address": "Avenue Kennedy, Centre-ville, Yaoundé", "lat": 3.8667, "lon": 11.5167, "phone": "+237677001001", "is_open_24h": True},
    {"name": "Pharmacie Centrale", "address": "Rue de Nachtigal, Centre-ville, Yaoundé", "lat": 3.8680, "lon": 11.5180, "phone": "+237677001002", "is_open_24h": False},
    {"name": "Pharmacie de la Poste", "address": "Place de la Poste, Yaoundé", "lat": 3.8670, "lon": 11.5190, "phone": "+237677001003", "is_open_24h": False},
    {"name": "Pharmacie du Marché Central", "address": "Marché Central, Yaoundé", "lat": 3.8655, "lon": 11.5175, "phone": "+237677001004", "is_open_24h": False},
    
    # Quartier Bastos
    {"name": "Pharmacie Bastos", "address": "Bastos, Yaoundé", "lat": 3.8800, "lon": 11.5100, "phone": "+237677001005", "is_open_24h": True},
    {"name": "Pharmacie du Golf", "address": "Près du Golf, Bastos, Yaoundé", "lat": 3.8820, "lon": 11.5090, "phone": "+237677001006", "is_open_24h": False},
    {"name": "Pharmacie Santa Lucia", "address": "Bastos, Yaoundé", "lat": 3.8810, "lon": 11.5110, "phone": "+237677001007", "is_open_24h": False},
    
    # Quartier Messa
    {"name": "Pharmacie de Messa", "address": "Messa Carrière, Yaoundé", "lat": 3.8550, "lon": 11.5050, "phone": "+237677001008", "is_open_24h": False},
    {"name": "Pharmacie Messa Santé", "address": "Messa, Yaoundé", "lat": 3.8560, "lon": 11.5060, "phone": "+237677001009", "is_open_24h": True},
    
    # Quartier Mvog-Ada
    {"name": "Pharmacie Mvog-Ada", "address": "Mvog-Ada, Yaoundé", "lat": 3.8500, "lon": 11.5200, "phone": "+237677001010", "is_open_24h": False},
    {"name": "Pharmacie du Carrefour Ada", "address": "Carrefour Mvog-Ada, Yaoundé", "lat": 3.8520, "lon": 11.5210, "phone": "+237677001011", "is_open_24h": False},
    
    # Quartier Nlongkak
    {"name": "Pharmacie Nlongkak", "address": "Nlongkak, Yaoundé", "lat": 3.8900, "lon": 11.5200, "phone": "+237677001012", "is_open_24h": False},
    {"name": "Pharmacie Nouvelle Étoile", "address": "Nlongkak, Yaoundé", "lat": 3.8910, "lon": 11.5210, "phone": "+237677001013", "is_open_24h": True},
    
    # Quartier Elig-Essono
    {"name": "Pharmacie Elig-Essono", "address": "Elig-Essono, Yaoundé", "lat": 3.8600, "lon": 11.5100, "phone": "+237677001014", "is_open_24h": False},
    {"name": "Pharmacie de la Paix", "address": "Elig-Essono, Yaoundé", "lat": 3.8610, "lon": 11.5110, "phone": "+237677001015", "is_open_24h": False},
    
    # Quartier Tsinga
    {"name": "Pharmacie Tsinga", "address": "Tsinga, Yaoundé", "lat": 3.8750, "lon": 11.5000, "phone": "+237677001016", "is_open_24h": False},
    {"name": "Pharmacie du Rond-Point Tsinga", "address": "Rond-Point Tsinga, Yaoundé", "lat": 3.8760, "lon": 11.5010, "phone": "+237677001017", "is_open_24h": True},
    
    # Quartier Emana
    {"name": "Pharmacie Emana", "address": "Emana, Yaoundé", "lat": 3.8450, "lon": 11.5300, "phone": "+237677001018", "is_open_24h": False},
    {"name": "Pharmacie Carrefour Emana", "address": "Carrefour Emana, Yaoundé", "lat": 3.8460, "lon": 11.5310, "phone": "+237677001019", "is_open_24h": False},
    
    # Quartier Ngoa-Ekellé
    {"name": "Pharmacie Ngoa-Ekellé", "address": "Ngoa-Ekellé, Yaoundé", "lat": 3.8400, "lon": 11.5250, "phone": "+237677001020", "is_open_24h": False},
    {"name": "Pharmacie Université Yaoundé I", "address": "Près de l'Université Yaoundé I, Ngoa-Ekellé", "lat": 3.8420, "lon": 11.5260, "phone": "+237677001021", "is_open_24h": True},
    
    # Quartier Mfandena
    {"name": "Pharmacie Mfandena", "address": "Mfandena, Yaoundé", "lat": 3.8350, "lon": 11.5150, "phone": "+237677001022", "is_open_24h": False},
    {"name": "Pharmacie du Carrefour Mfandena", "address": "Carrefour Mfandena, Yaoundé", "lat": 3.8360, "lon": 11.5160, "phone": "+237677001023", "is_open_24h": False},
    
    # Quartier Essos
    {"name": "Pharmacie Essos", "address": "Essos, Yaoundé", "lat": 3.8300, "lon": 11.5400, "phone": "+237677001024", "is_open_24h": False},
    {"name": "Pharmacie Carrefour Essos", "address": "Carrefour Essos, Yaoundé", "lat": 3.8320, "lon": 11.5420, "phone": "+237677001025", "is_open_24h": True},
    
    # Quartier Ekounou
    {"name": "Pharmacie Ekounou", "address": "Ekounou, Yaoundé", "lat": 3.8250, "lon": 11.5500, "phone": "+237677001026", "is_open_24h": False},
    {"name": "Pharmacie Moderne Ekounou", "address": "Ekounou, Yaoundé", "lat": 3.8270, "lon": 11.5520, "phone": "+237677001027", "is_open_24h": False},
    
    # Quartier Biyem-Assi
    {"name": "Pharmacie Biyem-Assi", "address": "Biyem-Assi, Yaoundé", "lat": 3.8200, "lon": 11.5000, "phone": "+237677001028", "is_open_24h": False},
    {"name": "Pharmacie de l'Espoir", "address": "Biyem-Assi, Yaoundé", "lat": 3.8220, "lon": 11.5020, "phone": "+237677001029", "is_open_24h": False},
    
    # Quartier Mendong
    {"name": "Pharmacie Mendong", "address": "Mendong, Yaoundé", "lat": 3.8150, "lon": 11.5300, "phone": "+237677001030", "is_open_24h": True},
]

# 10 Pharmacies à Douala (Capitale économique - Région du Littoral)
PHARMACIES_DOUALA = [
    {"name": "Pharmacie du Port", "address": "Quartier du Port, Douala", "lat": 4.0511, "lon": 9.7679, "phone": "+237677002001", "is_open_24h": True},
    {"name": "Pharmacie Akwa", "address": "Akwa, Douala", "lat": 4.0500, "lon": 9.7700, "phone": "+237677002002", "is_open_24h": False},
    {"name": "Pharmacie Bonanjo", "address": "Bonanjo, Douala", "lat": 4.0550, "lon": 9.7650, "phone": "+237677002003", "is_open_24h": True},
    {"name": "Pharmacie Deido", "address": "Deido, Douala", "lat": 4.0600, "lon": 9.7500, "phone": "+237677002004", "is_open_24h": False},
    {"name": "Pharmacie Bassa", "address": "New Bell Bassa, Douala", "lat": 4.0650, "lon": 9.7400, "phone": "+237677002005", "is_open_24h": False},
    {"name": "Pharmacie Bonabéri", "address": "Bonabéri, Douala", "lat": 4.0800, "lon": 9.7200, "phone": "+237677002006", "is_open_24h": True},
    {"name": "Pharmacie Logbaba", "address": "Logbaba, Douala", "lat": 4.0300, "lon": 9.7800, "phone": "+237677002007", "is_open_24h": False},
    {"name": "Pharmacie PK8", "address": "PK8, Douala", "lat": 4.0200, "lon": 9.8000, "phone": "+237677002008", "is_open_24h": False},
    {"name": "Pharmacie Ndokotti", "address": "Ndokotti, Douala", "lat": 4.0400, "lon": 9.7600, "phone": "+237677002009", "is_open_24h": True},
    {"name": "Pharmacie Makepe", "address": "Makepe, Douala", "lat": 4.0100, "lon": 9.7300, "phone": "+237677002010", "is_open_24h": False},
]

# 10 Pharmacies à Bafoussam (Région de l'Ouest)
PHARMACIES_BAFOUSSAM = [
    {"name": "Pharmacie Centrale Bafoussam", "address": "Centre-ville, Bafoussam", "lat": 5.4781, "lon": 10.4177, "phone": "+237677003001", "is_open_24h": True},
    {"name": "Pharmacie du Marché A", "address": "Marché A, Bafoussam", "lat": 5.4790, "lon": 10.4180, "phone": "+237677003002", "is_open_24h": False},
    {"name": "Pharmacie Tamdja", "address": "Tamdja, Bafoussam", "lat": 5.4800, "lon": 10.4150, "phone": "+237677003003", "is_open_24h": False},
    {"name": "Pharmacie Famla", "address": "Famla, Bafoussam", "lat": 5.4750, "lon": 10.4200, "phone": "+237677003004", "is_open_24h": True},
    {"name": "Pharmacie Djeleng", "address": "Djeleng, Bafoussam", "lat": 5.4820, "lon": 10.4160, "phone": "+237677003005", "is_open_24h": False},
    {"name": "Pharmacie Kamkop", "address": "Kamkop, Bafoussam", "lat": 5.4760, "lon": 10.4220, "phone": "+237677003006", "is_open_24h": False},
    {"name": "Pharmacie Ndiandam", "address": "Ndiandam, Bafoussam", "lat": 5.4700, "lon": 10.4100, "phone": "+237677003007", "is_open_24h": False},
    {"name": "Pharmacie Tougang", "address": "Tougang, Bafoussam", "lat": 5.4850, "lon": 10.4250, "phone": "+237677003008", "is_open_24h": True},
    {"name": "Pharmacie Université Dschang", "address": "Près de l'Université, Bafoussam", "lat": 5.4900, "lon": 10.4300, "phone": "+237677003009", "is_open_24h": False},
    {"name": "Pharmacie Moderne Ouest", "address": "Route de Bamenda, Bafoussam", "lat": 5.4950, "lon": 10.4350, "phone": "+237677003010", "is_open_24h": False},
]


def create_pharmacies():
    """Crée toutes les pharmacies dans la base de données"""
    
    print("🏥 Début du peuplement des pharmacies du Cameroun")
    print("=" * 60)
    
    with transaction.atomic():
        # Supprimer les pharmacies existantes
        existing_count = Pharmacy.objects.count()
        if existing_count > 0:
            print(f"⚠️  Suppression de {existing_count} pharmacies existantes...")
            Pharmacy.objects.all().delete()
        
        created_count = 0
        
        # Créer les pharmacies de Yaoundé
        print(f"\n📍 Création de {len(PHARMACIES_YAOUNDE)} pharmacies à Yaoundé...")
        for data in PHARMACIES_YAOUNDE:
            # Créer opening_hours JSON avec info 24h
            opening_hours = {
                "24h": data["is_open_24h"]
            }
            if not data["is_open_24h"]:
                opening_hours["hours"] = "Lundi-Vendredi: 8h-20h, Samedi: 8h-18h, Dimanche: 9h-13h"
            
            pharmacy = Pharmacy.objects.create(
                name=data["name"],
                address=data["address"],
                latitude=data["lat"],
                longitude=data["lon"],
                location=Point(data["lon"], data["lat"]),  # Point(longitude, latitude)
                phone=data["phone"],
                opening_hours=opening_hours,
                email=f"{data['name'].lower().replace(' ', '').replace('-', '')}@findpharma.cm"
            )
            created_count += 1
            print(f"  ✅ {pharmacy.name}")
        
        # Créer les pharmacies de Douala
        print(f"\n📍 Création de {len(PHARMACIES_DOUALA)} pharmacies à Douala...")
        for data in PHARMACIES_DOUALA:
            # Créer opening_hours JSON avec info 24h
            opening_hours = {
                "24h": data["is_open_24h"]
            }
            if not data["is_open_24h"]:
                opening_hours["hours"] = "Lundi-Vendredi: 8h-20h, Samedi: 8h-18h, Dimanche: 9h-13h"
            
            pharmacy = Pharmacy.objects.create(
                name=data["name"],
                address=data["address"],
                latitude=data["lat"],
                longitude=data["lon"],
                location=Point(data["lon"], data["lat"]),
                phone=data["phone"],
                opening_hours=opening_hours,
                email=f"{data['name'].lower().replace(' ', '').replace('-', '')}@findpharma.cm"
            )
            created_count += 1
            print(f"  ✅ {pharmacy.name}")
        
        # Créer les pharmacies de Bafoussam
        print(f"\n📍 Création de {len(PHARMACIES_BAFOUSSAM)} pharmacies à Bafoussam...")
        for data in PHARMACIES_BAFOUSSAM:
            # Créer opening_hours JSON avec info 24h
            opening_hours = {
                "24h": data["is_open_24h"]
            }
            if not data["is_open_24h"]:
                opening_hours["hours"] = "Lundi-Vendredi: 8h-20h, Samedi: 8h-18h, Dimanche: 9h-13h"
            
            pharmacy = Pharmacy.objects.create(
                name=data["name"],
                address=data["address"],
                latitude=data["lat"],
                longitude=data["lon"],
                location=Point(data["lon"], data["lat"]),
                phone=data["phone"],
                opening_hours=opening_hours,
                email=f"{data['name'].lower().replace(' ', '').replace('-', '')}@findpharma.cm"
            )
            created_count += 1
            print(f"  ✅ {pharmacy.name}")
        
        print("\n" + "=" * 60)
        print(f"✅ {created_count} pharmacies créées avec succès !")
        print(f"   - Yaoundé: {len(PHARMACIES_YAOUNDE)} pharmacies")
        print(f"   - Douala: {len(PHARMACIES_DOUALA)} pharmacies")
        print(f"   - Bafoussam: {len(PHARMACIES_BAFOUSSAM)} pharmacies")
        print("=" * 60)


if __name__ == "__main__":
    try:
        create_pharmacies()
        print("\n🎉 Peuplement terminé avec succès !")
    except Exception as e:
        print(f"\n❌ Erreur lors du peuplement : {e}")
        sys.exit(1)
