from rest_framework import serializers
from .models import Medicine
from pharmacies.serializers import PharmacyWithStockSerializer 


#class Medicine(serializers.ModelSerializer):
    
 #   class Meta:
  #      model = Medicine
        
   #     fields = ['id', 'name', 'description', 'dosage', 'form', 
    #              'average_price', 'requires_prescription']


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'description', 'dosage', 'form', 
                  'average_price', 'requires_prescription']



class MedicineSearchResultSerializer(serializers.ModelSerializer):
    pharmacies = serializers.SerializerMethodField()
    total_pharmacies = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()


    class Meta:
        model = Medicine
        fields = ['id', 'name', 'description', 'dosage', 'form',
                  'requires_prescription', 'pharmacies', 'total_pharmacies',
                  'min_price', 'max_price']

    def get_pharmacies(self, obj):
        """Liste des pharmacies avec ce médicament"""
        # Les pharmacies avec distance seront passées dans le context
        pharmacies = self.context.get('pharmacies', [])
        return PharmacyWithStockSerializer(pharmacies, many=True).data

    def get_total_pharmacies(self, obj):
        """Nombre total de pharmacies ayant ce médicament"""
        return len(self.context.get('pharmacies', []))

    def get_min_price(self, obj):
        """Prix minimum parmi toutes les pharmacies"""
        pharmacies = self.context.get('pharmacies', [])
        if not pharmacies:
            return None
        prices = [p.stock_info.price for p in pharmacies if hasattr(p, 'stock_info')]
        return float(min(prices)) if prices else None

    def get_max_price(self, obj):
        """Prix maximum parmi toutes les pharmacies"""
        pharmacies = self.context.get('pharmacies', [])
        if not pharmacies:
            return None
        prices = [p.stock_info.price for p in pharmacies if hasattr(p, 'stock_info')]
        return float(max(prices)) if prices else None