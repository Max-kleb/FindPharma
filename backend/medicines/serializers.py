from rest_framework import serializers
from .models import Medicine
from pharmacies.serializers import PharmacyWithStockSerializer 


class MedicineSerializer(serializers.ModelSerializer):
    """Serializer de base pour les médicaments"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Medicine
        fields = [
            'id', 'name', 'description', 'dosage', 'form', 
            'average_price', 'requires_prescription',
            'category', 'category_display',
            'indications', 'contraindications', 'posology', 'side_effects',
            'image_url', 'wikipedia_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_display']
    
    def validate_name(self, value):
        """Validation du nom du médicament"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères")
        return value.strip()
    
    def validate_dosage(self, value):
        """Validation du dosage"""
        if not value or len(value.strip()) < 1:
            raise serializers.ValidationError("Le dosage est requis")
        return value.strip()
    
    def validate_form(self, value):
        """Validation de la forme"""
        valid_forms = ['comprimé', 'gélule', 'sirop', 'injection', 'crème', 'pommade', 'autre']
        if value and value.lower() not in valid_forms:
            raise serializers.ValidationError(
                f"Forme invalide. Choisissez parmi: {', '.join(valid_forms)}"
            )
        return value.lower() if value else 'autre'
    
    def validate_average_price(self, value):
        """Validation du prix"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif")
        return value



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