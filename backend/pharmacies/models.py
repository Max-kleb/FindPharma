try:
    from django.contrib.gis.db import models as gis_models
    GIS_AVAILABLE = True
except Exception:
    # Fallback when GDAL/PostGIS isn't available (e.g. on CI or dev
    # machines without system libs). In that case we use regular
    # django models for the fields we need for tests.
    from django.db import models as gis_models
    GIS_AVAILABLE = False

from django.db import models


class Pharmacy(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    
    # Champs de géolocalisation
    latitude = models.FloatField()
    longitude = models.FloatField()
    if GIS_AVAILABLE:
        location = gis_models.PointField(geography=True, null=True, blank=True)
    else:
        # Fallback storage for tests: simple JSONField to hold [lat, lon]
        location = models.JSONField(null=True, blank=True)
    
    # Horaires et infos
    opening_hours = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Pharmacies"
        ordering = ['name']
    
    def __str__(self):
        return self.name