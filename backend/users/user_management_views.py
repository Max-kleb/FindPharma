"""
Vues pour la gestion des utilisateurs par l'administrateur
Permet le CRUD complet sur tous les types d'utilisateurs
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import UserSerializer

User = get_user_model()


def check_admin_permission(request):
    """Vérifie si l'utilisateur est un admin"""
    user = request.user
    if not (user.is_superuser or user.user_type == 'admin' or user.is_staff):
        return False
    return True


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    Liste tous les utilisateurs (admin, pharmacies, clients)
    Supporte la recherche et le filtrage par type
    """
    if not check_admin_permission(request):
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user_type = request.query_params.get('type', None)
        search = request.query_params.get('search', '')
        
        users = User.objects.all().order_by('-date_joined')
        
        # Filtrage par type - utiliser 'customer' comme dans le modèle
        if user_type == 'admin':
            users = users.filter(Q(is_staff=True) | Q(is_superuser=True) | Q(user_type='admin'))
        elif user_type == 'pharmacy':
            users = users.filter(user_type='pharmacy')
        elif user_type in ['client', 'customer']:
            users = users.filter(user_type='customer')
        
        # Recherche
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        serializer = UserSerializer(users, many=True)
        return Response({
            'count': users.count(),
            'results': serializer.data
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, user_id):
    """
    Récupère les détails d'un utilisateur spécifique
    """
    if not check_admin_permission(request):
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """
    Crée un nouvel utilisateur
    """
    if not check_admin_permission(request):
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        
        # Vérification des champs obligatoires
        required_fields = ['username', 'email', 'password', 'user_type']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Le champ {field} est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Vérification unicité
        if User.objects.filter(username=data['username']).exists():
            return Response(
                {'error': 'Ce nom d\'utilisateur existe déjà'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'Cet email est déjà utilisé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mapper 'client' vers 'customer' si nécessaire
        user_type = data['user_type']
        if user_type == 'client':
            user_type = 'customer'
        
        # Création de l'utilisateur
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            user_type=user_type,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', '')
        )
        
        # Si c'est un admin
        if data.get('is_admin', False) or user_type == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.user_type = 'admin'
            user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """
    Met à jour un utilisateur existant
    """
    if not check_admin_permission(request):
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        data = request.data
        
        # Mise à jour des champs autorisés
        if 'username' in data and data['username'] != user.username:
            if User.objects.filter(username=data['username']).exists():
                return Response(
                    {'error': 'Ce nom d\'utilisateur existe déjà'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = data['username']
        
        if 'email' in data and data['email'] != user.email:
            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'error': 'Cet email est déjà utilisé'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = data['email']
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        if 'user_type' in data:
            # Mapper 'client' vers 'customer'
            user_type = data['user_type']
            if user_type == 'client':
                user_type = 'customer'
            user.user_type = user_type
        if 'is_admin' in data:
            user.is_staff = data['is_admin']
            user.is_superuser = data['is_admin']
            if data['is_admin']:
                user.user_type = 'admin'
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    Supprime un utilisateur
    """
    if not check_admin_permission(request):
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Empêcher la suppression de son propre compte
        if user.id == request.user.id:
            return Response(
                {'error': 'Vous ne pouvez pas supprimer votre propre compte'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = user.username
        user.delete()
        
        return Response({
            'message': f'Utilisateur {username} supprimé avec succès'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Utilisateur non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
