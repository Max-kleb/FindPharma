from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, SearchHistory


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuration de l'admin pour le modèle User personnalisé"""
    
    list_display = ['username', 'email', 'user_type', 'pharmacy', 'is_staff', 'is_active']
    list_filter = ['user_type', 'is_staff', 'is_active', 'is_superuser']
    search_fields = ['username', 'email', 'phone']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations FindPharma', {
            'fields': ('user_type', 'pharmacy', 'phone')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informations FindPharma', {
            'fields': ('user_type', 'pharmacy', 'phone')
        }),
    )


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour l'historique des recherches"""
    
    list_display = ['user', 'query', 'search_type', 'results_count', 'created_at']
    list_filter = ['search_type', 'created_at']
    search_fields = ['user__username', 'user__email', 'query']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        """Empêcher l'ajout manuel d'historiques de recherche"""
        return False
