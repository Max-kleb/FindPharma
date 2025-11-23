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
