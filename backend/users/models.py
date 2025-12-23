from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour FindPharma.
    Permet d'associer un utilisateur à une pharmacie avec système d'approbation.
    """
    USER_TYPE_CHOICES = [
        ('admin', 'Administrateur'),
        ('pharmacy', 'Pharmacie'),
        ('customer', 'Client'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
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
    
    # Champs pour le système d'approbation des pharmacies
    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default='approved',
        help_text="Statut d'approbation du compte (pending pour les nouvelles pharmacies)"
    )
    
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Motif de refus si le compte a été rejeté"
    )
    
    approved_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Date d'approbation du compte"
    )
    
    approved_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_users',
        help_text="Admin ayant approuvé le compte"
    )
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        indexes = [
            models.Index(fields=['approval_status', 'user_type']),
        ]
    
    def __str__(self):
        if self.pharmacy:
            return f"{self.username} ({self.pharmacy.name})"
        return self.username
    
    @property
    def is_approved(self):
        """Vérifie si le compte est approuvé"""
        return self.approval_status == 'approved'
    
    @property
    def is_pending(self):
        """Vérifie si le compte est en attente d'approbation"""
        return self.approval_status == 'pending'
    
    def is_pharmacy_user(self):
        """Vérifie si l'utilisateur est associé à une pharmacie"""
        return self.user_type == 'pharmacy' and self.pharmacy is not None
    
    def can_manage_pharmacy(self, pharmacy_id):
        """Vérifie si l'utilisateur peut gérer une pharmacie donnée"""
        if self.is_superuser:
            return True
        return self.is_pharmacy_user() and self.pharmacy_id == pharmacy_id and self.is_approved
    
    def approve(self, admin_user):
        """Approuve le compte utilisateur"""
        self.approval_status = 'approved'
        self.approved_at = timezone.now()
        self.approved_by = admin_user
        self.rejection_reason = None
        self.save()
        
        # Activer aussi la pharmacie associée si elle existe
        if self.pharmacy:
            self.pharmacy.approve()
    
    def reject(self, admin_user, reason):
        """Rejette le compte utilisateur avec un motif"""
        self.approval_status = 'rejected'
        self.rejection_reason = reason
        self.approved_by = admin_user
        self.save()
        
        # Rejeter aussi la pharmacie associée
        if self.pharmacy:
            self.pharmacy.reject(reason)


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


class EmailVerification(models.Model):
    """
    Modèle pour stocker les codes de vérification email
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verifications',
        help_text="Utilisateur à vérifier"
    )
    
    code = models.CharField(
        max_length=6,
        help_text="Code de vérification à 6 caractères"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date de création du code"
    )
    
    expires_at = models.DateTimeField(
        help_text="Date d'expiration du code"
    )
    
    is_used = models.BooleanField(
        default=False,
        help_text="Le code a-t-il été utilisé ?"
    )
    
    attempts = models.IntegerField(
        default=0,
        help_text="Nombre de tentatives de vérification"
    )
    
    class Meta:
        verbose_name = 'Vérification Email'
        verbose_name_plural = 'Vérifications Email'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['code', 'is_used']),
        ]
    
    def save(self, *args, **kwargs):
        # Définir l'expiration à 15 minutes si non définie
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Vérifie si le code a expiré"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Vérifie si le code est valide (non utilisé et non expiré)"""
        return not self.is_used and not self.is_expired() and self.attempts < 5
    
    def __str__(self):
        status = "✅ Valide" if self.is_valid() else "❌ Invalide"
        return f"{self.user.username} - {self.code} ({status})"
