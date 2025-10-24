from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from math import radians, cos, sin, asin, sqrt
from .models import Pharmacy
from .serializers import PharmacySerializer


def haversine(lon1, lat1, lon2, lat2):
    """
    Calcule la distance entre deux points GPS en kilomètres
    """
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km


class PharmacyViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les pharmacies.
    
    list: Liste toutes les pharmacies actives
    retrieve: Détails d'une pharmacie
    create: Créer une nouvelle pharmacie
    update: Mettre à jour une pharmacie
    partial_update: Mettre à jour partiellement une pharmacie
    destroy: Supprimer une pharmacie
    nearby: Rechercher des pharmacies à proximité
    """
    queryset = Pharmacy.objects.filter(is_active=True)
    serializer_class = PharmacySerializer
    
    @extend_schema(
        summary="Rechercher des pharmacies à proximité",
        description="Retourne une liste de pharmacies dans un rayon donné autour d'une position GPS. "
                    "Les résultats sont triés par distance croissante.",
        parameters=[
            OpenApiParameter(
                name='latitude',
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=True,
                description='Latitude de la position de recherche (ex: 3.8480 pour Yaoundé)'
            ),
            OpenApiParameter(
                name='longitude',
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=True,
                description='Longitude de la position de recherche (ex: 11.5021 pour Yaoundé)'
            ),
            OpenApiParameter(
                name='radius',
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Rayon de recherche en kilomètres (défaut: 5 km)',
                default=5
            ),
        ],
        responses={
            200: PharmacySerializer(many=True),
            400: OpenApiTypes.OBJECT,
        }
    )
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Retourne les pharmacies proches d'une position donnée
        """
        try:
            user_lat = float(request.query_params.get('latitude'))
            user_lon = float(request.query_params.get('longitude'))
            radius = float(request.query_params.get('radius', 5))
        except (TypeError, ValueError):
            return Response(
                {'error': 'Latitude et longitude sont requis et doivent être des nombres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer toutes les pharmacies actives
        pharmacies = Pharmacy.objects.filter(is_active=True)
        
        # Calculer les distances et filtrer
        nearby_pharmacies = []
        for pharmacy in pharmacies:
            distance = haversine(user_lon, user_lat, pharmacy.longitude, pharmacy.latitude)
            if distance <= radius:
                pharmacy.distance = round(distance, 2)
                nearby_pharmacies.append(pharmacy)
        
        # Trier par distance
        nearby_pharmacies.sort(key=lambda x: x.distance)
        
        serializer = self.get_serializer(nearby_pharmacies, many=True)
        return Response({
            'count': len(nearby_pharmacies),
            'user_location': {
                'latitude': user_lat,
                'longitude': user_lon
            },
            'radius_km': radius,
            'results': serializer.data
        })
