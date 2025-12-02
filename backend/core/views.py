from django.http import JsonResponse
from django.shortcuts import redirect
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response


def home_view(request):
    """
    Page d'accueil de l'API FindPharma
    Redirige vers la documentation Swagger
    """
    return JsonResponse({
        'message': 'Bienvenue sur l\'API FindPharma',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/docs/',
            'api_redoc': '/api/redoc/',
            'api_schema': '/api/schema/',
            'pharmacies': '/api/pharmacies/',
            'search': '/api/search/',
            'nearby': '/api/nearby/',
        },
        'documentation': 'Accédez à /api/docs/ pour la documentation interactive',
    })


def redirect_to_docs(request):
    """Redirige la racine vers la documentation Swagger"""
    return redirect('/api/docs/')


# ============================================================
# USER STORY 8 : DASHBOARD ADMIN - STATISTIQUES
# ============================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    GET /api/admin/stats/
    Retourne les statistiques globales de la plateforme pour le dashboard admin.
    Nécessite un utilisateur admin (is_staff=True).
    """
    from users.models import User, SearchHistory
    from pharmacies.models import Pharmacy, PharmacyReview
    from medicines.models import Medicine
    from stocks.models import Stock
    from reservations.models import Reservation
    
    now = timezone.now()
    today = now.date()
    last_7_days = today - timedelta(days=7)
    last_30_days = today - timedelta(days=30)
    
    # === STATISTIQUES GLOBALES ===
    total_users = User.objects.filter(is_active=True).count()
    total_pharmacies = Pharmacy.objects.filter(is_active=True).count()
    total_medicines = Medicine.objects.count()
    total_stocks = Stock.objects.filter(is_available=True).count()
    total_reservations = Reservation.objects.count()
    total_reviews = PharmacyReview.objects.count()
    
    # === UTILISATEURS PAR TYPE ===
    users_by_type = User.objects.filter(is_active=True).values('user_type').annotate(
        count=Count('id')
    )
    users_by_type_dict = {item['user_type']: item['count'] for item in users_by_type}
    
    # === NOUVEAUX UTILISATEURS (7 derniers jours) ===
    new_users_7d = User.objects.filter(
        date_joined__date__gte=last_7_days
    ).count()
    
    # === RÉSERVATIONS PAR STATUT ===
    reservations_by_status = Reservation.objects.values('status').annotate(
        count=Count('id')
    )
    reservations_by_status_dict = {item['status']: item['count'] for item in reservations_by_status}
    
    # === RÉSERVATIONS DES 7 DERNIERS JOURS ===
    reservations_7d = Reservation.objects.filter(
        created_at__date__gte=last_7_days
    ).count()
    
    # === AVIS DES 7 DERNIERS JOURS ===
    reviews_7d = PharmacyReview.objects.filter(
        created_at__date__gte=last_7_days
    ).count()
    
    # === NOTE MOYENNE GLOBALE ===
    avg_rating = PharmacyReview.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    
    # === TOP 5 PHARMACIES (par nombre d'avis) ===
    top_pharmacies = Pharmacy.objects.filter(is_active=True).annotate(
        review_count=Count('reviews'),
        avg_rating=Avg('reviews__rating')
    ).order_by('-review_count')[:5]
    
    top_pharmacies_data = [
        {
            'id': p.id,
            'name': p.name,
            'review_count': p.review_count,
            'avg_rating': round(p.avg_rating, 1) if p.avg_rating else None
        }
        for p in top_pharmacies
    ]
    
    # === RECHERCHES PAR JOUR (7 derniers jours) ===
    searches_by_day = SearchHistory.objects.filter(
        created_at__date__gte=last_7_days
    ).annotate(
        day=TruncDate('created_at')
    ).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    searches_chart_data = [
        {'date': item['day'].strftime('%Y-%m-%d'), 'count': item['count']}
        for item in searches_by_day
    ]
    
    # === RÉSERVATIONS PAR JOUR (7 derniers jours) ===
    reservations_by_day = Reservation.objects.filter(
        created_at__date__gte=last_7_days
    ).annotate(
        day=TruncDate('created_at')
    ).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    reservations_chart_data = [
        {'date': item['day'].strftime('%Y-%m-%d'), 'count': item['count']}
        for item in reservations_by_day
    ]
    
    # === TOP MÉDICAMENTS RECHERCHÉS ===
    top_medicines_searched = SearchHistory.objects.filter(
        search_type='medicine'
    ).values('query').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    top_medicines_data = [
        {'query': item['query'], 'count': item['count']}
        for item in top_medicines_searched
    ]
    
    # === RÉPARTITION DES NOTES ===
    ratings_distribution = PharmacyReview.objects.values('rating').annotate(
        count=Count('id')
    ).order_by('rating')
    
    ratings_dist_data = {str(i): 0 for i in range(1, 6)}
    for item in ratings_distribution:
        ratings_dist_data[str(item['rating'])] = item['count']
    
    return Response({
        'generated_at': now.isoformat(),
        
        # KPIs principaux
        'kpis': {
            'total_users': total_users,
            'total_pharmacies': total_pharmacies,
            'total_medicines': total_medicines,
            'total_stocks': total_stocks,
            'total_reservations': total_reservations,
            'total_reviews': total_reviews,
            'avg_rating': round(avg_rating, 2),
        },
        
        # Statistiques récentes
        'recent': {
            'new_users_7d': new_users_7d,
            'reservations_7d': reservations_7d,
            'reviews_7d': reviews_7d,
        },
        
        # Répartitions
        'users_by_type': users_by_type_dict,
        'reservations_by_status': reservations_by_status_dict,
        'ratings_distribution': ratings_dist_data,
        
        # Données pour graphiques
        'charts': {
            'searches_by_day': searches_chart_data,
            'reservations_by_day': reservations_chart_data,
            'top_medicines_searched': top_medicines_data,
            'top_pharmacies': top_pharmacies_data,
        }
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_recent_activity(request):
    """
    GET /api/admin/activity/
    Retourne l'activité récente (dernières réservations, avis, inscriptions).
    """
    from users.models import User
    from pharmacies.models import Pharmacy, PharmacyReview
    from reservations.models import Reservation
    
    # Dernières réservations
    recent_reservations = Reservation.objects.select_related(
        'user', 'pharmacy'
    ).prefetch_related('items__medicine').order_by('-created_at')[:10]
    
    reservations_data = []
    for r in recent_reservations:
        # Récupérer les médicaments de la réservation
        medicines = [item.medicine.name for item in r.items.all() if item.medicine]
        medicines_str = ', '.join(medicines[:3])
        if len(medicines) > 3:
            medicines_str += f' (+{len(medicines) - 3})'
        
        reservations_data.append({
            'id': r.id,
            'reservation_number': r.reservation_number,
            'user': r.user.username if r.user else 'Inconnu',
            'pharmacy': r.pharmacy.name if r.pharmacy else 'Inconnue',
            'medicines': medicines_str or 'Aucun',
            'status': r.status,
            'created_at': r.created_at.isoformat(),
        })
    
    # Derniers avis
    recent_reviews = PharmacyReview.objects.select_related(
        'user', 'pharmacy'
    ).order_by('-created_at')[:10]
    
    reviews_data = []
    for r in recent_reviews:
        comment = r.comment or ''
        reviews_data.append({
            'id': r.id,
            'user': r.user.username if r.user else 'Inconnu',
            'pharmacy': r.pharmacy.name if r.pharmacy else 'Inconnue',
            'rating': r.rating,
            'comment': comment[:100] + '...' if len(comment) > 100 else comment,
            'created_at': r.created_at.isoformat(),
        })
    
    # Dernières inscriptions
    recent_users = User.objects.order_by('-date_joined')[:10]
    
    users_data = [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'user_type': u.user_type,
            'date_joined': u.date_joined.isoformat(),
        }
        for u in recent_users
    ]
    
    # Dernières pharmacies ajoutées
    recent_pharmacies = Pharmacy.objects.filter(is_active=True).order_by('-created_at')[:10]
    
    pharmacies_data = [
        {
            'id': p.id,
            'name': p.name,
            'address': p.address or '',
            'created_at': p.created_at.isoformat() if hasattr(p, 'created_at') and p.created_at else '',
        }
        for p in recent_pharmacies
    ]
    
    return Response({
        'recent_reservations': reservations_data,
        'recent_reviews': reviews_data,
        'recent_users': users_data,
        'recent_pharmacies': pharmacies_data,
    })

