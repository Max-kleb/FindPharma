# backend/reservations/serializers.py
"""
Serializers pour les réservations de médicaments (User Story 6)
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Reservation, ReservationItem
from medicines.models import Medicine
from pharmacies.models import Pharmacy
from stocks.models import Stock


class ReservationItemSerializer(serializers.ModelSerializer):
    """Serializer pour les articles de réservation"""
    
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    medicine_id = serializers.IntegerField(write_only=True)
    stock_id = serializers.IntegerField(write_only=True, required=False)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ReservationItem
        fields = [
            'id', 'medicine', 'medicine_id', 'medicine_name',
            'stock', 'stock_id', 'quantity', 'unit_price', 'subtotal'
        ]
        read_only_fields = ['id', 'medicine', 'stock', 'subtotal']


class ReservationCreateItemSerializer(serializers.Serializer):
    """Serializer pour créer un article lors de la création de réservation"""
    
    medicine_id = serializers.IntegerField()
    stock_id = serializers.IntegerField(required=False)
    pharmacy_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class ReservationSerializer(serializers.ModelSerializer):
    """Serializer complet pour les réservations"""
    
    items = ReservationItemSerializer(many=True, read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    pharmacy_address = serializers.CharField(source='pharmacy.address', read_only=True)
    pharmacy_phone = serializers.CharField(source='pharmacy.phone', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_cancellable = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_number', 'status', 'status_display',
            'user', 'user_username',
            'pharmacy', 'pharmacy_name', 'pharmacy_address', 'pharmacy_phone',
            'contact_name', 'contact_phone', 'contact_email',
            'pickup_date', 'notes', 'pharmacy_notes',
            'created_at', 'updated_at', 'confirmed_at', 'ready_at', 
            'collected_at', 'cancelled_at', 'expires_at',
            'items', 'total_items', 'total_price', 'is_cancellable'
        ]
        read_only_fields = [
            'id', 'reservation_number', 'user', 'status',
            'created_at', 'updated_at', 'confirmed_at', 'ready_at',
            'collected_at', 'cancelled_at', 'expires_at'
        ]


class ReservationCreateSerializer(serializers.Serializer):
    """
    Serializer pour la création d'une nouvelle réservation.
    Accepte une liste d'items avec leur stock_id.
    """
    
    pharmacy_id = serializers.IntegerField()
    items = ReservationCreateItemSerializer(many=True)
    contact_name = serializers.CharField(max_length=100)
    contact_phone = serializers.CharField(max_length=20)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    pickup_date = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    
    def validate_pharmacy_id(self, value):
        """Vérifie que la pharmacie existe"""
        try:
            Pharmacy.objects.get(pk=value)
        except Pharmacy.DoesNotExist:
            raise serializers.ValidationError("Pharmacie introuvable")
        return value
    
    def validate_pickup_date(self, value):
        """Vérifie que la date est dans le futur"""
        if value < timezone.now():
            raise serializers.ValidationError(
                "La date de récupération doit être dans le futur"
            )
        return value
    
    def validate_items(self, value):
        """Vérifie que tous les items sont valides"""
        if not value:
            raise serializers.ValidationError(
                "La réservation doit contenir au moins un article"
            )
        
        for item in value:
            # Vérifier que le médicament existe
            try:
                medicine = Medicine.objects.get(pk=item['medicine_id'])
            except Medicine.DoesNotExist:
                raise serializers.ValidationError(
                    f"Médicament avec ID {item['medicine_id']} introuvable"
                )
            
            # Si stock_id fourni, vérifier le stock
            if 'stock_id' in item:
                try:
                    stock = Stock.objects.get(pk=item['stock_id'])
                    if stock.quantity < item['quantity']:
                        raise serializers.ValidationError(
                            f"Stock insuffisant pour {medicine.name}. "
                            f"Disponible: {stock.quantity}, Demandé: {item['quantity']}"
                        )
                except Stock.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Stock avec ID {item['stock_id']} introuvable"
                    )
        
        return value
    
    def create(self, validated_data):
        """Crée la réservation avec ses articles"""
        user = self.context['request'].user
        pharmacy_id = validated_data['pharmacy_id']
        items_data = validated_data['items']
        
        # Créer la réservation
        reservation = Reservation.objects.create(
            user=user,
            pharmacy_id=pharmacy_id,
            contact_name=validated_data['contact_name'],
            contact_phone=validated_data['contact_phone'],
            contact_email=validated_data.get('contact_email', ''),
            pickup_date=validated_data['pickup_date'],
            notes=validated_data.get('notes', '')
        )
        
        # Créer les items et décrémenter les stocks
        for item_data in items_data:
            medicine = Medicine.objects.get(pk=item_data['medicine_id'])
            stock = None
            unit_price = 0
            
            if 'stock_id' in item_data:
                stock = Stock.objects.get(pk=item_data['stock_id'])
                unit_price = stock.price
            
            # Créer l'item
            reservation_item = ReservationItem.objects.create(
                reservation=reservation,
                medicine=medicine,
                stock=stock,
                quantity=item_data['quantity'],
                unit_price=unit_price
            )
            
            # Décrémenter le stock
            reservation_item.decrement_stock()
        
        return reservation


class ReservationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des réservations"""
    
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_cancellable = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'reservation_number', 'status', 'status_display',
            'pharmacy_name', 'pickup_date', 'created_at',
            'total_items', 'total_price', 'is_cancellable'
        ]


class ReservationCancelSerializer(serializers.Serializer):
    """Serializer pour annuler une réservation"""
    
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)


class ReservationStatusUpdateSerializer(serializers.Serializer):
    """Serializer pour mettre à jour le statut d'une réservation (côté pharmacie)"""
    
    status = serializers.ChoiceField(
        choices=['confirmed', 'ready', 'collected', 'cancelled']
    )
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)
