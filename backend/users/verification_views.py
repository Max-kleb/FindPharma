# backend/users/verification_views.py
"""
Vues pour la vérification d'email lors de l'inscription
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache  # ✅ NOUVEAU : Utiliser le cache au lieu des sessions

from django.conf import settings

from .models import User
# ⚠️ EmailVerification temporairement désactivé (problème migration GDAL)
# from .models import User, EmailVerification
from .email_service import generate_verification_code, send_verification_email, send_welcome_email


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """
    Génère et envoie un code de vérification par email
    POST /api/auth/send-verification-code/
    Body: {
        "email": "user@example.com",
        "username": "username" (optionnel)
    }
    """
    email = request.data.get('email')
    username = request.data.get('username', 'Utilisateur')
    
    if not email:
        return Response(
            {'error': 'Email requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Vérifier si l'email existe déjà
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Cet email est déjà utilisé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Générer un code de vérification
        code = generate_verification_code()
        
        # Récupérer le temps d'expiration depuis settings (en minutes)
        expiry_minutes = getattr(settings, 'EMAIL_VERIFICATION_CODE_EXPIRY', 15)
        
        # ✅ NOUVEAU : Stocker dans le cache Django (plus fiable que les sessions)
        cache_key = f'verification_code_{email}'
        cache_data = {
            'code': code,
            'username': username,
            'expires_at': (timezone.now() + timedelta(minutes=expiry_minutes)).isoformat(),
            'attempts': 0
        }
        # Stocker avec expiration automatique (en secondes)
        cache.set(cache_key, cache_data, timeout=expiry_minutes * 60)
        
        print(f"✅ Code généré pour {email}: {code} (expire dans {expiry_minutes} min)")
        print(f"💾 Stocké dans cache avec clé: {cache_key}")
        
        # Envoyer l'email
        success = send_verification_email(email, code, username)
        
        if success:
            response_data = {
                'message': 'Code de vérification envoyé',
                'email': email,
                'expires_in': expiry_minutes * 60  # Convertir en secondes
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Erreur lors de l\'envoi de l\'email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        print(f"❌ Erreur send_verification_code: {str(e)}")
        return Response(
            {'error': 'Erreur serveur'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_code(request):
    """
    Vérifie le code de vérification entré par l'utilisateur
    POST /api/auth/verify-code/
    Body: {
        "email": "user@example.com",
        "code": "ABC123"
    }
    """
    email = request.data.get('email')
    code = request.data.get('code', '').upper()
    
    if not email or not code:
        return Response(
            {'error': 'Email et code requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ✅ NOUVEAU : Récupérer depuis le cache Django
    cache_key = f'verification_code_{email}'
    verification_data = cache.get(cache_key)
    
    print(f"🔍 Vérification pour {email}")
    print(f"   Code reçu: {code}")
    print(f"   Données cache: {verification_data}")
    
    if not verification_data:
        print(f"❌ Aucun code trouvé dans le cache pour {email}")
        return Response(
            {'error': 'Aucun code de vérification trouvé. Demandez un nouveau code.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier l'expiration
    expires_at = timezone.datetime.fromisoformat(verification_data['expires_at'])
    print(f"   Code attendu: {verification_data['code']}")
    print(f"   Expire à: {expires_at}")
    print(f"   Maintenant: {timezone.now()}")
    
    if timezone.now() > expires_at:
        # Nettoyer le cache
        cache.delete(cache_key)
        print(f"❌ Code expiré")
        return Response(
            {'error': 'Code expiré. Demandez un nouveau code.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier le nombre de tentatives
    if verification_data['attempts'] >= 5:
        cache.delete(cache_key)
        print(f"❌ Trop de tentatives")
        return Response(
            {'error': 'Trop de tentatives. Demandez un nouveau code.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Vérifier le code
    if code == verification_data['code']:
        # Code correct ! Marquer comme vérifié et nettoyer
        cache.set(f'email_verified_{email}', True, timeout=3600)  # 1 heure
        cache.delete(cache_key)
        
        print(f"✅ Code correct pour {email}")
        return Response({
            'message': 'Email vérifié avec succès !',
            'verified': True
        }, status=status.HTTP_200_OK)
    else:
        # Code incorrect - incrémenter les tentatives
        verification_data['attempts'] += 1
        # Recalculer le timeout restant
        remaining_time = int((expires_at - timezone.now()).total_seconds())
        cache.set(cache_key, verification_data, timeout=max(remaining_time, 60))
        
        remaining_attempts = 5 - verification_data['attempts']
        print(f"❌ Code incorrect (tentative {verification_data['attempts']}/5)")
        return Response({
            'error': f'Code incorrect. {remaining_attempts} tentative(s) restante(s).',
            'remaining_attempts': remaining_attempts
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_code(request):
    """
    Renvoie un nouveau code de vérification
    POST /api/auth/resend-verification-code/
    Body: {
        "email": "user@example.com"
    }
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ✅ NOUVEAU : Récupérer depuis le cache
    cache_key = f'verification_code_{email}'
    old_data = cache.get(cache_key, {})
    username = old_data.get('username', 'Utilisateur')
    
    # Générer un nouveau code
    code = generate_verification_code()
    
    # Récupérer le temps d'expiration depuis settings
    expiry_minutes = getattr(settings, 'EMAIL_VERIFICATION_CODE_EXPIRY', 15)
    
    # Remplacer l'ancien code dans le cache
    cache_data = {
        'code': code,
        'username': username,
        'expires_at': (timezone.now() + timedelta(minutes=expiry_minutes)).isoformat(),
        'attempts': 0
    }
    cache.set(cache_key, cache_data, timeout=expiry_minutes * 60)
    
    print(f"🔄 Nouveau code généré pour {email}: {code} (expire dans {expiry_minutes} min)")
    
    # Envoyer l'email
    success = send_verification_email(email, code, username)
    
    if success:
        return Response({
            'message': 'Nouveau code envoyé',
            'email': email
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'error': 'Erreur lors de l\'envoi de l\'email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
