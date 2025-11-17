from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PharmacyViewSet
from . import views

router = DefaultRouter()
router.register(r'pharmacies', PharmacyViewSet, basename='pharmacy')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views.search_medicine, name= 'search'),
    path('nearby/', views.nearby_pharmacies, name='nearby_pharmacies'),
    path('pharmacy/<int:pharmacy_id>/', views.pharmacy_detail, name='pharmacy_detail'),
]
