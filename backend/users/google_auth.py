# backend/users/google_auth.py
"""
Google OAuth2 Authentication for FindPharma
Permet aux utilisateurs de s'inscrire/se connecter avec leur compte Google
"""
import requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()

# Configuration Google OAuth2
GOOGLE_CLIENT_ID = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_SECRET', '')
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'


def generate_random_password(length=16):
    """Génère un mot de passe aléatoire sécurisé"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def get_tokens_for_user(user):
    """Génère les tokens JWT pour un utilisateur"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authentification avec Google OAuth2
    
    POST /api/auth/google/
    Body: {
        "credential": "google_id_token" (depuis Google Sign-In)
    }
    
    OU
    
    Body: {
        "code": "authorization_code",
        "redirect_uri": "https://findpharma.app"
    }
    """
    credential = request.data.get('credential')  # ID Token direct
    code = request.data.get('code')  # Authorization code
    redirect_uri = request.data.get('redirect_uri', 'https://findpharma.app')
    
    try:
        google_user_info = None
        
        if credential:
            # Méthode 1: Valider le ID Token directement avec Google
            google_user_info = verify_google_id_token(credential)
        elif code:
            # Méthode 2: Échanger le code contre un access token
            token_data = exchange_code_for_token(code, redirect_uri)
            if 'access_token' in token_data:
                google_user_info = get_google_user_info(token_data['access_token'])
            else:
                return Response(
                    {'error': 'Échec de l\'échange du code', 'details': token_data},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'credential ou code requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not google_user_info:
            return Response(
                {'error': 'Impossible de récupérer les informations Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extraire les informations utilisateur
        google_id = google_user_info.get('sub')
        email = google_user_info.get('email')
        email_verified = google_user_info.get('email_verified', False)
        name = google_user_info.get('name', '')
        given_name = google_user_info.get('given_name', '')
        family_name = google_user_info.get('family_name', '')
        picture = google_user_info.get('picture', '')
        
        if not email:
            return Response(
                {'error': 'Email non disponible depuis Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Chercher ou créer l'utilisateur
        user = None
        is_new_user = False
        
        # D'abord chercher par email
        try:
            user = User.objects.get(email=email)
            print(f"✅ Utilisateur existant trouvé: {email}")
        except User.DoesNotExist:
            # Créer un nouvel utilisateur
            is_new_user = True
            
            # Générer un username unique basé sur l'email
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Créer l'utilisateur avec un mot de passe aléatoire
            user = User.objects.create_user(
                username=username,
                email=email,
                password=generate_random_password(),
                first_name=given_name,
                last_name=family_name,
                user_type='customer',
                is_email_verified=True  # Google vérifie déjà l'email
            )
            
            # Stocker l'ID Google pour référence future
            user.google_id = google_id
            user.save()
            
            print(f"✅ Nouvel utilisateur créé via Google: {email}")
        
        # Générer les tokens JWT
        tokens = get_tokens_for_user(user)
        
        # Préparer la réponse
        response_data = {
            'message': 'Connexion réussie' if not is_new_user else 'Inscription réussie',
            'is_new_user': is_new_user,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'picture': picture,
            },
            'tokens': tokens
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Erreur Google Auth: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def verify_google_id_token(id_token):
    """
    Vérifie un ID Token Google en utilisant l'API Google
    """
    try:
        # Utiliser l'endpoint de vérification de Google
        response = requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}',
            timeout=10
        )
        
        if response.status_code == 200:
            token_info = response.json()
            
            # Vérifier que le token est pour notre application
            if token_info.get('aud') == GOOGLE_CLIENT_ID:
                return token_info
            else:
                print(f"❌ Token audience mismatch: {token_info.get('aud')} != {GOOGLE_CLIENT_ID}")
                return None
        else:
            print(f"❌ Token verification failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur vérification token: {str(e)}")
        return None


def exchange_code_for_token(code, redirect_uri):
    """
    Échange un authorization code contre un access token
    """
    try:
        response = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                'code': code,
                'client_id': GOOGLE_CLIENT_ID,
                'client_secret': GOOGLE_CLIENT_SECRET,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code'
            },
            timeout=10
        )
        return response.json()
    except Exception as e:
        print(f"❌ Erreur échange code: {str(e)}")
        return {'error': str(e)}


def get_google_user_info(access_token):
    """
    Récupère les informations utilisateur depuis Google
    """
    try:
        response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Erreur récupération user info: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur get user info: {str(e)}")
        return None
