from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    """Inline pour afficher les articles dans l'admin du panier"""
    model = CartItem
    extra = 0
    readonly_fields = ['subtotal', 'added_at', 'updated_at']
    fields = ['medicine', 'pharmacy', 'quantity', 'unit_price', 'subtotal', 'added_at']
    
    def subtotal(self, obj):
        """Affiche le sous-total calculé"""
        return f"{obj.subtotal} €"
    subtotal.short_description = 'Sous-total'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Administration des paniers"""
    list_display = ['id', 'user', 'status', 'total_items', 'total_price', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'total_items', 'total_price']
    date_hierarchy = 'created_at'
    inlines = [CartItemInline]
    
    fieldsets = (
        ('Informations du panier', {
            'fields': ('user', 'status')
        }),
        ('Statistiques', {
            'fields': ('total_items', 'total_price'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_items(self, obj):
        """Affiche le nombre total d'articles"""
        return obj.total_items
    total_items.short_description = 'Nombre d\'articles'
    
    def total_price(self, obj):
        """Affiche le prix total"""
        return f"{obj.total_price} €"
    total_price.short_description = 'Prix total'
    
    actions = ['mark_as_completed', 'mark_as_abandoned', 'clear_carts']
    
    def mark_as_completed(self, request, queryset):
        """Marque les paniers sélectionnés comme complétés"""
        updated = queryset.update(status='completed')
        self.message_user(request, f"{updated} panier(s) marqué(s) comme complété(s)")
    mark_as_completed.short_description = "Marquer comme complété"
    
    def mark_as_abandoned(self, request, queryset):
        """Marque les paniers sélectionnés comme abandonnés"""
        updated = queryset.update(status='abandoned')
        self.message_user(request, f"{updated} panier(s) marqué(s) comme abandonné(s)")
    mark_as_abandoned.short_description = "Marquer comme abandonné"
    
    def clear_carts(self, request, queryset):
        """Vide les paniers sélectionnés"""
        count = 0
        for cart in queryset:
            items_deleted = cart.items.count()
            cart.clear()
            count += items_deleted
        self.message_user(request, f"{count} article(s) supprimé(s)")
    clear_carts.short_description = "Vider les paniers"


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Administration des articles du panier"""
    list_display = ['id', 'cart_user', 'medicine', 'pharmacy', 'quantity', 'unit_price', 'subtotal', 'added_at']
    list_filter = ['added_at', 'pharmacy', 'cart__status']
    search_fields = ['medicine__name', 'pharmacy__name', 'cart__user__username']
    readonly_fields = ['subtotal', 'added_at', 'updated_at']
    date_hierarchy = 'added_at'
    
    fieldsets = (
        ('Article', {
            'fields': ('cart', 'medicine', 'pharmacy', 'stock')
        }),
        ('Prix et quantité', {
            'fields': ('quantity', 'unit_price', 'subtotal')
        }),
        ('Dates', {
            'fields': ('added_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cart_user(self, obj):
        """Affiche l'utilisateur du panier"""
        return obj.cart.user.username
    cart_user.short_description = 'Utilisateur'
    cart_user.admin_order_field = 'cart__user__username'
    
    def subtotal(self, obj):
        """Affiche le sous-total"""
        return f"{obj.subtotal} €"
    subtotal.short_description = 'Sous-total'
