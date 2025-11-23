from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour FindPharma.
    Permet d'associer un utilisateur à une pharmacie.
    """
    USER_TYPE_CHOICES = [
        ('admin', 'Administrateur'),
        ('pharmacy', 'Pharmacie'),
        ('customer', 'Client'),
    ]
    
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='customer'
    )
    
    pharmacy = models.ForeignKey(
        'pharmacies.Pharmacy',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text="Pharmacie associée à cet utilisateur (pour les comptes pharmacie)"
    )
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        if self.pharmacy:
            return f"{self.username} ({self.pharmacy.name})"
        return self.username
    
    def is_pharmacy_user(self):
        """Vérifie si l'utilisateur est associé à une pharmacie"""
        return self.user_type == 'pharmacy' and self.pharmacy is not None
    
    def can_manage_pharmacy(self, pharmacy_id):
        """Vérifie si l'utilisateur peut gérer une pharmacie donnée"""
        if self.is_superuser:
            return True
        return self.is_pharmacy_user() and self.pharmacy_id == pharmacy_id


class SearchHistory(models.Model):
    """
    Modèle pour enregistrer l'historique des recherches des utilisateurs.
    Permet aux utilisateurs de retrouver leurs recherches précédentes.
    """
    SEARCH_TYPE_CHOICES = [
        ('medicine', 'Recherche de médicament'),
        ('nearby', 'Recherche de pharmacies à proximité'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='search_history',
        help_text="Utilisateur ayant effectué la recherche"
    )
    
    query = models.CharField(
        max_length=255,
        help_text="Terme de recherche utilisé"
    )
    
    search_type = models.CharField(
        max_length=20,
        choices=SEARCH_TYPE_CHOICES,
        default='medicine',
        help_text="Type de recherche effectuée"
    )
    
    results_count = models.IntegerField(
        default=0,
        help_text="Nombre de résultats trouvés"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date et heure de la recherche"
    )
    
    class Meta:
        verbose_name = 'Historique de recherche'
        verbose_name_plural = 'Historiques de recherche'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['search_type']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.query} ({self.get_search_type_display()})"
