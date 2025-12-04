#!/usr/bin/env python
"""
Script de peuplement COMPLET des médicaments et stocks pour FindPharma
Crée 150+ médicaments variés avec stocks réalistes

Usage:
    python populate_large_medicines.py
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


# Base de données complète de médicaments (150+ médicaments)
MEDICINES_DATA = [
    # ========== ANALGÉSIQUES / ANTIPYRÉTIQUES (15) ==========
    {"name": "Paracétamol", "dosage": "500mg", "form": "Comprimé", "description": "Analgésique et antipyrétique", "average_price": 500, "requires_prescription": False},
    {"name": "Paracétamol", "dosage": "1000mg", "form": "Comprimé effervescent", "description": "Analgésique antipyrétique forte dose", "average_price": 750, "requires_prescription": False},
    {"name": "Paracétamol", "dosage": "120mg/5ml", "form": "Sirop", "description": "Analgésique antipyrétique pédiatrique", "average_price": 1200, "requires_prescription": False},
    {"name": "Ibuprofène", "dosage": "400mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien", "average_price": 800, "requires_prescription": False},
    {"name": "Ibuprofène", "dosage": "200mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien dose modérée", "average_price": 600, "requires_prescription": False},
    {"name": "Ibuprofène", "dosage": "100mg/5ml", "form": "Sirop", "description": "Anti-inflammatoire pédiatrique", "average_price": 1500, "requires_prescription": False},
    {"name": "Aspirine", "dosage": "500mg", "form": "Comprimé", "description": "Analgésique, antipyrétique, anti-inflammatoire", "average_price": 400, "requires_prescription": False},
    {"name": "Aspirine", "dosage": "100mg", "form": "Comprimé", "description": "Antiagrégant plaquettaire", "average_price": 500, "requires_prescription": False},
    {"name": "Diclofénac", "dosage": "50mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien", "average_price": 600, "requires_prescription": False},
    {"name": "Diclofénac", "dosage": "75mg", "form": "Injectable", "description": "Anti-inflammatoire injectable", "average_price": 2000, "requires_prescription": True},
    {"name": "Kétoprofène", "dosage": "100mg", "form": "Gélule", "description": "Anti-inflammatoire non stéroïdien", "average_price": 900, "requires_prescription": False},
    {"name": "Naproxène", "dosage": "250mg", "form": "Comprimé", "description": "Anti-inflammatoire non stéroïdien", "average_price": 700, "requires_prescription": False},
    {"name": "Tramadol", "dosage": "50mg", "form": "Gélule", "description": "Analgésique opioïde", "average_price": 1500, "requires_prescription": True},
    {"name": "Codéine + Paracétamol", "dosage": "30mg/500mg", "form": "Comprimé", "description": "Analgésique combiné", "average_price": 1200, "requires_prescription": True},
    {"name": "Morphine", "dosage": "10mg", "form": "Injectable", "description": "Analgésique opioïde puissant", "average_price": 5000, "requires_prescription": True},
    
    # ========== ANTIBIOTIQUES (25) ==========
    {"name": "Amoxicilline", "dosage": "500mg", "form": "Gélule", "description": "Antibiotique pénicilline", "average_price": 1500, "requires_prescription": True},
    {"name": "Amoxicilline", "dosage": "1g", "form": "Comprimé", "description": "Antibiotique pénicilline forte dose", "average_price": 2000, "requires_prescription": True},
    {"name": "Amoxicilline", "dosage": "250mg/5ml", "form": "Suspension", "description": "Antibiotique pédiatrique", "average_price": 2500, "requires_prescription": True},
    {"name": "Amoxicilline + Acide Clavulanique", "dosage": "500mg/125mg", "form": "Comprimé", "description": "Antibiotique à large spectre", "average_price": 2500, "requires_prescription": True},
    {"name": "Amoxicilline + Acide Clavulanique", "dosage": "1g/125mg", "form": "Comprimé", "description": "Antibiotique forte dose", "average_price": 3000, "requires_prescription": True},
    {"name": "Azithromycine", "dosage": "250mg", "form": "Comprimé", "description": "Antibiotique macrolide", "average_price": 3000, "requires_prescription": True},
    {"name": "Azithromycine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique macrolide forte dose", "average_price": 3500, "requires_prescription": True},
    {"name": "Ciprofloxacine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone", "average_price": 2500, "requires_prescription": True},
    {"name": "Ciprofloxacine", "dosage": "750mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone forte dose", "average_price": 3000, "requires_prescription": True},
    {"name": "Ofloxacine", "dosage": "200mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone", "average_price": 2200, "requires_prescription": True},
    {"name": "Levofloxacine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone", "average_price": 2800, "requires_prescription": True},
    {"name": "Métronidazole", "dosage": "250mg", "form": "Comprimé", "description": "Antibiotique antiprotozoaire", "average_price": 800, "requires_prescription": True},
    {"name": "Métronidazole", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique antiprotozoaire forte dose", "average_price": 1200, "requires_prescription": True},
    {"name": "Clarithromycine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique macrolide", "average_price": 3200, "requires_prescription": True},
    {"name": "Érythromycine", "dosage": "500mg", "form": "Comprimé", "description": "Antibiotique macrolide", "average_price": 2000, "requires_prescription": True},
    {"name": "Doxycycline", "dosage": "100mg", "form": "Gélule", "description": "Antibiotique tétracycline", "average_price": 1500, "requires_prescription": True},
    {"name": "Ceftriaxone", "dosage": "1g", "form": "Injectable", "description": "Antibiotique céphalosporine", "average_price": 3500, "requires_prescription": True},
    {"name": "Cefixime", "dosage": "200mg", "form": "Comprimé", "description": "Antibiotique céphalosporine orale", "average_price": 2500, "requires_prescription": True},
    {"name": "Céfuroxime", "dosage": "250mg", "form": "Comprimé", "description": "Antibiotique céphalosporine", "average_price": 2200, "requires_prescription": True},
    {"name": "Clindamycine", "dosage": "300mg", "form": "Gélule", "description": "Antibiotique lincosamide", "average_price": 2800, "requires_prescription": True},
    {"name": "Gentamicine", "dosage": "80mg", "form": "Injectable", "description": "Antibiotique aminoside", "average_price": 2000, "requires_prescription": True},
    {"name": "Cotrimoxazole", "dosage": "400mg/80mg", "form": "Comprimé", "description": "Antibiotique sulfamide", "average_price": 1000, "requires_prescription": True},
    {"name": "Norfloxacine", "dosage": "400mg", "form": "Comprimé", "description": "Antibiotique fluoroquinolone", "average_price": 1800, "requires_prescription": True},
    {"name": "Pénicilline G", "dosage": "1MUI", "form": "Injectable", "description": "Antibiotique pénicilline", "average_price": 1500, "requires_prescription": True},
    {"name": "Fluconazole", "dosage": "150mg", "form": "Gélule", "description": "Antifongique", "average_price": 2500, "requires_prescription": True},
    
    # ========== ANTIPALUDÉENS (12) ==========
    {"name": "Artemether-Lumefantrine", "dosage": "20mg/120mg", "form": "Comprimé", "description": "Antipaludéen ACT première ligne", "average_price": 3500, "requires_prescription": True},
    {"name": "Artesunate", "dosage": "50mg", "form": "Comprimé", "description": "Antipaludéen artémisinine", "average_price": 4000, "requires_prescription": True},
    {"name": "Artesunate", "dosage": "60mg", "form": "Injectable", "description": "Antipaludéen injectable paludisme sévère", "average_price": 6000, "requires_prescription": True},
    {"name": "Quinine", "dosage": "500mg", "form": "Comprimé", "description": "Antipaludéen alcaloïde", "average_price": 2000, "requires_prescription": True},
    {"name": "Quinine", "dosage": "300mg", "form": "Injectable", "description": "Antipaludéen injectable", "average_price": 3500, "requires_prescription": True},
    {"name": "Artémether", "dosage": "80mg", "form": "Injectable", "description": "Antipaludéen injectable", "average_price": 5000, "requires_prescription": True},
    {"name": "Dihydroartémisinine-Pipéraquine", "dosage": "40mg/320mg", "form": "Comprimé", "description": "Antipaludéen ACT", "average_price": 3800, "requires_prescription": True},
    {"name": "Atovaquone-Proguanil", "dosage": "250mg/100mg", "form": "Comprimé", "description": "Antipaludéen prophylaxie", "average_price": 5000, "requires_prescription": True},
    {"name": "Méfloquine", "dosage": "250mg", "form": "Comprimé", "description": "Antipaludéen prophylaxie", "average_price": 4500, "requires_prescription": True},
    {"name": "Chloroquine", "dosage": "100mg", "form": "Comprimé", "description": "Antipaludéen résistance", "average_price": 1500, "requires_prescription": True},
    {"name": "Primaquine", "dosage": "15mg", "form": "Comprimé", "description": "Antipaludéen hypnozoïtes", "average_price": 2000, "requires_prescription": True},
    {"name": "Artésunate-Amodiaquine", "dosage": "100mg/270mg", "form": "Comprimé", "description": "Antipaludéen ACT combiné", "average_price": 3600, "requires_prescription": True},
    
    # ========== ANTIHISTAMINIQUES / ALLERGIES (10) ==========
    {"name": "Cétirizine", "dosage": "10mg", "form": "Comprimé", "description": "Antihistaminique anti-allergique", "average_price": 1000, "requires_prescription": False},
    {"name": "Loratadine", "dosage": "10mg", "form": "Comprimé", "description": "Antihistaminique anti-allergique", "average_price": 1200, "requires_prescription": False},
    {"name": "Desloratadine", "dosage": "5mg", "form": "Comprimé", "description": "Antihistaminique nouvelle génération", "average_price": 1500, "requires_prescription": False},
    {"name": "Chlorphéniramine", "dosage": "4mg", "form": "Comprimé", "description": "Antihistaminique classique", "average_price": 600, "requires_prescription": False},
    {"name": "Fexofénadine", "dosage": "120mg", "form": "Comprimé", "description": "Antihistaminique non sédatif", "average_price": 1400, "requires_prescription": False},
    {"name": "Prométhazine", "dosage": "25mg", "form": "Comprimé", "description": "Antihistaminique sédatif", "average_price": 800, "requires_prescription": False},
    {"name": "Dexchlorphéniramine", "dosage": "2mg", "form": "Comprimé", "description": "Antihistaminique", "average_price": 700, "requires_prescription": False},
    {"name": "Hydroxyzine", "dosage": "25mg", "form": "Comprimé", "description": "Antihistaminique anxiolytique", "average_price": 1000, "requires_prescription": True},
    {"name": "Lévocétirizine", "dosage": "5mg", "form": "Comprimé", "description": "Antihistaminique haute efficacité", "average_price": 1300, "requires_prescription": False},
    {"name": "Montélukast", "dosage": "10mg", "form": "Comprimé", "description": "Antileucotriènes asthme allergique", "average_price": 2500, "requires_prescription": True},
    
    # ========== GASTRO-INTESTINAUX (20) ==========
    {"name": "Oméprazole", "dosage": "20mg", "form": "Gélule", "description": "Inhibiteur pompe à protons", "average_price": 1500, "requires_prescription": False},
    {"name": "Oméprazole", "dosage": "40mg", "form": "Gélule", "description": "IPP forte dose", "average_price": 2000, "requires_prescription": False},
    {"name": "Ésoméprazole", "dosage": "20mg", "form": "Comprimé", "description": "IPP isomère S", "average_price": 1800, "requires_prescription": False},
    {"name": "Lansoprazole", "dosage": "30mg", "form": "Gélule", "description": "Inhibiteur pompe à protons", "average_price": 1700, "requires_prescription": False},
    {"name": "Pantoprazole", "dosage": "40mg", "form": "Comprimé", "description": "Inhibiteur pompe à protons", "average_price": 1600, "requires_prescription": False},
    {"name": "Ranitidine", "dosage": "150mg", "form": "Comprimé", "description": "Anti-H2", "average_price": 1000, "requires_prescription": False},
    {"name": "Métoclopramide", "dosage": "10mg", "form": "Comprimé", "description": "Antiémétique prokinétique", "average_price": 800, "requires_prescription": False},
    {"name": "Dompéridone", "dosage": "10mg", "form": "Comprimé", "description": "Antiémétique", "average_price": 900, "requires_prescription": False},
    {"name": "Smecta", "dosage": "3g", "form": "Poudre", "description": "Antidiarrhéique pansement", "average_price": 1000, "requires_prescription": False},
    {"name": "Lopéramide", "dosage": "2mg", "form": "Gélule", "description": "Antidiarrhéique ralentisseur transit", "average_price": 1200, "requires_prescription": False},
    {"name": "Sels de Réhydratation Orale", "dosage": "N/A", "form": "Sachet", "description": "SRO réhydratation", "average_price": 300, "requires_prescription": False},
    {"name": "Bisacodyl", "dosage": "5mg", "form": "Comprimé", "description": "Laxatif stimulant", "average_price": 600, "requires_prescription": False},
    {"name": "Lactulose", "dosage": "10g/15ml", "form": "Sirop", "description": "Laxatif osmotique", "average_price": 1500, "requires_prescription": False},
    {"name": "Senna", "dosage": "8.6mg", "form": "Comprimé", "description": "Laxatif végétal", "average_price": 500, "requires_prescription": False},
    {"name": "Polysilane", "dosage": "N/A", "form": "Gel", "description": "Anti-flatulent", "average_price": 1200, "requires_prescription": False},
    {"name": "Maalox", "dosage": "N/A", "form": "Suspension", "description": "Antiacide", "average_price": 1000, "requires_prescription": False},
    {"name": "Gaviscon", "dosage": "N/A", "form": "Suspension", "description": "Antiacide alginate", "average_price": 1500, "requires_prescription": False},
    {"name": "Charbon activé", "dosage": "250mg", "form": "Gélule", "description": "Antidiarrhéique adsorbant", "average_price": 800, "requires_prescription": False},
    {"name": "Trimébutine", "dosage": "200mg", "form": "Comprimé", "description": "Antispasmodique", "average_price": 1400, "requires_prescription": False},
    {"name": "Phloroglucinol", "dosage": "80mg", "form": "Comprimé", "description": "Antispasmodique musculotrope", "average_price": 1200, "requires_prescription": False},
    
    # ========== VITAMINES & SUPPLÉMENTS (15) ==========
    {"name": "Vitamine C", "dosage": "500mg", "form": "Comprimé effervescent", "description": "Supplément vitaminique", "average_price": 800, "requires_prescription": False},
    {"name": "Vitamine C", "dosage": "1000mg", "form": "Comprimé effervescent", "description": "Vitamine C forte dose", "average_price": 1200, "requires_prescription": False},
    {"name": "Vitamine D3", "dosage": "1000UI", "form": "Gélule", "description": "Supplément vitamine D", "average_price": 1500, "requires_prescription": False},
    {"name": "Vitamine D3", "dosage": "5000UI", "form": "Gélule", "description": "Vitamine D forte dose", "average_price": 2000, "requires_prescription": False},
    {"name": "Fer + Acide Folique", "dosage": "200mg/0.25mg", "form": "Comprimé", "description": "Supplément anti-anémie", "average_price": 1500, "requires_prescription": False},
    {"name": "Fer", "dosage": "80mg", "form": "Comprimé", "description": "Supplément fer", "average_price": 1200, "requires_prescription": False},
    {"name": "Acide Folique", "dosage": "5mg", "form": "Comprimé", "description": "Vitamine B9", "average_price": 800, "requires_prescription": False},
    {"name": "Vitamine B12", "dosage": "1000mcg", "form": "Injectable", "description": "Cyanocobalamine", "average_price": 2500, "requires_prescription": False},
    {"name": "Vitamine B Complex", "dosage": "N/A", "form": "Comprimé", "description": "Complexe vitamines B", "average_price": 1800, "requires_prescription": False},
    {"name": "Multivitamines", "dosage": "N/A", "form": "Comprimé", "description": "Complexe multivitaminé", "average_price": 2000, "requires_prescription": False},
    {"name": "Calcium + Vitamine D3", "dosage": "500mg/200UI", "form": "Comprimé", "description": "Supplément calcium", "average_price": 2500, "requires_prescription": False},
    {"name": "Magnésium", "dosage": "300mg", "form": "Comprimé", "description": "Supplément magnésium", "average_price": 1500, "requires_prescription": False},
    {"name": "Zinc", "dosage": "25mg", "form": "Comprimé", "description": "Supplément zinc", "average_price": 1200, "requires_prescription": False},
    {"name": "Omega 3", "dosage": "1000mg", "form": "Capsule", "description": "Acides gras essentiels", "average_price": 3000, "requires_prescription": False},
    {"name": "Vitamine E", "dosage": "400UI", "form": "Capsule", "description": "Antioxydant", "average_price": 1800, "requires_prescription": False},
    
    # ========== CARDIOVASCULAIRES (20) ==========
    {"name": "Amlodipine", "dosage": "5mg", "form": "Comprimé", "description": "Antihypertenseur inhibiteur calcique", "average_price": 2000, "requires_prescription": True},
    {"name": "Amlodipine", "dosage": "10mg", "form": "Comprimé", "description": "Antihypertenseur forte dose", "average_price": 2500, "requires_prescription": True},
    {"name": "Losartan", "dosage": "50mg", "form": "Comprimé", "description": "Antihypertenseur ARA2", "average_price": 2200, "requires_prescription": True},
    {"name": "Losartan", "dosage": "100mg", "form": "Comprimé", "description": "Antihypertenseur ARA2 forte dose", "average_price": 2800, "requires_prescription": True},
    {"name": "Valsartan", "dosage": "80mg", "form": "Comprimé", "description": "Antihypertenseur ARA2", "average_price": 2400, "requires_prescription": True},
    {"name": "Enalapril", "dosage": "10mg", "form": "Comprimé", "description": "Antihypertenseur IEC", "average_price": 1800, "requires_prescription": True},
    {"name": "Enalapril", "dosage": "20mg", "form": "Comprimé", "description": "Antihypertenseur IEC forte dose", "average_price": 2200, "requires_prescription": True},
    {"name": "Ramipril", "dosage": "5mg", "form": "Comprimé", "description": "Antihypertenseur IEC", "average_price": 2000, "requires_prescription": True},
    {"name": "Lisinopril", "dosage": "10mg", "form": "Comprimé", "description": "Antihypertenseur IEC", "average_price": 1900, "requires_prescription": True},
    {"name": "Bisoprolol", "dosage": "5mg", "form": "Comprimé", "description": "Bêtabloquant cardiosélectif", "average_price": 1700, "requires_prescription": True},
    {"name": "Atenolol", "dosage": "50mg", "form": "Comprimé", "description": "Bêtabloquant", "average_price": 1500, "requires_prescription": True},
    {"name": "Carvedilol", "dosage": "6.25mg", "form": "Comprimé", "description": "Bêtabloquant alpha/bêta", "average_price": 1800, "requires_prescription": True},
    {"name": "Furosémide", "dosage": "40mg", "form": "Comprimé", "description": "Diurétique de l'anse", "average_price": 1000, "requires_prescription": True},
    {"name": "Hydrochlorothiazide", "dosage": "25mg", "form": "Comprimé", "description": "Diurétique thiazidique", "average_price": 900, "requires_prescription": True},
    {"name": "Spironolactone", "dosage": "25mg", "form": "Comprimé", "description": "Diurétique épargneur potassium", "average_price": 1200, "requires_prescription": True},
    {"name": "Atorvastatine", "dosage": "20mg", "form": "Comprimé", "description": "Hypolipémiant statine", "average_price": 2500, "requires_prescription": True},
    {"name": "Simvastatine", "dosage": "20mg", "form": "Comprimé", "description": "Hypolipémiant statine", "average_price": 2200, "requires_prescription": True},
    {"name": "Digoxine", "dosage": "0.25mg", "form": "Comprimé", "description": "Cardiotonique", "average_price": 1500, "requires_prescription": True},
    {"name": "Isosorbide Dinitrate", "dosage": "5mg", "form": "Comprimé", "description": "Vasodilatateur antiangireux", "average_price": 1300, "requires_prescription": True},
    {"name": "Clopidogrel", "dosage": "75mg", "form": "Comprimé", "description": "Antiagrégant plaquettaire", "average_price": 3000, "requires_prescription": True},
    
    # ========== ANTIDIABÉTIQUES (12) ==========
    {"name": "Metformine", "dosage": "500mg", "form": "Comprimé", "description": "Antidiabétique biguanide", "average_price": 1500, "requires_prescription": True},
    {"name": "Metformine", "dosage": "850mg", "form": "Comprimé", "description": "Antidiabétique forte dose", "average_price": 2000, "requires_prescription": True},
    {"name": "Metformine", "dosage": "1000mg", "form": "Comprimé", "description": "Antidiabétique très forte dose", "average_price": 2500, "requires_prescription": True},
    {"name": "Gliclazide", "dosage": "80mg", "form": "Comprimé", "description": "Antidiabétique sulfamide", "average_price": 2500, "requires_prescription": True},
    {"name": "Glibenclamide", "dosage": "5mg", "form": "Comprimé", "description": "Antidiabétique sulfamide", "average_price": 2000, "requires_prescription": True},
    {"name": "Glimepiride", "dosage": "2mg", "form": "Comprimé", "description": "Antidiabétique sulfamide", "average_price": 2300, "requires_prescription": True},
    {"name": "Sitagliptine", "dosage": "100mg", "form": "Comprimé", "description": "Antidiabétique inhibiteur DPP-4", "average_price": 4000, "requires_prescription": True},
    {"name": "Vildagliptine", "dosage": "50mg", "form": "Comprimé", "description": "Antidiabétique inhibiteur DPP-4", "average_price": 3800, "requires_prescription": True},
    {"name": "Insuline NPH", "dosage": "100UI/ml", "form": "Injectable", "description": "Insuline intermédiaire", "average_price": 8000, "requires_prescription": True},
    {"name": "Insuline Rapide", "dosage": "100UI/ml", "form": "Injectable", "description": "Insuline action rapide", "average_price": 8500, "requires_prescription": True},
    {"name": "Insuline Glargine", "dosage": "100UI/ml", "form": "Injectable", "description": "Insuline longue durée", "average_price": 12000, "requires_prescription": True},
    {"name": "Acarbose", "dosage": "50mg", "form": "Comprimé", "description": "Antidiabétique inhibiteur alpha-glucosidase", "average_price": 2800, "requires_prescription": True},
    
    # ========== RESPIRATOIRES / ASTHME (10) ==========
    {"name": "Salbutamol", "dosage": "100mcg", "form": "Inhalateur", "description": "Bronchodilatateur bêta-2", "average_price": 3500, "requires_prescription": True},
    {"name": "Salbutamol", "dosage": "2mg/5ml", "form": "Sirop", "description": "Bronchodilatateur oral", "average_price": 2000, "requires_prescription": True},
    {"name": "Terbutaline", "dosage": "2.5mg", "form": "Comprimé", "description": "Bronchodilatateur bêta-2", "average_price": 1800, "requires_prescription": True},
    {"name": "Béclométasone", "dosage": "250mcg", "form": "Inhalateur", "description": "Corticoïde inhalé", "average_price": 4500, "requires_prescription": True},
    {"name": "Fluticasone", "dosage": "125mcg", "form": "Inhalateur", "description": "Corticoïde inhalé", "average_price": 5000, "requires_prescription": True},
    {"name": "Théophylline", "dosage": "200mg", "form": "Comprimé", "description": "Bronchodilatateur xanthine", "average_price": 1500, "requires_prescription": True},
    {"name": "Ambroxol", "dosage": "30mg", "form": "Comprimé", "description": "Mucolytique expectorant", "average_price": 1000, "requires_prescription": False},
    {"name": "Carbocistéine", "dosage": "250mg", "form": "Gélule", "description": "Mucolytique", "average_price": 1200, "requires_prescription": False},
    {"name": "Codéine", "dosage": "20mg", "form": "Sirop", "description": "Antitussif opiacé", "average_price": 1500, "requires_prescription": True},
    {"name": "Dextrométhorphane", "dosage": "15mg/5ml", "form": "Sirop", "description": "Antitussif non opiacé", "average_price": 1200, "requires_prescription": False},
    
    # ========== DERMATOLOGIQUES (15) ==========
    {"name": "Hydrocortisone", "dosage": "1%", "form": "Crème", "description": "Corticoïde topique faible", "average_price": 1500, "requires_prescription": False},
    {"name": "Bétaméthasone", "dosage": "0.1%", "form": "Crème", "description": "Corticoïde topique fort", "average_price": 2000, "requires_prescription": True},
    {"name": "Clobétasol", "dosage": "0.05%", "form": "Crème", "description": "Corticoïde topique très fort", "average_price": 2500, "requires_prescription": True},
    {"name": "Econazole", "dosage": "1%", "form": "Crème", "description": "Antifongique topique", "average_price": 2000, "requires_prescription": False},
    {"name": "Clotrimazole", "dosage": "1%", "form": "Crème", "description": "Antifongique topique", "average_price": 1800, "requires_prescription": False},
    {"name": "Miconazole", "dosage": "2%", "form": "Crème", "description": "Antifongique topique", "average_price": 1900, "requires_prescription": False},
    {"name": "Terbinafine", "dosage": "1%", "form": "Crème", "description": "Antifongique topique", "average_price": 2200, "requires_prescription": False},
    {"name": "Mupirocine", "dosage": "2%", "form": "Pommade", "description": "Antibiotique topique", "average_price": 2500, "requires_prescription": True},
    {"name": "Gentamicine", "dosage": "0.3%", "form": "Crème", "description": "Antibiotique topique", "average_price": 1500, "requires_prescription": True},
    {"name": "Aciclovir", "dosage": "5%", "form": "Crème", "description": "Antiviral herpès topique", "average_price": 2800, "requires_prescription": False},
    {"name": "Peroxyde de Benzoyle", "dosage": "5%", "form": "Gel", "description": "Anti-acné", "average_price": 2000, "requires_prescription": False},
    {"name": "Trétinoïne", "dosage": "0.05%", "form": "Crème", "description": "Rétinoïde anti-acné", "average_price": 3500, "requires_prescription": True},
    {"name": "Vaseline", "dosage": "100%", "form": "Pommade", "description": "Émollient protecteur", "average_price": 800, "requires_prescription": False},
    {"name": "Glycérine", "dosage": "N/A", "form": "Lotion", "description": "Hydratant émollient", "average_price": 1000, "requires_prescription": False},
    {"name": "Calamine", "dosage": "N/A", "form": "Lotion", "description": "Anti-prurigineux", "average_price": 1200, "requires_prescription": False},
    
    # ========== ANTIPARASITAIRES (8) ==========
    {"name": "Albendazole", "dosage": "400mg", "form": "Comprimé", "description": "Antiparasitaire large spectre", "average_price": 800, "requires_prescription": False},
    {"name": "Mébendazole", "dosage": "100mg", "form": "Comprimé", "description": "Antiparasitaire nématodes", "average_price": 600, "requires_prescription": False},
    {"name": "Mébendazole", "dosage": "500mg", "form": "Comprimé", "description": "Antiparasitaire dose unique", "average_price": 1000, "requires_prescription": False},
    {"name": "Praziquantel", "dosage": "600mg", "form": "Comprimé", "description": "Antiparasitaire schistosomiase", "average_price": 2500, "requires_prescription": True},
    {"name": "Ivermectine", "dosage": "3mg", "form": "Comprimé", "description": "Antiparasitaire onchocercose", "average_price": 1500, "requires_prescription": True},
    {"name": "Pyrantel", "dosage": "250mg", "form": "Comprimé", "description": "Antiparasitaire oxyures", "average_price": 700, "requires_prescription": False},
    {"name": "Permethrine", "dosage": "5%", "form": "Crème", "description": "Anti-gale topique", "average_price": 2000, "requires_prescription": False},
    {"name": "Lindane", "dosage": "1%", "form": "Lotion", "description": "Anti-poux anti-gale", "average_price": 1800, "requires_prescription": False},
    
    # ========== AUTRES MÉDICAMENTS IMPORTANTS (10) ==========
    {"name": "Prednisolone", "dosage": "5mg", "form": "Comprimé", "description": "Corticoïde systémique", "average_price": 1500, "requires_prescription": True},
    {"name": "Prednisolone", "dosage": "20mg", "form": "Comprimé", "description": "Corticoïde forte dose", "average_price": 2000, "requires_prescription": True},
    {"name": "Dexaméthasone", "dosage": "0.5mg", "form": "Comprimé", "description": "Corticoïde puissant", "average_price": 1000, "requires_prescription": True},
    {"name": "Dexaméthasone", "dosage": "4mg", "form": "Injectable", "description": "Corticoïde injectable", "average_price": 2500, "requires_prescription": True},
    {"name": "Diazépam", "dosage": "5mg", "form": "Comprimé", "description": "Benzodiazépine anxiolytique", "average_price": 1200, "requires_prescription": True},
    {"name": "Alprazolam", "dosage": "0.5mg", "form": "Comprimé", "description": "Benzodiazépine anxiolytique", "average_price": 1400, "requires_prescription": True},
    {"name": "Bromazépam", "dosage": "3mg", "form": "Comprimé", "description": "Benzodiazépine anxiolytique", "average_price": 1300, "requires_prescription": True},
    {"name": "Clonazépam", "dosage": "2mg", "form": "Comprimé", "description": "Benzodiazépine antiépileptique", "average_price": 1600, "requires_prescription": True},
    {"name": "Carbamazépine", "dosage": "200mg", "form": "Comprimé", "description": "Antiépileptique", "average_price": 2000, "requires_prescription": True},
    {"name": "Phénobarbital", "dosage": "100mg", "form": "Comprimé", "description": "Antiépileptique barbitur ique", "average_price": 1500, "requires_prescription": True},
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
    
    for i, data in enumerate(MEDICINES_DATA, 1):
        medicine = Medicine.objects.create(
            name=data["name"],
            dosage=data["dosage"],
            form=data["form"],
            description=data["description"],
            average_price=Decimal(str(data["average_price"])),
            requires_prescription=data["requires_prescription"]
        )
        medicines.append(medicine)
        if i % 20 == 0:
            print(f"  ✅ {i} médicaments créés...")
    
    print(f"\n✅ {len(medicines)} médicaments créés au total!")
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
        # Chaque pharmacie a entre 70 et 120 médicaments différents (sur 150+)
        available_medicines_count = randint(70, 120)
        
        # Sélectionner aléatoirement des médicaments
        import random
        selected_medicines = random.sample(medicines, min(available_medicines_count, len(medicines)))
        
        for medicine in selected_medicines:
            # Quantité aléatoire entre 10 et 250
            quantity = randint(10, 250)
            
            # Prix avec une variation de ±20% par rapport au prix moyen
            price_variation = uniform(0.80, 1.20)
            price = medicine.average_price * Decimal(str(price_variation))
            price = price.quantize(Decimal('1'))  # Arrondi à l'unité (FCFA)
            
            # Disponibilité (92% de chances d'être disponible)
            is_available = quantity > 15 and (random.random() < 0.92)
            
            Stock.objects.create(
                pharmacy=pharmacy,
                medicine=medicine,
                quantity=quantity,
                price=price,
                is_available=is_available
            )
            stock_count += 1
        
        print(f"  ✅ {pharmacy.name}: {len(selected_medicines)} médicaments")
    
    print(f"\n✅ {stock_count} stocks créés au total!")
    return stock_count


def print_statistics():
    """Affiche les statistiques de la base de données"""
    print("\n" + "="*70)
    print("📊 STATISTIQUES COMPLÈTES DE LA BASE DE DONNÉES FINDPHARMA")
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
    
    print("\n💊 Formes pharmaceutiques:")
    from django.db.models import Count
    forms = Medicine.objects.values('form').annotate(count=Count('id')).order_by('-count')[:10]
    for form in forms:
        print(f"   • {form['form']}: {form['count']} médicaments")
    
    print("="*70)


@transaction.atomic
def main():
    """Fonction principale"""
    print("="*70)
    print("🚀 PEUPLEMENT COMPLET - 150+ MÉDICAMENTS - FINDPHARMA")
    print("="*70)
    
    # Vérifier qu'il y a des pharmacies
    pharmacies = list(Pharmacy.objects.all())
    if not pharmacies:
        print("\n❌ ERREUR: Aucune pharmacie dans la base de données!")
        print("   Veuillez d'abord exécuter: python populate_cameroun_30_10.py")
        sys.exit(1)
    
    print(f"\n✅ {len(pharmacies)} pharmacies trouvées dans la base")
    print("   Ces pharmacies vont être approvisionnées en médicaments variés\n")
    
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
