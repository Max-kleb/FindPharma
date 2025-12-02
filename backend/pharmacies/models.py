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
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


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
    
    @property
    def average_rating(self):
        """Calcule la note moyenne de la pharmacie"""
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None
    
    @property
    def reviews_count(self):
        """Nombre total d'avis"""
        return self.reviews.count()


class PharmacyReview(models.Model):
    """
    Modèle pour les avis et notations des pharmacies (User Story 7)
    """
    pharmacy = models.ForeignKey(
        Pharmacy,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Pharmacie"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pharmacy_reviews',
        verbose_name="Utilisateur"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Note (1-5)"
    )
    comment = models.TextField(
        blank=True,
        default='',
        verbose_name="Commentaire"
    )
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Modération
    is_approved = models.BooleanField(default=True, verbose_name="Approuvé")
    is_reported = models.BooleanField(default=False, verbose_name="Signalé")
    
    class Meta:
        verbose_name = "Avis pharmacie"
        verbose_name_plural = "Avis pharmacies"
        ordering = ['-created_at']
        # Un utilisateur ne peut laisser qu'un seul avis par pharmacie
        unique_together = ['pharmacy', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.pharmacy.name} ({self.rating}/5)"