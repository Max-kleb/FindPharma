from rest_framework import serializers
from .models import Cart, CartItem
from medicines.serializers import MedicineSerializer
from pharmacies.serializers import PharmacySerializer
from stocks.models import Stock
from decimal import Decimal


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les articles du panier"""
    medicine = MedicineSerializer(read_only=True)
    pharmacy = PharmacySerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text="Sous-total calculé (quantity * unit_price)"
    )
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = CartItem
        fields = [
            'id',
            'medicine',
            'medicine_name',
            'pharmacy',
            'pharmacy_name',
            'quantity',
            'unit_price',
            'subtotal',
            'added_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'unit_price', 'subtotal', 'added_at', 'updated_at']


class CartSerializer(serializers.ModelSerializer):
    """Serializer pour afficher le panier complet"""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True, help_text="Nombre total d'articles")
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text="Prix total du panier"
    )
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'user_username',
            'status',
            'items',
            'total_items',
            'total_price',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AddToCartSerializer(serializers.Serializer):
    """Serializer pour ajouter un article au panier"""
    medicine_id = serializers.IntegerField(
        required=True,
        help_text="ID du médicament à ajouter"
    )
    pharmacy_id = serializers.IntegerField(
        required=True,
        help_text="ID de la pharmacie où acheter"
    )
    quantity = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text="Quantité à ajouter (minimum 1)"
    )
    
    def validate(self, data):
        """Validation des données et vérification du stock"""
        medicine_id = data.get('medicine_id')
        pharmacy_id = data.get('pharmacy_id')
        quantity = data.get('quantity')
        
        # Vérifier que le stock existe
        try:
            stock = Stock.objects.get(
                medicine_id=medicine_id,
                pharmacy_id=pharmacy_id
            )
        except Stock.DoesNotExist:
            raise serializers.ValidationError(
                "Ce médicament n'est pas disponible dans cette pharmacie"
            )
        
        # Vérifier la disponibilité
        if not stock.is_available:
            raise serializers.ValidationError(
                f"{stock.medicine.name} n'est pas disponible à {stock.pharmacy.name}"
            )
        
        # Vérifier le stock suffisant
        if stock.quantity < quantity:
            raise serializers.ValidationError(
                f"Stock insuffisant. Disponible: {stock.quantity}, Demandé: {quantity}"
            )
        
        # Ajouter le stock et le prix au contexte
        data['stock'] = stock
        data['unit_price'] = stock.price
        
        return data
    
    def create(self, validated_data):
        """Crée ou met à jour l'article dans le panier"""
        request = self.context.get('request')
        user = request.user
        
        # Récupérer ou créer un panier actif pour l'utilisateur
        cart, created = Cart.objects.get_or_create(
            user=user,
            status='active'
        )
        
        stock = validated_data.pop('stock')
        medicine_id = validated_data.pop('medicine_id')
        pharmacy_id = validated_data.pop('pharmacy_id')
        quantity = validated_data.pop('quantity')
        unit_price = validated_data.pop('unit_price')
        
        # Vérifier si l'article existe déjà dans le panier
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            medicine_id=medicine_id,
            pharmacy_id=pharmacy_id,
            defaults={
                'stock': stock,
                'quantity': quantity,
                'unit_price': unit_price
            }
        )
        
        # Si l'article existe déjà, augmenter la quantité
        if not created:
            new_quantity = cart_item.quantity + quantity
            
            # Vérifier le stock pour la nouvelle quantité
            if stock.quantity < new_quantity:
                raise serializers.ValidationError(
                    f"Stock insuffisant. Disponible: {stock.quantity}, "
                    f"Vous avez déjà {cart_item.quantity} dans le panier, "
                    f"vous essayez d'ajouter {quantity} de plus"
                )
            
            cart_item.quantity = new_quantity
            cart_item.save()
        
        return cart_item


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer pour mettre à jour la quantité d'un article"""
    quantity = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text="Nouvelle quantité (minimum 1)"
    )
    
    def validate_quantity(self, value):
        """Valide que le stock est suffisant pour la nouvelle quantité"""
        cart_item = self.context.get('cart_item')
        
        if cart_item and cart_item.stock:
            if value > cart_item.stock.quantity:
                raise serializers.ValidationError(
                    f"Stock insuffisant. Disponible: {cart_item.stock.quantity}, "
                    f"Demandé: {value}"
                )
        
        return value
    
    def update(self, instance, validated_data):
        """Met à jour la quantité de l'article"""
        instance.quantity = validated_data['quantity']
        instance.save()
        return instance


class CartSummarySerializer(serializers.ModelSerializer):
    """Serializer simplifié pour afficher un résumé du panier"""
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Cart
        fields = ['id', 'status', 'total_items', 'total_price', 'updated_at']
        read_only_fields = ['id', 'status', 'updated_at']
