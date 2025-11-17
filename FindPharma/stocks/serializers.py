
from .models import Stock
from rest_framework import serializers

class StockSerializer(serializers.ModelSerializer):
    """Serializer pour Stock"""
    class Meta:
        model = Stock
        fields = ['quantity', 'price', 'is_available', 'last_updated']
