# backend/reservations/models.py
"""
Modèles pour le système de réservation de médicaments (User Story 6)
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid


class Reservation(models.Model):
    """
    Modèle représentant une réservation de médicaments.
    Permet à un utilisateur de réserver des médicaments dans une pharmacie
    pour les récupérer plus tard.
    """
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),           # Réservation créée, en attente de confirmation
        ('confirmed', 'Confirmée'),           # Réservation confirmée par la pharmacie
        ('ready', 'Prête'),                   # Commande prête à récupérer
        ('collected', 'Récupérée'),           # Médicaments récupérés par le client
        ('cancelled', 'Annulée'),             # Réservation annulée (client ou pharmacie)
        ('expired', 'Expirée'),               # Réservation expirée (non récupérée à temps)
    ]
    
    # Identifiant unique lisible
    reservation_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Numéro unique de réservation (ex: RES-2025-XXXX)"
    )
    
    # Utilisateur qui fait la réservation
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations',
        help_text="Client qui a effectué la réservation"
    )
    
    # Pharmacie où récupérer les médicaments
    pharmacy = models.ForeignKey(
        'pharmacies.Pharmacy',
        on_delete=models.CASCADE,
        related_name='reservations',
        help_text="Pharmacie où récupérer la réservation"
    )
    
    # Statut de la réservation
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text="État actuel de la réservation"
    )
    
    # Informations de contact
    contact_name = models.CharField(
        max_length=100,
        help_text="Nom de la personne qui viendra récupérer"
    )
    
    contact_phone = models.CharField(
        max_length=20,
        help_text="Téléphone de contact"
    )
    
    contact_email = models.EmailField(
        blank=True,
        null=True,
        help_text="Email pour les notifications (optionnel)"
    )
    
    # Date de récupération souhaitée
    pickup_date = models.DateTimeField(
        help_text="Date et heure souhaitées pour la récupération"
    )
    
    # Note/commentaire du client
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Instructions ou commentaires spéciaux"
    )
    
    # Note de la pharmacie (raison d'annulation, etc.)
    pharmacy_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Notes de la pharmacie (ex: raison d'annulation)"
    )
    
    # Dates de suivi
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date de création de la réservation"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Dernière mise à jour"
    )
    
    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date de confirmation par la pharmacie"
    )
    
    ready_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date où la commande est devenue prête"
    )
    
    collected_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date de récupération effective"
    )
    
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date d'annulation"
    )
    
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_reservations',
        help_text="Utilisateur qui a annulé la réservation"
    )
    
    # Expiration automatique
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date d'expiration de la réservation si non récupérée"
    )
    
    class Meta:
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['pharmacy', 'status']),
            models.Index(fields=['reservation_number']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['pickup_date']),
        ]
    
    def __str__(self):
        return f"{self.reservation_number} - {self.user.username} @ {self.pharmacy.name}"
    
    def save(self, *args, **kwargs):
        """Génère un numéro de réservation unique si nouveau"""
        if not self.reservation_number:
            self.reservation_number = self._generate_reservation_number()
        
        # Si pas de date d'expiration, définir à pickup_date + 24h
        if not self.expires_at and self.pickup_date:
            self.expires_at = self.pickup_date + timezone.timedelta(hours=24)
        
        super().save(*args, **kwargs)
    
    def _generate_reservation_number(self):
        """Génère un numéro de réservation unique"""
        year = timezone.now().year
        random_part = uuid.uuid4().hex[:6].upper()
        return f"RES-{year}-{random_part}"
    
    @property
    def total_items(self):
        """Nombre total d'articles dans la réservation"""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_price(self):
        """Prix total de la réservation"""
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def is_cancellable(self):
        """Vérifie si la réservation peut être annulée"""
        return self.status in ['pending', 'confirmed', 'ready']
    
    @property
    def is_expired(self):
        """Vérifie si la réservation a expiré"""
        if self.expires_at:
            return timezone.now() > self.expires_at and self.status not in ['collected', 'cancelled', 'expired']
        return False
    
    def confirm(self, user=None):
        """Confirme la réservation"""
        if self.status != 'pending':
            raise ValueError("Seules les réservations en attente peuvent être confirmées")
        
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()
    
    def mark_ready(self):
        """Marque la réservation comme prête à récupérer"""
        if self.status not in ['pending', 'confirmed']:
            raise ValueError("La réservation doit être en attente ou confirmée")
        
        self.status = 'ready'
        self.ready_at = timezone.now()
        self.save()
    
    def mark_collected(self):
        """Marque la réservation comme récupérée"""
        if self.status not in ['confirmed', 'ready']:
            raise ValueError("La réservation doit être confirmée ou prête")
        
        self.status = 'collected'
        self.collected_at = timezone.now()
        self.save()
    
    def cancel(self, user=None, reason=None):
        """
        Annule la réservation et restaure les stocks
        """
        if not self.is_cancellable:
            raise ValueError("Cette réservation ne peut plus être annulée")
        
        # Restaurer les stocks
        for item in self.items.all():
            item.restore_stock()
        
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancelled_by = user
        if reason:
            self.pharmacy_notes = reason
        self.save()
    
    def check_and_update_expiration(self):
        """Vérifie et met à jour le statut si expiré"""
        if self.is_expired:
            # Restaurer les stocks avant expiration
            for item in self.items.all():
                item.restore_stock()
            
            self.status = 'expired'
            self.save()
            return True
        return False


class ReservationItem(models.Model):
    """
    Modèle représentant un article dans une réservation.
    Lie un médicament spécifique d'un stock à une réservation.
    """
    
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Réservation à laquelle appartient cet article"
    )
    
    medicine = models.ForeignKey(
        'medicines.Medicine',
        on_delete=models.CASCADE,
        related_name='reservation_items',
        help_text="Médicament réservé"
    )
    
    stock = models.ForeignKey(
        'stocks.Stock',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservation_items',
        help_text="Référence au stock de la pharmacie"
    )
    
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Quantité réservée"
    )
    
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Prix unitaire au moment de la réservation"
    )
    
    # Stocke si le stock a été décrémenté (pour éviter double restauration)
    stock_decremented = models.BooleanField(
        default=False,
        help_text="Indique si le stock a été décrémenté"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date d'ajout à la réservation"
    )
    
    class Meta:
        verbose_name = 'Article de réservation'
        verbose_name_plural = 'Articles de réservation'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reservation', 'medicine']),
        ]
    
    def __str__(self):
        return f"{self.quantity}x {self.medicine.name}"
    
    @property
    def subtotal(self):
        """Calcule le sous-total pour cet article"""
        return self.quantity * self.unit_price
    
    def decrement_stock(self):
        """Décrémente le stock lors de la création de la réservation"""
        if self.stock and not self.stock_decremented:
            if self.stock.quantity >= self.quantity:
                self.stock.quantity -= self.quantity
                self.stock.save()
                self.stock_decremented = True
                self.save()
                return True
            else:
                raise ValueError(
                    f"Stock insuffisant pour {self.medicine.name}. "
                    f"Disponible: {self.stock.quantity}, Demandé: {self.quantity}"
                )
        return False
    
    def restore_stock(self):
        """Restaure le stock lors d'une annulation"""
        if self.stock and self.stock_decremented:
            self.stock.quantity += self.quantity
            self.stock.save()
            self.stock_decremented = False
            self.save()
            return True
        return False
    
    def save(self, *args, **kwargs):
        """Validation et sauvegarde"""
        # Si nouveau et pas de prix, prendre le prix du stock
        if not self.pk and not self.unit_price and self.stock:
            self.unit_price = self.stock.price
        
        super().save(*args, **kwargs)
