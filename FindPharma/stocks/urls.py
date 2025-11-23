from django.urls import path
from .views import PharmacyStockViewSet

# URLs pour la gestion des stocks par pharmacie
# Pattern: /api/pharmacies/{pharmacy_pk}/stocks/

urlpatterns = [
    # Liste des stocks d'une pharmacie + Création
    path('pharmacies/<int:pharmacy_pk>/stocks/', 
         PharmacyStockViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='pharmacy-stocks-list'),
    
    # Détail/Modification/Suppression d'un stock
    path('pharmacies/<int:pharmacy_pk>/stocks/<int:pk>/', 
         PharmacyStockViewSet.as_view({
             'get': 'retrieve',
             'put': 'update',
             'patch': 'partial_update',
             'delete': 'destroy'
         }), 
         name='pharmacy-stocks-detail'),
    
    # Actions personnalisées
    path('pharmacies/<int:pharmacy_pk>/stocks/<int:pk>/mark_unavailable/', 
         PharmacyStockViewSet.as_view({'post': 'mark_unavailable'}), 
         name='pharmacy-stocks-mark-unavailable'),
    
    path('pharmacies/<int:pharmacy_pk>/stocks/<int:pk>/mark_available/', 
         PharmacyStockViewSet.as_view({'post': 'mark_available'}), 
         name='pharmacy-stocks-mark-available'),
]
