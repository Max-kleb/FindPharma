# backend/reservations/admin.py
"""
Configuration admin pour les réservations (User Story 6)
"""
from django.contrib import admin
from .models import Reservation, ReservationItem


class ReservationItemInline(admin.TabularInline):
    """Inline pour afficher les articles dans une réservation"""
    model = ReservationItem
    extra = 0
    readonly_fields = ['subtotal', 'stock_decremented']
    raw_id_fields = ['medicine', 'stock']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    """Admin pour les réservations"""
    
    list_display = [
        'reservation_number', 'user', 'pharmacy', 'status',
        'pickup_date', 'total_items', 'total_price', 'created_at'
    ]
    list_filter = ['status', 'pharmacy', 'created_at', 'pickup_date']
    search_fields = [
        'reservation_number', 'user__username', 'user__email',
        'contact_name', 'contact_phone', 'pharmacy__name'
    ]
    readonly_fields = [
        'reservation_number', 'created_at', 'updated_at',
        'confirmed_at', 'ready_at', 'collected_at', 'cancelled_at',
        'total_items', 'total_price'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    inlines = [ReservationItemInline]
    
    fieldsets = [
        ('Informations principales', {
            'fields': ['reservation_number', 'user', 'pharmacy', 'status']
        }),
        ('Contact', {
            'fields': ['contact_name', 'contact_phone', 'contact_email']
        }),
        ('Récupération', {
            'fields': ['pickup_date', 'expires_at', 'notes']
        }),
        ('Notes pharmacie', {
            'fields': ['pharmacy_notes'],
            'classes': ['collapse']
        }),
        ('Dates de suivi', {
            'fields': [
                'created_at', 'updated_at', 'confirmed_at',
                'ready_at', 'collected_at', 'cancelled_at', 'cancelled_by'
            ],
            'classes': ['collapse']
        }),
        ('Totaux', {
            'fields': ['total_items', 'total_price'],
            'classes': ['collapse']
        }),
    ]
    
    actions = ['confirm_reservations', 'mark_ready', 'cancel_reservations']
    
    @admin.action(description="Confirmer les réservations sélectionnées")
    def confirm_reservations(self, request, queryset):
        count = 0
        for reservation in queryset.filter(status='pending'):
            try:
                reservation.confirm()
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"{count} réservation(s) confirmée(s)")
    
    @admin.action(description="Marquer comme prêtes")
    def mark_ready(self, request, queryset):
        count = 0
        for reservation in queryset.filter(status__in=['pending', 'confirmed']):
            try:
                reservation.mark_ready()
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"{count} réservation(s) marquée(s) comme prête(s)")
    
    @admin.action(description="Annuler les réservations")
    def cancel_reservations(self, request, queryset):
        count = 0
        for reservation in queryset.filter(status__in=['pending', 'confirmed', 'ready']):
            try:
                reservation.cancel(user=request.user, reason="Annulé par admin")
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"{count} réservation(s) annulée(s)")


@admin.register(ReservationItem)
class ReservationItemAdmin(admin.ModelAdmin):
    """Admin pour les articles de réservation"""
    
    list_display = [
        'reservation', 'medicine', 'quantity', 'unit_price',
        'subtotal', 'stock_decremented'
    ]
    list_filter = ['stock_decremented', 'reservation__status']
    search_fields = ['reservation__reservation_number', 'medicine__name']
    readonly_fields = ['subtotal']
    raw_id_fields = ['reservation', 'medicine', 'stock']
