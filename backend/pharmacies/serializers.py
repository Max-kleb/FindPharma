from rest_framework import serializers
from .models import Pharmacy, PharmacyReview
from stocks.serializers import StockSerializer

class PharmacySerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    # ⭐ US 7 : Champs pour les avis
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta :
        model = Pharmacy
        fields = ["id",'name', 'address','phone','email',
                  'latitude','longitude','opening_hours',
                  'is_active','distance', 'average_rating', 'reviews_count']
        
        read_only_fields = ['id','created_at','updated_at']

    def get_distance(self, obj):
        #la distance sera calculée dans la vue
        return getattr(obj,'distance',None)


class PharmacyUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour que les pharmacies modifient leur profil"""
    
    class Meta:
        model = Pharmacy
        fields = ['name', 'address', 'phone', 'email', 'opening_hours', 'is_active']
    
    def validate_phone(self, value):
        """Validation du numéro de téléphone"""
        if value and len(value) < 9:
            raise serializers.ValidationError("Le numéro de téléphone doit contenir au moins 9 chiffres")
        return value


class PharmacyDashboardSerializer(serializers.ModelSerializer):
    """Serializer pour le dashboard de la pharmacie avec statistiques"""
    total_stocks = serializers.IntegerField(read_only=True)
    total_medicines = serializers.IntegerField(read_only=True)
    available_medicines = serializers.IntegerField(read_only=True)
    unavailable_medicines = serializers.IntegerField(read_only=True)
    total_quantity = serializers.IntegerField(read_only=True)
    estimated_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Pharmacy
        fields = [
            'id', 'name', 'address', 'phone', 'email',
            'latitude', 'longitude', 'opening_hours', 'is_active',
            'created_at', 'updated_at',
            'total_stocks', 'total_medicines', 'available_medicines',
            'unavailable_medicines', 'total_quantity', 'estimated_value'
        ]
    


class PharmacyWithStockSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()
    # ⭐ US 7 : Champs pour les avis
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pharmacy
        fields = ['id', 'name', 'address', 'phone', 'email',
                  'latitude', 'longitude', 'opening_hours',
                  'distance', 'stock', 'average_rating', 'reviews_count']
        
    def get_distance(self, obj):
        return getattr(obj, 'distance', None)
    
    def get_stock(self, obj):
        """Récupère les infos de stock si disponibles"""
        stock_info = getattr(obj, 'stock_info', None)
        if stock_info:
            return StockSerializer(stock_info).data
        return None


# ============================================================
# SERIALIZERS POUR LES AVIS (User Story 7)
# ============================================================

class PharmacyReviewSerializer(serializers.ModelSerializer):
    """Serializer pour les avis des pharmacies"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = PharmacyReview
        fields = [
            'id', 'pharmacy', 'pharmacy_name',
            'user', 'user_id', 'user_username',
            'rating', 'comment',
            'created_at', 'updated_at',
            'is_approved'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'is_approved']
    
    def validate_rating(self, value):
        """Vérifie que la note est entre 1 et 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5")
        return value


class PharmacyReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un avis"""
    
    class Meta:
        model = PharmacyReview
        fields = ['pharmacy', 'rating', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        pharmacy = validated_data['pharmacy']
        
        # Vérifier si l'utilisateur a déjà noté cette pharmacie
        existing = PharmacyReview.objects.filter(user=user, pharmacy=pharmacy).first()
        if existing:
            # Mettre à jour l'avis existant
            existing.rating = validated_data['rating']
            existing.comment = validated_data.get('comment', '')
            existing.save()
            return existing
        
        # Créer un nouvel avis
        return PharmacyReview.objects.create(
            user=user,
            **validated_data
        )


class PharmacyWithRatingSerializer(serializers.ModelSerializer):
    """Serializer pour les pharmacies avec leur note moyenne"""
    distance = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Pharmacy
        fields = [
            'id', 'name', 'address', 'phone', 'email',
            'latitude', 'longitude', 'opening_hours',
            'is_active', 'distance',
            'average_rating', 'reviews_count'
        ]
    
    def get_distance(self, obj):
        return getattr(obj, 'distance', None)