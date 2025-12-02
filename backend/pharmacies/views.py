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
    
    if len(query) < 1:
        return Response({
            'error': 'La recherche doit contenir au moins 1 caractère'
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
    
    # 4. Rechercher les médicaments (recherche floue et flexible)
    # Split query into words for better partial matching
    query_words = query.lower().split()
    
    # Build query for each word
    medicine_query = Q()
    for word in query_words:
        medicine_query |= Q(name__icontains=word) | Q(description__icontains=word)
    
    medicines = Medicine.objects.filter(medicine_query).distinct()
    
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


# ============================================
# ENDPOINTS D'ADMINISTRATION POUR PHARMACIES
# ============================================

@extend_schema(
    summary="Dashboard de la pharmacie",
    description="Retourne les statistiques et informations complètes de la pharmacie connectée",
    responses={200: 'PharmacyDashboardSerializer'}
)
@api_view(['GET'])
def pharmacy_dashboard(request):
    """
    Endpoint pour le dashboard de la pharmacie.
    Nécessite authentification et que l'utilisateur soit lié à une pharmacie.
    """
    # Vérifier que l'utilisateur est authentifié
    if not request.user.is_authenticated:
        return Response(
            {'detail': 'Authentification requise'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Vérifier que l'utilisateur est une pharmacie
    if not hasattr(request.user, 'pharmacy') or not request.user.pharmacy:
        return Response(
            {'detail': 'Cet utilisateur n\'est pas associé à une pharmacie'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pharmacy = request.user.pharmacy
    
    # Calculer les statistiques
    from django.db.models import Count, Sum, Q, F
    from decimal import Decimal
    
    stocks = Stock.objects.filter(pharmacy=pharmacy)
    
    stats = stocks.aggregate(
        total_stocks=Count('id'),
        total_medicines=Count('medicine', distinct=True),
        available_medicines=Count('medicine', filter=Q(is_available=True, quantity__gt=0), distinct=True),
        unavailable_medicines=Count('medicine', filter=Q(is_available=False) | Q(quantity=0), distinct=True),
        total_quantity=Sum('quantity'),
        estimated_value=Sum(F('quantity') * F('price'))
    )
    
    # Préparer les données
    from .serializers import PharmacyDashboardSerializer
    
    pharmacy_data = {
        'id': pharmacy.id,
        'name': pharmacy.name,
        'address': pharmacy.address,
        'phone': pharmacy.phone,
        'email': pharmacy.email,
        'latitude': pharmacy.latitude,
        'longitude': pharmacy.longitude,
        'opening_hours': pharmacy.opening_hours,
        'is_active': pharmacy.is_active,
        'created_at': pharmacy.created_at,
        'updated_at': pharmacy.updated_at,
        'total_stocks': stats['total_stocks'] or 0,
        'total_medicines': stats['total_medicines'] or 0,
        'available_medicines': stats['available_medicines'] or 0,
        'unavailable_medicines': stats['unavailable_medicines'] or 0,
        'total_quantity': stats['total_quantity'] or 0,
        'estimated_value': stats['estimated_value'] or Decimal('0.00')
    }
    
    serializer = PharmacyDashboardSerializer(pharmacy_data)
    return Response(serializer.data)


@extend_schema(
    summary="Profil de la pharmacie",
    description="Retourne ou modifie le profil de la pharmacie connectée",
    responses={200: 'PharmacyUpdateSerializer'}
)
@api_view(['GET', 'PUT', 'PATCH'])
def pharmacy_profile(request):
    """
    GET: Récupère le profil de la pharmacie
    PUT/PATCH: Modifie le profil de la pharmacie
    """
    # Vérifier l'authentification
    if not request.user.is_authenticated:
        return Response(
            {'detail': 'Authentification requise'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not hasattr(request.user, 'pharmacy') or not request.user.pharmacy:
        return Response(
            {'detail': 'Cet utilisateur n\'est pas associé à une pharmacie'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pharmacy = request.user.pharmacy
    
    if request.method == 'GET':
        from .serializers import PharmacySerializer
        serializer = PharmacySerializer(pharmacy)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        from .serializers import PharmacyUpdateSerializer
        serializer = PharmacyUpdateSerializer(
            pharmacy,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Statistiques de stocks par catégorie",
    description="Retourne les statistiques détaillées des stocks groupées par catégorie de médicament",
)
@api_view(['GET'])
def pharmacy_stock_stats(request):
    """
    Statistiques détaillées des stocks de la pharmacie.
    """
    if not request.user.is_authenticated:
        return Response(
            {'detail': 'Authentification requise'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not hasattr(request.user, 'pharmacy') or not request.user.pharmacy:
        return Response(
            {'detail': 'Cet utilisateur n\'est pas associé à une pharmacie'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pharmacy = request.user.pharmacy
    
    # Récupérer tous les stocks avec médicaments
    stocks = Stock.objects.filter(pharmacy=pharmacy).select_related('medicine')
    
    # Statistiques globales
    from django.db.models import Sum, Avg, Count, Q, F
    
    global_stats = stocks.aggregate(
        total_stocks=Count('id'),
        total_quantity=Sum('quantity'),
        avg_price=Avg('price'),
        total_value=Sum(F('quantity') * F('price')),
        available_count=Count('id', filter=Q(is_available=True, quantity__gt=0)),
        out_of_stock_count=Count('id', filter=Q(quantity=0)),
    )
    
    # Stocks à faible quantité (< 10 unités)
    low_stock = stocks.filter(quantity__lt=10, quantity__gt=0).values(
        'medicine__name', 'quantity', 'is_available'
    )
    
    # Top 10 médicaments par quantité
    top_stocks = stocks.filter(quantity__gt=0).order_by('-quantity')[:10].values(
        'medicine__name', 'quantity', 'price'
    )
    
    # Médicaments en rupture de stock
    out_of_stock = stocks.filter(quantity=0).values(
        'medicine__name', 'last_updated'
    )
    
    return Response({
        'global_stats': global_stats,
        'low_stock_items': list(low_stock),
        'top_stocks': list(top_stocks),
        'out_of_stock': list(out_of_stock),
    })


@extend_schema(
    summary="Historique récent des modifications de stocks",
    description="Retourne les dernières modifications de stocks de la pharmacie",
)
@api_view(['GET'])
def pharmacy_stock_history(request):
    """
    Historique des 50 dernières modifications de stocks.
    """
    if not request.user.is_authenticated:
        return Response(
            {'detail': 'Authentification requise'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not hasattr(request.user, 'pharmacy') or not request.user.pharmacy:
        return Response(
            {'detail': 'Cet utilisateur n\'est pas associé à une pharmacie'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pharmacy = request.user.pharmacy
    
    # Récupérer les 50 derniers stocks modifiés
    recent_stocks = Stock.objects.filter(
        pharmacy=pharmacy
    ).select_related('medicine').order_by('-last_updated')[:50]
    
    from stocks.serializers import StockListSerializer
    serializer = StockListSerializer(recent_stocks, many=True)
    
    return Response({
        'count': recent_stocks.count(),
        'results': serializer.data
    })


# ============================================================
# VUES POUR LES AVIS (User Story 7)
# ============================================================

from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import PharmacyReview
from .serializers import (
    PharmacyReviewSerializer,
    PharmacyReviewCreateSerializer,
    PharmacyWithRatingSerializer
)


class PharmacyReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les avis des pharmacies.
    
    Endpoints:
    - GET /api/pharmacies/{pharmacy_id}/reviews/ - Lister les avis d'une pharmacie
    - POST /api/pharmacies/{pharmacy_id}/reviews/ - Créer un avis
    - GET /api/reviews/ - Lister tous les avis (admin)
    - GET /api/reviews/my/ - Mes avis
    - DELETE /api/reviews/{id}/ - Supprimer mon avis
    """
    serializer_class = PharmacyReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filtre les avis selon le contexte"""
        queryset = PharmacyReview.objects.filter(is_approved=True)
        
        # Filtrer par pharmacie si spécifié dans l'URL
        pharmacy_id = self.kwargs.get('pharmacy_id')
        if pharmacy_id:
            queryset = queryset.filter(pharmacy_id=pharmacy_id)
        
        return queryset.select_related('user', 'pharmacy')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PharmacyReviewCreateSerializer
        return PharmacyReviewSerializer
    
    def create(self, request, pharmacy_id=None):
        """Créer un avis pour une pharmacie"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Vous devez être connecté pour laisser un avis'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Ajouter pharmacy_id aux données
        data = request.data.copy()
        if pharmacy_id:
            data['pharmacy'] = pharmacy_id
        
        serializer = PharmacyReviewCreateSerializer(
            data=data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            review = serializer.save()
            return Response(
                PharmacyReviewSerializer(review).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Supprimer un avis (uniquement le propriétaire)"""
        review = self.get_object()
        if review.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Vous ne pouvez supprimer que vos propres avis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        """Récupérer mes avis"""
        reviews = PharmacyReview.objects.filter(user=request.user).select_related('pharmacy')
        serializer = PharmacyReviewSerializer(reviews, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def pharmacy_reviews(request, pharmacy_id):
    """
    GET /api/pharmacies/{pharmacy_id}/reviews/
    Lister les avis d'une pharmacie avec statistiques
    """
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {'error': 'Pharmacie non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    reviews = PharmacyReview.objects.filter(
        pharmacy=pharmacy,
        is_approved=True
    ).select_related('user').order_by('-created_at')
    
    # Calculer les statistiques
    total_reviews = reviews.count()
    if total_reviews > 0:
        average_rating = sum(r.rating for r in reviews) / total_reviews
        rating_distribution = {
            5: reviews.filter(rating=5).count(),
            4: reviews.filter(rating=4).count(),
            3: reviews.filter(rating=3).count(),
            2: reviews.filter(rating=2).count(),
            1: reviews.filter(rating=1).count(),
        }
    else:
        average_rating = None
        rating_distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    
    serializer = PharmacyReviewSerializer(reviews, many=True)
    
    return Response({
        'pharmacy_id': pharmacy_id,
        'pharmacy_name': pharmacy.name,
        'total_reviews': total_reviews,
        'average_rating': round(average_rating, 1) if average_rating else None,
        'rating_distribution': rating_distribution,
        'reviews': serializer.data
    })


@api_view(['POST'])
def create_pharmacy_review(request, pharmacy_id):
    """
    POST /api/pharmacies/{pharmacy_id}/reviews/
    Créer un avis pour une pharmacie
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Vous devez être connecté pour laisser un avis'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        pharmacy = Pharmacy.objects.get(pk=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return Response(
            {'error': 'Pharmacie non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    data = request.data.copy()
    data['pharmacy'] = pharmacy_id
    
    serializer = PharmacyReviewCreateSerializer(
        data=data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        review = serializer.save()
        return Response({
            'message': 'Avis enregistré avec succès',
            'review': PharmacyReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)