import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FindPharma.settings')
django.setup()

from django.contrib.gis.geos import Point
from pharmacies.models import Pharmacy

# Mettre à jour les locations pour toutes les pharmacies
for pharmacy in Pharmacy.objects.all():
    if pharmacy.latitude and pharmacy.longitude:
        pharmacy.location = Point(pharmacy.longitude, pharmacy.latitude, srid=4326)
        pharmacy.save()
        print(f"✅ Location mise à jour pour : {pharmacy.name}")

print(f"\n✅ Total : {Pharmacy.objects.count()} pharmacies mises à jour")
