from django.db import models
from django.conf import settings
from medicines.models import Medicine
from pharmacies.models import Pharmacy
from stocks.models import Stock
from django.core.validators import MinValueValidator
from decimal import Decimal


class Cart(models.Model):
    """
    Modèle représentant le panier d'achat d'un utilisateur.
    Un utilisateur ne peut avoir qu'un seul panier actif à la fois.
    """
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('completed', 'Complété'),
        ('abandoned', 'Abandonné'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='carts',
        help_text="Utilisateur propriétaire du panier"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True,
        help_text="Statut du panier"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date de création du panier"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Dernière mise à jour du panier"
    )
    
    class Meta:
        verbose_name = 'Panier'
        verbose_name_plural = 'Paniers'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['-updated_at']),
        ]
    
    def __str__(self):
        return f"Panier de {self.user.username} - {self.get_status_display()}"
    
    @property
    def total_items(self):
        """Nombre total d'articles dans le panier"""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_price(self):
        """Prix total du panier"""
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def is_active(self):
        """Vérifie si le panier est actif"""
        return self.status == 'active'
    
    def clear(self):
        """Vide le panier en supprimant tous les items"""
        self.items.all().delete()
    
    def complete(self):
        """Marque le panier comme complété"""
        self.status = 'completed'
        self.save()
    
    def abandon(self):
        """Marque le panier comme abandonné"""
        self.status = 'abandoned'
        self.save()


class CartItem(models.Model):
    """
    Modèle représentant un article dans le panier.
    Lie un médicament spécifique d'une pharmacie au panier.
    """
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Panier auquel appartient cet article"
    )
    
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name='cart_items',
        help_text="Médicament ajouté au panier"
    )
    
    pharmacy = models.ForeignKey(
        Pharmacy,
        on_delete=models.CASCADE,
        related_name='cart_items',
        help_text="Pharmacie où acheter le médicament"
    )
    
    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='cart_items',
        null=True,
        blank=True,
        help_text="Référence au stock de la pharmacie"
    )
    
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Quantité commandée"
    )
    
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Prix unitaire au moment de l'ajout au panier"
    )
    
    added_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date d'ajout au panier"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Dernière modification"
    )
    
    class Meta:
        verbose_name = 'Article du panier'
        verbose_name_plural = 'Articles du panier'
        ordering = ['-added_at']
        unique_together = ['cart', 'medicine', 'pharmacy']
        indexes = [
            models.Index(fields=['cart', 'medicine']),
            models.Index(fields=['-added_at']),
        ]
    
    def __str__(self):
        return f"{self.quantity}x {self.medicine.name} @ {self.pharmacy.name}"
    
    @property
    def subtotal(self):
        """Calcule le sous-total pour cet article"""
        return self.quantity * self.unit_price
    
    def save(self, *args, **kwargs):
        """
        Surcharge de save pour valider le stock disponible et 
        définir automatiquement le prix unitaire si non fourni
        """
        # Si pas de prix unitaire, prendre le prix du stock
        if not self.unit_price and self.stock:
            self.unit_price = self.stock.price
        
        # Valider que le panier est actif
        if self.cart.status != 'active':
            raise ValueError("Cannot add items to a non-active cart")
        
        # Valider la disponibilité du stock
        if self.stock:
            if not self.stock.is_available:
                raise ValueError(f"{self.medicine.name} n'est pas disponible à {self.pharmacy.name}")
            
            if self.stock.quantity < self.quantity:
                raise ValueError(
                    f"Stock insuffisant pour {self.medicine.name} à {self.pharmacy.name}. "
                    f"Disponible: {self.stock.quantity}, Demandé: {self.quantity}"
                )
        
        super().save(*args, **kwargs)
    
    def update_quantity(self, new_quantity):
        """Met à jour la quantité avec validation du stock"""
        if new_quantity < 1:
            raise ValueError("La quantité doit être au moins 1")
        
        if self.stock and new_quantity > self.stock.quantity:
            raise ValueError(
                f"Stock insuffisant. Disponible: {self.stock.quantity}, "
                f"Demandé: {new_quantity}"
            )
        
        self.quantity = new_quantity
        self.save()
