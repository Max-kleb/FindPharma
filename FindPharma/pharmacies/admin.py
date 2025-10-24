from django.contrib import admin
from .models import Pharmacy
from leaflet.admin import LeafletGeoAdmin


@admin.register(Pharmacy)
class PharmacyAdmin(LeafletGeoAdmin):
    list_display = ['name', 'address', 'phone', 'latitude','longitude','is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'address', 'phone', 'email']
    list_editable = ['is_active']
    ordering = ['name']


    # Configuration Leaflet
    settings_overrides = {
        'DEFAULT_CENTER': (3.8480, 11.5021),
        'DEFAULT_ZOOM': 12,
    }

    fieldsets = (
        ('Informations générales', {
            'fields' : ('name', 'phone', 'email', 'is_active')
        }),
        ('Localisation',{
            'fields' : ('address', 'latitude', 'longitude')
        }),
        ('Autres informations',{
            'fields':('opening_hours',),
            'classes' : ('collapse',)
        })
    )