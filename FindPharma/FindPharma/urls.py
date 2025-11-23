from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.authtoken.views import obtain_auth_token
from core.views import home_view

urlpatterns = [
    # Page d'accueil avec informations sur l'API
    path('', home_view, name='home'),
    
    # Admin Django
    path('admin/', admin.site.urls),
    
    # Authentification (Legacy Token - deprecated)
    path('api/token-auth/', obtain_auth_token, name='api_token_auth'),
    
    # Authentification JWT (nouvelle méthode)
    path('api/auth/', include('users.urls', namespace='users')),
    
    # API endpoints
    path('api/', include('pharmacies.urls')),
    path('api/', include('stocks.urls')),
    
    # Swagger/OpenAPI URLs (Documentation interactive)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]