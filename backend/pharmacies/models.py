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
from django.utils import timezone


class Pharmacy(models.Model):
    """
    Modèle Pharmacie avec système d'approbation pour les inscriptions.
    """
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'En attente de validation'),
        ('approved', 'Approuvée'),
        ('rejected', 'Refusée'),
    ]
    
    name = models.CharField(max_length=255, verbose_name="Nom de la pharmacie")
    address = models.TextField(verbose_name="Adresse complète")
    phone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    
    # Informations légales
    license_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
        verbose_name="Numéro d'agrément",
        help_text="Numéro d'agrément officiel de la pharmacie (ex: CAM-PHARM-2024-XXXX)"
    )
    
    # Champs de géolocalisation
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    if GIS_AVAILABLE:
        location = gis_models.PointField(geography=True, null=True, blank=True)
    else:
        # Fallback storage for tests: simple JSONField to hold [lat, lon]
        location = models.JSONField(null=True, blank=True)
    
    # Horaires et infos
    opening_hours = models.JSONField(default=dict, blank=True, verbose_name="Horaires d'ouverture")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    # Système d'approbation
    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default='approved',
        verbose_name="Statut d'approbation",
        help_text="Les nouvelles pharmacies sont en attente jusqu'à validation admin"
    )
    
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Motif de refus",
        help_text="Explication si la demande a été refusée"
    )
    
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_pharmacies',
        verbose_name="Soumis par",
        help_text="Utilisateur ayant soumis la demande d'inscription"
    )
    
    approved_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Date d'approbation"
    )
    
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_pharmacies',
        verbose_name="Approuvé par"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")
    
    class Meta:
        verbose_name = "Pharmacie"
        verbose_name_plural = "Pharmacies"
        ordering = ['name']
        indexes = [
            models.Index(fields=['approval_status']),
            models.Index(fields=['license_number']),
            models.Index(fields=['is_active', 'approval_status']),
        ]
    
    def __str__(self):
        status = ""
        if self.approval_status == 'pending':
            status = " ⏳"
        elif self.approval_status == 'rejected':
            status = " ❌"
        return f"{self.name}{status}"
    
    @property
    def is_approved(self):
        """Vérifie si la pharmacie est approuvée"""
        return self.approval_status == 'approved'
    
    @property
    def is_pending(self):
        """Vérifie si la pharmacie est en attente"""
        return self.approval_status == 'pending'
    
    @property
    def is_visible(self):
        """Vérifie si la pharmacie doit être visible sur la carte"""
        return self.is_active and self.is_approved
    
    def approve(self, admin_user=None):
        """Approuve la pharmacie"""
        self.approval_status = 'approved'
        self.approved_at = timezone.now()
        self.approved_by = admin_user
        self.rejection_reason = None
        self.is_active = True
        self.save()
    
    def reject(self, reason, admin_user=None):
        """Rejette la pharmacie avec un motif"""
        self.approval_status = 'rejected'
        self.rejection_reason = reason
        self.approved_by = admin_user
        self.is_active = False
        self.save()
    
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