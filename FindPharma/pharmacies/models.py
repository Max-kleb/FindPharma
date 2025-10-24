from django.contrib.gis.db import models as gis_models
from django.db import models

class Pharmacy(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    
    # Champs de géolocalisation
    latitude = models.FloatField()
    longitude = models.FloatField()
    location = gis_models.PointField(geography=True, null=True, blank=True)
    
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