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