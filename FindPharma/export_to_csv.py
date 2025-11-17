"""
Script pour exporter les données test en CSV
Usage: python export_to_csv.py
"""

import json
import csv

# Charger les données JSON
with open('test_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Export des pharmacies
print("Export des pharmacies...")
with open('pharmacies.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
    fieldnames = ['Nom', 'Adresse', 'Téléphone', 'Email', 'Latitude', 'Longitude', 'Actif']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';')
    
    writer.writeheader()
    for pharmacy in data['pharmacies']:
        writer.writerow({
            'Nom': pharmacy['name'],
            'Adresse': pharmacy['address'],
            'Téléphone': pharmacy['phone'],
            'Email': pharmacy.get('email', ''),
            'Latitude': pharmacy['latitude'],
            'Longitude': pharmacy['longitude'],
            'Actif': 'Oui' if pharmacy['is_active'] else 'Non'
        })
print(f"✅ {len(data['pharmacies'])} pharmacies exportées → pharmacies.csv")

# Export des médicaments
print("Export des médicaments...")
with open('medicaments.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
    fieldnames = ['Nom', 'Description', 'Dosage', 'Forme', 'Prix moyen (FCFA)', 'Ordonnance requise']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';')
    
    writer.writeheader()
    for med in data['medicaments']:
        writer.writerow({
            'Nom': med['name'],
            'Description': med['description'],
            'Dosage': med['dosage'],
            'Forme': med['form'],
            'Prix moyen (FCFA)': med['average_price'],
            'Ordonnance requise': 'Oui' if med['requires_prescription'] else 'Non'
        })
print(f"✅ {len(data['medicaments'])} médicaments exportés → medicaments.csv")

# Export des stocks
print("Export des stocks...")
with open('stocks.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
    fieldnames = ['Pharmacie', 'Médicament', 'Quantité', 'Prix (FCFA)']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';')
    
    writer.writeheader()
    for stock in data['stocks']:
        pharmacy_name = data['pharmacies'][stock['pharmacy_index']]['name']
        medicament_name = data['medicaments'][stock['medicament_index']]['name']
        writer.writerow({
            'Pharmacie': pharmacy_name,
            'Médicament': medicament_name,
            'Quantité': stock['quantity'],
            'Prix (FCFA)': stock['price']
        })
print(f"✅ {len(data['stocks'])} stocks exportés → stocks.csv")

print("\n✅ Export terminé! Vous pouvez ouvrir les fichiers CSV avec Excel.")