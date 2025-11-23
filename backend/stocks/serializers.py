from rest_framework import serializers
from .models import Stock
from medicines.models import Medicine
from pharmacies.models import Pharmacy


class StockSerializer(serializers.ModelSerializer):
    """Serializer complet pour les stocks"""
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    medicine_dosage = serializers.CharField(source='medicine.dosage', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = Stock
        fields = [
            'id', 'pharmacy', 'pharmacy_name', 'medicine', 'medicine_name', 
            'medicine_dosage', 'quantity', 'price', 'is_available', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class StockCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier un stock (simplifié)"""
    
    class Meta:
        model = Stock
        fields = ['medicine', 'quantity', 'price', 'is_available']
    
    def validate_quantity(self, value):
        """Validation de la quantité"""
        if value < 0:
            raise serializers.ValidationError("La quantité ne peut pas être négative")
        return value
    
    def validate_price(self, value):
        """Validation du prix"""
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0")
        return value
    
    def validate(self, data):
        """Validation globale"""
        # Si quantity = 0, mettre automatiquement is_available = False
        if data.get('quantity', 0) == 0:
            data['is_available'] = False
        return data


class StockListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les stocks (avec détails médicament)"""
    medicine = serializers.SerializerMethodField()
    
    class Meta:
        model = Stock
        fields = ['id', 'medicine', 'quantity', 'price', 'is_available', 'last_updated']
    
    def get_medicine(self, obj):
        """Retourne les détails du médicament"""
        return {
            'id': obj.medicine.id,
            'name': obj.medicine.name,
            'dosage': obj.medicine.dosage,
            'form': obj.medicine.form,
            'requires_prescription': obj.medicine.requires_prescription,
        }
