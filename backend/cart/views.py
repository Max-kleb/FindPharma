from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.shortcuts import get_object_or_404

from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    CartSummarySerializer
)


@extend_schema_view(
    list=extend_schema(
        tags=['Cart'],
        summary="Liste des paniers de l'utilisateur",
        description="Récupère tous les paniers de l'utilisateur connecté"
    ),
    retrieve=extend_schema(
        tags=['Cart'],
        summary="Détails d'un panier",
        description="Récupère les détails complets d'un panier avec tous ses articles"
    ),
    create=extend_schema(
        tags=['Cart'],
        summary="Créer un nouveau panier",
        description="Crée un nouveau panier actif pour l'utilisateur"
    ),
    destroy=extend_schema(
        tags=['Cart'],
        summary="Supprimer un panier",
        description="Supprime définitivement un panier et tous ses articles"
    ),
)
class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les paniers d'achat.
    
    Permet de:
    - Lister les paniers de l'utilisateur
    - Voir les détails d'un panier
    - Ajouter des articles au panier
    - Modifier les quantités
    - Supprimer des articles
    - Vider le panier
    """
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les paniers de l'utilisateur connecté"""
        return Cart.objects.filter(user=self.request.user).prefetch_related(
            'items__medicine',
            'items__pharmacy',
            'items__stock'
        )
    
    def perform_create(self, serializer):
        """Crée un panier pour l'utilisateur connecté"""
        serializer.save(user=self.request.user)
    
    @extend_schema(
        tags=['Cart'],
        summary="Récupérer le panier actif",
        description="Récupère le panier actif de l'utilisateur ou en crée un nouveau s'il n'existe pas",
        responses={200: CartSerializer}
    )
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Récupère ou crée le panier actif de l'utilisateur"""
        cart, created = Cart.objects.get_or_create(
            user=request.user,
            status='active'
        )
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Cart'],
        summary="Ajouter un article au panier",
        description="Ajoute un médicament au panier actif de l'utilisateur",
        request=AddToCartSerializer,
        responses={201: CartItemSerializer}
    )
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Ajoute un article au panier actif"""
        serializer = AddToCartSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        cart_item = serializer.save()
        
        return Response(
            CartItemSerializer(cart_item).data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        tags=['Cart'],
        summary="Vider le panier",
        description="Supprime tous les articles du panier actif",
        responses={204: None}
    )
    @action(detail=True, methods=['post'])
    def clear(self, request, pk=None):
        """Vide tous les articles du panier"""
        cart = self.get_object()
        cart.clear()
        return Response(
            {'message': 'Panier vidé avec succès'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @extend_schema(
        tags=['Cart'],
        summary="Marquer le panier comme complété",
        description="Change le statut du panier à 'completed'",
        responses={200: CartSerializer}
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque le panier comme complété"""
        cart = self.get_object()
        cart.complete()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Cart'],
        summary="Résumé du panier",
        description="Récupère un résumé rapide du panier (nombre d'articles et total)",
        responses={200: CartSummarySerializer}
    )
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Récupère un résumé du panier actif"""
        cart, created = Cart.objects.get_or_create(
            user=request.user,
            status='active'
        )
        serializer = CartSummarySerializer(cart)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        tags=['Cart Items'],
        summary="Liste des articles du panier",
        description="Récupère tous les articles d'un panier spécifique"
    ),
    retrieve=extend_schema(
        tags=['Cart Items'],
        summary="Détails d'un article",
        description="Récupère les détails d'un article spécifique du panier"
    ),
    update=extend_schema(
        tags=['Cart Items'],
        summary="Mettre à jour un article",
        description="Met à jour la quantité d'un article dans le panier"
    ),
    partial_update=extend_schema(
        tags=['Cart Items'],
        summary="Mettre à jour partiellement un article",
        description="Met à jour partiellement un article (généralement la quantité)"
    ),
    destroy=extend_schema(
        tags=['Cart Items'],
        summary="Supprimer un article",
        description="Supprime un article du panier"
    ),
)
class CartItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les articles individuels du panier.
    
    Permet de:
    - Lister les articles d'un panier
    - Modifier la quantité d'un article
    - Supprimer un article du panier
    """
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les articles des paniers de l'utilisateur"""
        return CartItem.objects.filter(
            cart__user=self.request.user
        ).select_related('medicine', 'pharmacy', 'stock')
    
    @extend_schema(
        request=UpdateCartItemSerializer,
        responses={200: CartItemSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        """Met à jour la quantité d'un article"""
        cart_item = self.get_object()
        serializer = UpdateCartItemSerializer(
            data=request.data,
            context={'cart_item': cart_item}
        )
        serializer.is_valid(raise_exception=True)
        updated_item = serializer.update(cart_item, serializer.validated_data)
        
        return Response(
            CartItemSerializer(updated_item).data,
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        """Supprime un article du panier"""
        cart_item = self.get_object()
        cart_item.delete()
        return Response(
            {'message': 'Article supprimé du panier'},
            status=status.HTTP_204_NO_CONTENT
        )
