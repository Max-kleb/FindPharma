# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate, get_user_model
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from .serializers import (
    RegisterSerializer, 
    LoginSerializer, 
    UserSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer
)

User = get_user_model()


@extend_schema(
    tags=['Authentication'],
    summary="Inscription d'un nouvel utilisateur",
    description="Créer un nouveau compte utilisateur (customer, pharmacy ou admin)",
    request=RegisterSerializer,
    responses={
        201: UserSerializer,
        400: OpenApiTypes.OBJECT
    },
    examples=[
        OpenApiExample(
            'Customer Registration',
            value={
                'username': 'jean_dupont',
                'email': 'jean@example.com',
                'password': 'SecurePass123!',
                'password2': 'SecurePass123!',
                'first_name': 'Jean',
                'last_name': 'Dupont',
                'phone': '+237 6 12 34 56 78',
                'user_type': 'customer'
            },
            request_only=True
        ),
        OpenApiExample(
            'Pharmacy Registration',
            value={
                'username': 'pharma_centrale',
                'email': 'contact@pharmaciecentrale.cm',
                'password': 'SecurePass123!',
                'password2': 'SecurePass123!',
                'user_type': 'pharmacy',
                'pharmacy_id': 1,
                'phone': '+237 2 22 23 45 67'
            },
            request_only=True
        )
    ]
)
class RegisterView(generics.CreateAPIView):
    """
    Vue pour l'inscription d'un nouvel utilisateur.
    
    Permet de créer un compte pour:
    - Customer (client): type par défaut
    - Pharmacy: nécessite pharmacy_id
    - Admin: uniquement via superadmin
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer les tokens JWT pour le nouvel utilisateur
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Inscription réussie. Bienvenue sur FindPharma!'
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Authentication'],
    summary="Connexion utilisateur",
    description="Authentifier un utilisateur et obtenir les tokens JWT",
    request=LoginSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    },
    examples=[
        OpenApiExample(
            'Login Request',
            value={
                'username': 'jean_dupont',
                'password': 'SecurePass123!'
            },
            request_only=True
        ),
        OpenApiExample(
            'Login Response',
            value={
                'user': {
                    'id': 1,
                    'username': 'jean_dupont',
                    'email': 'jean@example.com',
                    'user_type': 'customer'
                },
                'tokens': {
                    'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGc...',
                    'access': 'eyJ0eXAiOiJKV1QiLCJhbGc...'
                },
                'message': 'Connexion réussie'
            },
            response_only=True,
            status_codes=['200']
        )
    ]
)
class LoginView(APIView):
    """
    Vue pour la connexion utilisateur.
    
    Authentifie l'utilisateur et retourne:
    - Les informations utilisateur
    - Access token (valide 1h)
    - Refresh token (valide 7 jours)
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Identifiants invalides. Veuillez vérifier votre nom d\'utilisateur et mot de passe.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Ce compte est désactivé. Veuillez contacter l\'administrateur.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Connexion réussie'
        }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Authentication'],
    summary="Déconnexion utilisateur",
    description="Blacklister le refresh token pour déconnecter l'utilisateur",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'refresh': {
                    'type': 'string',
                    'description': 'Refresh token à blacklister'
                }
            },
            'required': ['refresh']
        }
    },
    responses={
        205: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT
    }
)
class LogoutView(APIView):
    """
    Vue pour la déconnexion utilisateur.
    
    Blackliste le refresh token pour empêcher son utilisation future.
    L'access token reste valide jusqu'à son expiration (1h).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({
                    'error': 'Le refresh token est requis.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Déconnexion réussie. À bientôt sur FindPharma!'
            }, status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({
                'error': 'Token invalide ou déjà blacklisté.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la déconnexion: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['User Profile'],
    summary="Profil utilisateur",
    description="Récupérer les informations du profil de l'utilisateur connecté",
    responses={
        200: UserSerializer,
        401: OpenApiTypes.OBJECT
    }
)
class UserProfileView(generics.RetrieveAPIView):
    """
    Vue pour récupérer le profil de l'utilisateur connecté.
    
    Nécessite un token JWT valide dans le header:
    Authorization: Bearer <access_token>
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


@extend_schema(
    tags=['User Profile'],
    summary="Mettre à jour le profil",
    description="Mettre à jour les informations du profil utilisateur",
    request=UpdateProfileSerializer,
    responses={
        200: UserSerializer,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
class UpdateProfileView(generics.UpdateAPIView):
    """
    Vue pour mettre à jour le profil utilisateur.
    
    Permet de modifier:
    - Email
    - Prénom et nom
    - Téléphone
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UpdateProfileSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'user': UserSerializer(instance).data,
            'message': 'Profil mis à jour avec succès'
        })


@extend_schema(
    tags=['User Profile'],
    summary="Changer le mot de passe",
    description="Changer le mot de passe de l'utilisateur connecté",
    request=ChangePasswordSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT
    }
)
class ChangePasswordView(APIView):
    """
    Vue pour changer le mot de passe utilisateur.
    
    Nécessite:
    - L'ancien mot de passe
    - Le nouveau mot de passe (deux fois pour confirmation)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Vérifier l'ancien mot de passe
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': 'L\'ancien mot de passe est incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Définir le nouveau mot de passe
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Mot de passe modifié avec succès. Veuillez vous reconnecter.'
        }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['User Management'],
    summary="Liste de tous les utilisateurs",
    description="Récupérer la liste de tous les utilisateurs (admin uniquement)",
    responses={
        200: UserSerializer(many=True),
        401: OpenApiTypes.OBJECT,
        403: OpenApiTypes.OBJECT
    }
)
class UserListView(generics.ListAPIView):
    """
    Vue pour lister tous les utilisateurs.
    
    Accessible uniquement aux administrateurs.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
