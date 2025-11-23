from rest_framework import serializers
from .models import Pharmacy
from stocks.serializers import StockSerializer

class PharmacySerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()

    class Meta :
        model = Pharmacy
        fields = ["id",'name', 'address','phone','email',
                  'latitude','longitude','opening_hours',
                  'is_active','distance']
        
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

    class Meta:
        model = Pharmacy
        fields = ['id', 'name', 'address', 'phone', 'email',
                  'latitude', 'longitude', 'opening_hours',
                  'distance', 'stock']
        
    def get_distance(self, obj):
        return getattr(obj, 'distance', None)
    
    def get_stock(self, obj):
        """Récupère les infos de stock si disponibles"""
        stock_info = getattr(obj, 'stock_info', None)
        if stock_info:
            return StockSerializer(stock_info).data
        return None