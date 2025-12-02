# backend/reservations/views.py
"""
Vues pour le système de réservation de médicaments (User Story 6)
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Reservation, ReservationItem
from .serializers import (
    ReservationSerializer,
    ReservationListSerializer,
    ReservationCreateSerializer,
    ReservationCancelSerializer,
    ReservationStatusUpdateSerializer
)


class ReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les réservations de médicaments.
    
    Endpoints:
    - GET /api/reservations/ - Liste des réservations de l'utilisateur
    - POST /api/reservations/ - Créer une nouvelle réservation
    - GET /api/reservations/{id}/ - Détails d'une réservation
    - POST /api/reservations/{id}/cancel/ - Annuler une réservation
    - POST /api/reservations/{id}/update_status/ - Mettre à jour le statut (pharmacie)
    - GET /api/reservations/pharmacy/ - Liste des réservations pour une pharmacie
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Retourne les réservations selon le type d'utilisateur:
        - Client: ses propres réservations
        - Pharmacie: réservations de sa pharmacie
        - Admin: toutes les réservations
        """
        user = self.request.user
        
        if user.is_superuser or user.user_type == 'admin':
            return Reservation.objects.all()
        
        if user.user_type == 'pharmacy' and user.pharmacy:
            return Reservation.objects.filter(pharmacy=user.pharmacy)
        
        return Reservation.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'list':
            return ReservationListSerializer
        if self.action == 'create':
            return ReservationCreateSerializer
        if self.action == 'cancel':
            return ReservationCancelSerializer
        if self.action == 'update_status':
            return ReservationStatusUpdateSerializer
        return ReservationSerializer
    
    def list(self, request):
        """
        Liste les réservations de l'utilisateur connecté.
        
        Query params:
        - status: Filtrer par statut (pending, confirmed, ready, collected, cancelled, expired)
        - pharmacy_id: Filtrer par pharmacie (pour les admins)
        """
        queryset = self.get_queryset()
        
        # Filtrer par statut
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrer par pharmacie (pour admins)
        pharmacy_id = request.query_params.get('pharmacy_id')
        if pharmacy_id and (request.user.is_superuser or request.user.user_type == 'admin'):
            queryset = queryset.filter(pharmacy_id=pharmacy_id)
        
        # Vérifier les expirations
        for reservation in queryset.filter(status__in=['pending', 'confirmed', 'ready']):
            reservation.check_and_update_expiration()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Récupère les détails d'une réservation"""
        try:
            reservation = self.get_queryset().get(pk=pk)
            reservation.check_and_update_expiration()
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Réservation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        """
        Crée une nouvelle réservation.
        
        Body:
        {
            "pharmacy_id": 1,
            "items": [
                {"medicine_id": 1, "stock_id": 5, "quantity": 2}
            ],
            "contact_name": "Jean Dupont",
            "contact_phone": "+237 6XX XXX XXX",
            "contact_email": "jean@email.com",
            "pickup_date": "2025-12-02T10:00:00Z",
            "notes": "Instructions spéciales"
        }
        """
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            reservation = serializer.save()
            return Response(
                ReservationSerializer(reservation).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Annule une réservation et restaure les stocks.
        
        Body (optionnel):
        {
            "reason": "Raison de l'annulation"
        }
        """
        try:
            reservation = self.get_queryset().get(pk=pk)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Réservation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not reservation.is_cancellable:
            return Response(
                {'error': 'Cette réservation ne peut plus être annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReservationCancelSerializer(data=request.data)
        reason = None
        if serializer.is_valid():
            reason = serializer.validated_data.get('reason')
        
        try:
            reservation.cancel(user=request.user, reason=reason)
            return Response({
                'message': 'Réservation annulée avec succès',
                'reservation': ReservationSerializer(reservation).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Met à jour le statut d'une réservation (côté pharmacie).
        
        Body:
        {
            "status": "confirmed" | "ready" | "collected" | "cancelled",
            "notes": "Note optionnelle"
        }
        """
        try:
            reservation = self.get_queryset().get(pk=pk)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Réservation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier les permissions (pharmacie ou admin)
        user = request.user
        if not (user.is_superuser or user.user_type == 'admin'):
            if user.user_type != 'pharmacy' or user.pharmacy != reservation.pharmacy:
                return Response(
                    {'error': 'Vous n\'avez pas la permission de modifier cette réservation'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ReservationStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes')
        
        try:
            if new_status == 'confirmed':
                reservation.confirm(user=request.user)
            elif new_status == 'ready':
                reservation.mark_ready()
            elif new_status == 'collected':
                reservation.mark_collected()
            elif new_status == 'cancelled':
                reservation.cancel(user=request.user, reason=notes)
            
            if notes and new_status != 'cancelled':
                reservation.pharmacy_notes = notes
                reservation.save()
            
            return Response({
                'message': f'Réservation mise à jour: {reservation.get_status_display()}',
                'reservation': ReservationSerializer(reservation).data
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def pharmacy(self, request):
        """
        Liste toutes les réservations pour la pharmacie de l'utilisateur connecté.
        Utilisé par les pharmaciens pour voir les réservations de leur pharmacie.
        
        Query params:
        - status: Filtrer par statut
        - date: Filtrer par date de récupération (YYYY-MM-DD)
        """
        user = request.user
        
        if not (user.user_type == 'pharmacy' and user.pharmacy):
            return Response(
                {'error': 'Vous devez être connecté en tant que pharmacie'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = Reservation.objects.filter(pharmacy=user.pharmacy)
        
        # Filtrer par statut
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrer par date
        date_filter = request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(pickup_date__date=date_filter)
        
        # Vérifier les expirations
        for reservation in queryset.filter(status__in=['pending', 'confirmed', 'ready']):
            reservation.check_and_update_expiration()
        
        serializer = ReservationListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Retourne des statistiques sur les réservations.
        Pour les pharmacies: stats de leur pharmacie
        Pour les admins: stats globales
        """
        user = request.user
        
        if user.user_type == 'pharmacy' and user.pharmacy:
            queryset = Reservation.objects.filter(pharmacy=user.pharmacy)
        elif user.is_superuser or user.user_type == 'admin':
            queryset = Reservation.objects.all()
        else:
            queryset = Reservation.objects.filter(user=user)
        
        today = timezone.now().date()
        
        return Response({
            'total': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'confirmed': queryset.filter(status='confirmed').count(),
            'ready': queryset.filter(status='ready').count(),
            'collected': queryset.filter(status='collected').count(),
            'cancelled': queryset.filter(status='cancelled').count(),
            'expired': queryset.filter(status='expired').count(),
            'today': queryset.filter(pickup_date__date=today).count(),
            'active': queryset.filter(status__in=['pending', 'confirmed', 'ready']).count()
        })
