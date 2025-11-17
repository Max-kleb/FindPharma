from rest_framework import viewsets, status
from rest_framework.decorators import action , api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from math import radians, cos, sin, asin, sqrt, atan2
from .models import Pharmacy
from .serializers import PharmacySerializer
from django.db.models import Q 

from medicines.models import Medicine
from stocks.models import Stock 
from medicines.serializers import MedicineSearchResultSerializer , MedicineSerializer
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


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calcule la distance entre deux points GPS (formule de Haversine)
    Retourne la distance en kilomètres
    """
    R = 6371  # Rayon de la Terre en km
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return round(distance, 2)


@api_view(['GET'])
def search_medicine(request):
    """
    Recherche de médicaments avec pharmacies disponibles
    
    Paramètres GET:
    - q: terme de recherche (obligatoire)
    - latitude: position de l'utilisateur (optionnel)
    - longitude: position de l'utilisateur (optionnel)
    - max_distance: distance max en km (optionnel, défaut: 50)
    
    Exemple: /api/search/?q=doliprane&latitude=3.848&longitude=11.502
    """
    
    # 1. Récupérer les paramètres
    query = request.GET.get('q', '').strip()
    user_lat = request.GET.get('latitude')
    user_lon = request.GET.get('longitude')
    max_distance = float(request.GET.get('max_distance', 50))
    
    # 2. Validation
    if not query:
        return Response({
            'error': 'Le paramètre "q" (recherche) est obligatoire'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(query) < 2:
        return Response({
            'error': 'La recherche doit contenir au moins 2 caractères'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 3. Convertir les coordonnées
    if user_lat and user_lon:
        try:
            user_lat = float(user_lat)
            user_lon = float(user_lon)
        except ValueError:
            return Response({
                'error': 'Les coordonnées doivent être des nombres valides'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # 4. Rechercher les médicaments (recherche floue)
    medicines = Medicine.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query)
    )
    
    if not medicines.exists():
        return Response({
            'message': f'Aucun médicament trouvé pour "{query}"',
            'results': []
        })
    
    # 5. Pour chaque médicament, trouver les pharmacies avec stock
    results = []
    
    for medicine in medicines:
        # Récupérer les stocks disponibles
        stocks = Stock.objects.filter(
            medicine=medicine,
            is_available=True,
            quantity__gt=0
        ).select_related('pharmacy').filter(
            pharmacy__is_active=True
        )
        
        if not stocks.exists():
            continue
        
        # Préparer les pharmacies avec infos de stock
        pharmacies_with_stock = []
        
        for stock in stocks:
            pharmacy = stock.pharmacy
            
            # Calculer la distance si coordonnées fournies
            if user_lat and user_lon:
                distance = calculate_distance(
                    user_lat, user_lon,
                    pharmacy.latitude, pharmacy.longitude
                )
                
                # Filtrer par distance max
                if distance > max_distance:
                    continue
                
                pharmacy.distance = distance
            
            # Attacher les infos de stock à la pharmacie
            pharmacy.stock_info = stock
            pharmacies_with_stock.append(pharmacy)
        
        # Trier par distance si disponible
        if user_lat and user_lon:
            pharmacies_with_stock.sort(key=lambda p: getattr(p, 'distance', float('inf')))
        
        # Serializer le résultat
        if pharmacies_with_stock:
            serializer = MedicineSearchResultSerializer(
                medicine,
                context={'pharmacies': pharmacies_with_stock}
            )
            results.append(serializer.data)
    
    # 6. Retourner les résultats
    return Response({
        'query': query,
        'count': len(results),
        'results': results
    })


@api_view(['GET'])
def nearby_pharmacies(request):
    """
    Trouver les pharmacies à proximité
    
    Paramètres GET:
    - latitude: position (obligatoire)
    - longitude: position (obligatoire)
    - radius: rayon en km (optionnel, défaut: 10)
    
    Exemple: /api/nearby/?latitude=3.848&longitude=11.502&radius=5
    """
    
    user_lat = request.GET.get('latitude')
    user_lon = request.GET.get('longitude')
    radius = float(request.GET.get('radius', 10))
    
    if not user_lat or not user_lon:
        return Response({
            'error': 'Les paramètres "latitude" et "longitude" sont obligatoires'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_lat = float(user_lat)
        user_lon = float(user_lon)
    except ValueError:
        return Response({
            'error': 'Les coordonnées doivent être des nombres valides'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Récupérer toutes les pharmacies actives
    pharmacies = Pharmacy.objects.filter(is_active=True)
    
    # Calculer la distance pour chaque pharmacie
    pharmacies_with_distance = []
    for pharmacy in pharmacies:
        distance = calculate_distance(
            user_lat, user_lon,
            pharmacy.latitude, pharmacy.longitude
        )
        
        if distance <= radius:
            pharmacy.distance = distance
            pharmacies_with_distance.append(pharmacy)
    
    # Trier par distance
    pharmacies_with_distance.sort(key=lambda p: p.distance)
    
    # Serializer
    from .serializers import PharmacySerializer
    serializer = PharmacySerializer(pharmacies_with_distance, many=True)
    
    return Response({
        'count': len(pharmacies_with_distance),
        'radius_km': radius,
        'pharmacies': serializer.data
    })


@api_view(['GET'])
def pharmacy_detail(request, pharmacy_id):
    """
    Détails d'une pharmacie avec tous ses stocks
    
    Exemple: /api/pharmacy/1/
    """
    try:
        pharmacy = Pharmacy.objects.get(id=pharmacy_id, is_active=True)
    except Pharmacy.DoesNotExist:
        return Response({
            'error': 'Pharmacie non trouvée'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Récupérer tous les stocks
    stocks = Stock.objects.filter(
        pharmacy=pharmacy,
        is_available=True,
        quantity__gt=0
    ).select_related('medicine')
    
    # Préparer les données
    from .serializers import PharmacySerializer, medicineSerializer, StockSerializer
    
    pharmacy_data = PharmacySerializer(pharmacy).data
    
    medicines_list = []
    for stock in stocks:
        medicine_data = MedicineSerializer(stock.medicine).data
        stock_data = StockSerializer(stock).data
        medicine_data['stock'] = stock_data
        medicines_list.append(medicine_data)
    
    pharmacy_data['medicines'] = medicines_list
    pharmacy_data['total_medicines'] = len(medicines_list)
    
    return Response(pharmacy_data)