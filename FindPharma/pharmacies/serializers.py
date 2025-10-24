from rest_framework import serializers
from .models import Pharmacy

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
    