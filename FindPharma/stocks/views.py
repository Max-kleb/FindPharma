from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from .models import Stock
from .serializers import StockSerializer, StockCreateUpdateSerializer, StockListSerializer
from .permissions import IsPharmacyOwner, IsPharmacyOwnerOrReadOnly
from pharmacies.models import Pharmacy


class PharmacyStockViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les stocks d'une pharmacie.
    
    Permet aux pharmacies de :
    - Lister leurs stocks
    - Ajouter un nouveau médicament à leur stock
    - Modifier la quantité/prix d'un stock existant
    - Supprimer un stock
    """
    serializer_class = StockListSerializer
    permission_classes = [IsPharmacyOwnerOrReadOnly]
    
    def get_queryset(self):
        """
        Retourne les stocks de la pharmacie spécifiée dans l'URL
        """
        pharmacy_id = self.kwargs.get('pharmacy_pk')
        return Stock.objects.filter(pharmacy_id=pharmacy_id).select_related('medicine', 'pharmacy')
    
    def get_serializer_class(self):
        """Utilise différents serializers selon l'action"""
        if self.action in ['create', 'update', 'partial_update']:
            return StockCreateUpdateSerializer
        return StockListSerializer
    
    @extend_schema(
        summary="Liste des stocks d'une pharmacie",
        description="Retourne la liste de tous les médicaments en stock dans une pharmacie donnée",
        responses={200: StockListSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """Liste tous les stocks de la pharmacie"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Détails d'un stock",
        description="Retourne les détails d'un stock spécifique",
        responses={200: StockListSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        """Récupère les détails d'un stock"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Ajouter un médicament au stock",
        description="Permet à une pharmacie d'ajouter un nouveau médicament à son stock",
        request=StockCreateUpdateSerializer,
        responses={201: StockListSerializer}
    )
    def create(self, request, *args, **kwargs):
        """Crée un nouveau stock pour la pharmacie"""
        pharmacy_id = self.kwargs.get('pharmacy_pk')
        pharmacy = get_object_or_404(Pharmacy, id=pharmacy_id)
        
        # Vérifier les permissions
        if not request.user.is_superuser:
            if not hasattr(request.user, 'pharmacy') or request.user.pharmacy_id != pharmacy_id:
                return Response(
                    {'detail': 'Vous n\'avez pas la permission de modifier cette pharmacie'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Vérifier si le stock existe déjà
        medicine_id = serializer.validated_data['medicine'].id
        existing_stock = Stock.objects.filter(
            pharmacy_id=pharmacy_id,
            medicine_id=medicine_id
        ).first()
        
        if existing_stock:
            return Response(
                {
                    'detail': 'Ce médicament existe déjà dans votre stock. Utilisez PUT pour le modifier.',
                    'stock_id': existing_stock.id
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le stock
        stock = serializer.save(pharmacy=pharmacy)
        
        # Retourner avec le serializer de liste
        return Response(
            StockListSerializer(stock).data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        summary="Modifier un stock",
        description="Permet à une pharmacie de modifier un stock existant (quantité, prix, disponibilité)",
        request=StockCreateUpdateSerializer,
        responses={200: StockListSerializer}
    )
    def update(self, request, *args, **kwargs):
        """Met à jour un stock existant"""
        pharmacy_id = self.kwargs.get('pharmacy_pk')
        
        # Vérifier les permissions
        if not request.user.is_superuser:
            if not hasattr(request.user, 'pharmacy') or request.user.pharmacy_id != pharmacy_id:
                return Response(
                    {'detail': 'Vous n\'avez pas la permission de modifier cette pharmacie'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(StockListSerializer(instance).data)
    
    @extend_schema(
        summary="Modifier partiellement un stock",
        description="Permet de modifier uniquement certains champs d'un stock",
        request=StockCreateUpdateSerializer,
        responses={200: StockListSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        """Met à jour partiellement un stock"""
        pharmacy_id = self.kwargs.get('pharmacy_pk')
        
        # Vérifier les permissions
        if not request.user.is_superuser:
            if not hasattr(request.user, 'pharmacy') or request.user.pharmacy_id != pharmacy_id:
                return Response(
                    {'detail': 'Vous n\'avez pas la permission de modifier cette pharmacie'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(StockListSerializer(instance).data)
    
    @extend_schema(
        summary="Supprimer un stock",
        description="Permet à une pharmacie de supprimer un médicament de son stock",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        """Supprime un stock"""
        pharmacy_id = self.kwargs.get('pharmacy_pk')
        
        # Vérifier les permissions
        if not request.user.is_superuser:
            if not hasattr(request.user, 'pharmacy') or request.user.pharmacy_id != pharmacy_id:
                return Response(
                    {'detail': 'Vous n\'avez pas la permission de modifier cette pharmacie'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(
        summary="Marquer un stock comme indisponible",
        description="Permet de marquer rapidement un médicament comme indisponible sans le supprimer",
        responses={200: StockListSerializer}
    )
    @action(detail=True, methods=['post'])
    def mark_unavailable(self, request, pharmacy_pk=None, pk=None):
        """Marque un stock comme indisponible"""
        stock = self.get_object()
        
        # Vérifier les permissions
        if not request.user.is_superuser:
            if not hasattr(request.user, 'pharmacy') or request.user.pharmacy_id != int(pharmacy_pk):
                return Response(
                    {'detail': 'Vous n\'avez pas la permission de modifier cette pharmacie'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        stock.is_available = False
        stock.save()
        
        return Response(StockListSerializer(stock).data)
    
    @extend_schema(
        summary="Marquer un stock comme disponible",
        description="Permet de marquer rapidement un médicament comme disponible",
        responses={200: StockListSerializer}
    )
    @action(detail=True, methods=['post'])
    def mark_available(self, request, pharmacy_pk=None, pk=None):
        """Marque un stock comme disponible"""
        stock = self.get_object()
        
        # Vérifier les permissions
        if not request.user.is_superuser:
            if not hasattr(request.user, 'pharmacy') or request.user.pharmacy_id != int(pharmacy_pk):
                return Response(
                    {'detail': 'Vous n\'avez pas la permission de modifier cette pharmacie'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        stock.is_available = True
        stock.save()
        
        return Response(StockListSerializer(stock).data)
