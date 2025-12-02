from django.contrib import admin
from .models import Pharmacy, PharmacyReview
try:
    from leaflet.admin import LeafletGeoAdmin
except Exception:
    # Fallback to regular ModelAdmin when django-leaflet or GIS
    # dependencies are not available (e.g. during tests)
    LeafletGeoAdmin = admin.ModelAdmin


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


@admin.register(PharmacyReview)
class PharmacyReviewAdmin(admin.ModelAdmin):
    """Admin pour les avis des pharmacies"""
    list_display = ['pharmacy', 'user', 'rating', 'is_approved', 'is_reported', 'created_at']
    list_filter = ['rating', 'is_approved', 'is_reported', 'created_at']
    search_fields = ['pharmacy__name', 'user__username', 'comment']
    list_editable = ['is_approved']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('pharmacy', 'user', 'rating', 'comment')
        }),
        ('Modération', {
            'fields': ('is_approved', 'is_reported')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['approve_reviews', 'reject_reviews']
    
    @admin.action(description="Approuver les avis sélectionnés")
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} avis approuvé(s)")
    
    @admin.action(description="Rejeter les avis sélectionnés")
    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f"{queryset.count()} avis rejeté(s)")