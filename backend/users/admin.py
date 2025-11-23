from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


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
