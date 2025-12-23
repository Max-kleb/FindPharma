# users/pharmacy_registration_views.py
"""
Vues professionnelles pour l'inscription et la validation des pharmacies.
Architecture RESTful avec gestion complète du workflow d'approbation.
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import User
from .serializers import (
    PharmacyRegistrationSerializer,
    PendingPharmacySerializer,
    ApprovalActionSerializer,
    UserSerializer
)
from .email_service import EmailService
from pharmacies.models import Pharmacy


class IsAdminUser(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est admin"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.user_type == 'admin')
        )


@extend_schema(
    tags=['Pharmacy Registration'],
    summary="Inscription d'une nouvelle pharmacie",
    description="""
    Permet à une pharmacie de s'inscrire sur FindPharma.
    
    Cette API crée simultanément:
    - La fiche pharmacie avec toutes ses informations
    - Le compte du gérant associé
    
    Le compte sera en statut 'pending' jusqu'à validation par un administrateur.
    Un email de notification est envoyé à l'admin pour traitement.
    """,
    request=PharmacyRegistrationSerializer,
    responses={
        201: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT
    },
    examples=[
        OpenApiExample(
            'Exemple inscription pharmacie',
            value={
                'pharmacy_name': 'Pharmacie du Soleil',
                'license_number': 'CAM-PHARM-2024-1234',
                'pharmacy_address': 'Rue 1.234, Quartier Bastos, Yaoundé',
                'pharmacy_phone': '+237 222 23 45 67',
                'pharmacy_email': 'contact@pharmaciesoleil.cm',
                'latitude': 3.8672,
                'longitude': 11.5139,
                'opening_hours': {
                    'monday': '08:00-20:00',
                    'tuesday': '08:00-20:00',
                    'wednesday': '08:00-20:00',
                    'thursday': '08:00-20:00',
                    'friday': '08:00-20:00',
                    'saturday': '08:00-18:00',
                    'sunday': 'Fermé'
                },
                'manager_first_name': 'Jean',
                'manager_last_name': 'Dupont',
                'manager_email': 'jean.dupont@pharmaciesoleil.cm',
                'manager_phone': '+237 699 12 34 56',
                'username': 'jean_dupont',
                'password': 'SecurePass123!',
                'password2': 'SecurePass123!'
            },
            request_only=True
        )
    ]
)
class RegisterPharmacyView(generics.CreateAPIView):
    """
    Vue pour l'inscription d'une nouvelle pharmacie avec son gérant.
    Crée les deux entités avec statut 'pending'.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PharmacyRegistrationSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Créer la pharmacie et le compte
        result = serializer.save()
        user = result['user']
        pharmacy = result['pharmacy']
        
        # Envoyer email de notification à l'admin
        self._notify_admin_new_pharmacy(pharmacy, user)
        
        # Envoyer email de confirmation au gérant
        self._send_registration_confirmation(user, pharmacy)
        
        return Response({
            'success': True,
            'message': 'Votre demande d\'inscription a été soumise avec succès.',
            'details': {
                'pharmacy_name': pharmacy.name,
                'pharmacy_id': pharmacy.id,
                'status': 'pending',
                'next_steps': [
                    'Votre demande sera examinée par notre équipe.',
                    'Vous recevrez un email dès que votre compte sera validé.',
                    'Une fois approuvé, vous pourrez vous connecter et gérer vos stocks.'
                ]
            }
        }, status=status.HTTP_201_CREATED)
    
    def _notify_admin_new_pharmacy(self, pharmacy, user):
        """Envoie une notification à l'email FindPharma"""
        try:
            # Email de contact FindPharma pour recevoir les demandes
            admin_email = "contact.findpharma@gmail.com"
            
            EmailService.send_email(
                to_email=admin_email,
                subject=f"🏥 Nouvelle pharmacie à valider: {pharmacy.name}",
                html_content=f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0;">⚕️ FindPharma</h1>
                                <p style="color: #d1fae5; margin-top: 10px;">Nouvelle demande d'inscription</p>
                            </div>
                            
                            <div style="padding: 30px; background: #f9fafb;">
                                <h2 style="color: #1f2937;">🏥 {pharmacy.name}</h2>
                                
                                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                    <h3 style="color: #374151; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                                        Informations Pharmacie
                                    </h3>
                                    <p><strong>📜 N° Agrément:</strong> {pharmacy.license_number}</p>
                                    <p><strong>📍 Adresse:</strong> {pharmacy.address}</p>
                                    <p><strong>📞 Téléphone:</strong> {pharmacy.phone}</p>
                                    <p><strong>📧 Email:</strong> {pharmacy.email or 'Non renseigné'}</p>
                                    <p><strong>🗺️ Coordonnées:</strong> {pharmacy.latitude}, {pharmacy.longitude}</p>
                                </div>
                                
                                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                    <h3 style="color: #374151; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                                        Informations Gérant
                                    </h3>
                                    <p><strong>👤 Nom:</strong> {user.first_name} {user.last_name}</p>
                                    <p><strong>📧 Email:</strong> {user.email}</p>
                                    <p><strong>📞 Téléphone:</strong> {user.phone}</p>
                                </div>
                                
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="#" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                        Accéder au panneau d'administration
                                    </a>
                                </div>
                            </div>
                            
                            <div style="background: #1f2937; padding: 20px; text-align: center;">
                                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                    FindPharma - Système de gestion des pharmacies
                                </p>
                            </div>
                        </div>
                        """
                    )
        except Exception as e:
            # Log l'erreur mais ne bloque pas l'inscription
            print(f"⚠️ Erreur envoi email admin: {e}")
    
    def _send_registration_confirmation(self, user, pharmacy):
        """Envoie un email de confirmation au gérant"""
        try:
            EmailService.send_email(
                to_email=user.email,
                subject="📋 Votre demande d'inscription FindPharma",
                html_content=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">⚕️ FindPharma</h1>
                        <p style="color: #d1fae5; margin-top: 10px;">Bienvenue !</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #1f2937;">Bonjour {user.first_name},</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            Nous avons bien reçu votre demande d'inscription pour 
                            <strong>{pharmacy.name}</strong>.
                        </p>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e;">
                                ⏳ <strong>Statut:</strong> En attente de validation
                            </p>
                        </div>
                        
                        <h3 style="color: #374151;">Prochaines étapes :</h3>
                        <ol style="color: #4b5563; line-height: 1.8;">
                            <li>Notre équipe va vérifier vos informations et votre numéro d'agrément.</li>
                            <li>Vous recevrez un email de confirmation une fois votre compte validé.</li>
                            <li>Vous pourrez alors vous connecter et commencer à gérer vos stocks.</li>
                        </ol>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h4 style="color: #374151; margin-top: 0;">Récapitulatif de votre demande :</h4>
                            <p><strong>🏥 Pharmacie:</strong> {pharmacy.name}</p>
                            <p><strong>📜 N° Agrément:</strong> {pharmacy.license_number}</p>
                            <p><strong>👤 Identifiant:</strong> {user.username}</p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            Si vous avez des questions, n'hésitez pas à nous contacter.
                        </p>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                            © 2025 FindPharma - Trouvez vos médicaments facilement
                        </p>
                    </div>
                </div>
                """
            )
        except Exception as e:
            print(f"⚠️ Erreur envoi email confirmation: {e}")


@extend_schema(
    tags=['Admin - Pharmacy Approval'],
    summary="Liste des pharmacies en attente de validation",
    description="Retourne toutes les pharmacies avec statut 'pending' pour validation admin.",
    responses={200: PendingPharmacySerializer(many=True)}
)
class PendingPharmaciesView(generics.ListAPIView):
    """Liste les pharmacies en attente de validation"""
    permission_classes = [IsAdminUser]
    serializer_class = PendingPharmacySerializer
    
    def get_queryset(self):
        return Pharmacy.objects.filter(
            approval_status='pending'
        ).select_related('submitted_by').order_by('-created_at')


@extend_schema(
    tags=['Admin - Pharmacy Approval'],
    summary="Approuver une pharmacie",
    description="Approuve une pharmacie et active le compte du gérant associé.",
    responses={
        200: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
class ApprovePharmacyView(APIView):
    """Approuve une pharmacie et son gérant"""
    permission_classes = [IsAdminUser]
    
    @transaction.atomic
    def post(self, request, pharmacy_id):
        try:
            pharmacy = Pharmacy.objects.get(id=pharmacy_id, approval_status='pending')
        except Pharmacy.DoesNotExist:
            return Response(
                {'error': 'Pharmacie non trouvée ou déjà traitée.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Approuver la pharmacie
        pharmacy.approval_status = 'approved'
        pharmacy.approved_at = timezone.now()
        pharmacy.approved_by = request.user
        pharmacy.is_active = True
        pharmacy.rejection_reason = None
        pharmacy.save()
        
        # Approuver le compte du gérant
        if pharmacy.submitted_by:
            user = pharmacy.submitted_by
            user.approval_status = 'approved'
            user.approved_at = timezone.now()
            user.approved_by = request.user
            user.save()
            
            # Envoyer email de confirmation
            self._send_approval_email(user, pharmacy)
        
        return Response({
            'success': True,
            'message': f'La pharmacie "{pharmacy.name}" a été approuvée.',
            'pharmacy': PendingPharmacySerializer(pharmacy).data
        })
    
    def _send_approval_email(self, user, pharmacy):
        """Envoie un email de confirmation d'approbation"""
        try:
            EmailService.send_email(
                to_email=user.email,
                subject="✅ Votre pharmacie est maintenant active sur FindPharma !",
                html_content=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">⚕️ FindPharma</h1>
                        <p style="color: #d1fae5; margin-top: 10px;">Félicitations !</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #065f46; font-size: 18px;">
                                ✅ Votre compte a été approuvé !
                            </p>
                        </div>
                        
                        <h2 style="color: #1f2937;">Bonjour {user.first_name},</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            Excellente nouvelle ! Votre pharmacie <strong>{pharmacy.name}</strong> 
                            a été validée et est maintenant visible sur FindPharma.
                        </p>
                        
                        <h3 style="color: #374151;">Vous pouvez maintenant :</h3>
                        <ul style="color: #4b5563; line-height: 1.8;">
                            <li>🔐 Vous connecter avec votre identifiant: <strong>{user.username}</strong></li>
                            <li>📦 Gérer les stocks de médicaments de votre pharmacie</li>
                            <li>📊 Consulter les statistiques de votre pharmacie</li>
                            <li>💬 Répondre aux avis des clients</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="#" style="background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Se connecter maintenant
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            Bienvenue dans la communauté FindPharma !
                        </p>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                            © 2025 FindPharma - Trouvez vos médicaments facilement
                        </p>
                    </div>
                </div>
                """
            )
        except Exception as e:
            print(f"⚠️ Erreur envoi email approbation: {e}")


@extend_schema(
    tags=['Admin - Pharmacy Approval'],
    summary="Rejeter une pharmacie",
    description="Rejette une demande d'inscription avec un motif obligatoire.",
    request=ApprovalActionSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT
    }
)
class RejectPharmacyView(APIView):
    """Rejette une demande d'inscription de pharmacie"""
    permission_classes = [IsAdminUser]
    
    @transaction.atomic
    def post(self, request, pharmacy_id):
        serializer = ApprovalActionSerializer(
            data=request.data,
            context={'action': 'reject'}
        )
        serializer.is_valid(raise_exception=True)
        
        try:
            pharmacy = Pharmacy.objects.get(id=pharmacy_id, approval_status='pending')
        except Pharmacy.DoesNotExist:
            return Response(
                {'error': 'Pharmacie non trouvée ou déjà traitée.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        reason = serializer.validated_data['reason']
        
        # Rejeter la pharmacie
        pharmacy.approval_status = 'rejected'
        pharmacy.rejection_reason = reason
        pharmacy.approved_by = request.user
        pharmacy.is_active = False
        pharmacy.save()
        
        # Rejeter le compte du gérant
        if pharmacy.submitted_by:
            user = pharmacy.submitted_by
            user.approval_status = 'rejected'
            user.rejection_reason = reason
            user.save()
            
            # Envoyer email de rejet
            self._send_rejection_email(user, pharmacy, reason)
        
        return Response({
            'success': True,
            'message': f'La demande de "{pharmacy.name}" a été rejetée.',
            'reason': reason
        })
    
    def _send_rejection_email(self, user, pharmacy, reason):
        """Envoie un email de notification de rejet"""
        try:
            EmailService.send_email(
                to_email=user.email,
                subject="❌ Concernant votre demande d'inscription FindPharma",
                html_content=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">⚕️ FindPharma</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #1f2937;">Bonjour {user.first_name},</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            Nous avons examiné votre demande d'inscription pour 
                            <strong>{pharmacy.name}</strong>.
                        </p>
                        
                        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #991b1b;">
                                ❌ Malheureusement, votre demande n'a pas pu être acceptée.
                            </p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h4 style="color: #374151; margin-top: 0;">Motif :</h4>
                            <p style="color: #4b5563; font-style: italic;">
                                "{reason}"
                            </p>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez fournir 
                            des informations complémentaires, n'hésitez pas à nous contacter ou 
                            à soumettre une nouvelle demande.
                        </p>
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            Cordialement,<br>
                            L'équipe FindPharma
                        </p>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                            © 2025 FindPharma - Trouvez vos médicaments facilement
                        </p>
                    </div>
                </div>
                """
            )
        except Exception as e:
            print(f"⚠️ Erreur envoi email rejet: {e}")


@extend_schema(
    tags=['Admin - Pharmacy Approval'],
    summary="Statistiques des demandes d'inscription",
    description="Retourne les statistiques des demandes de pharmacies.",
    responses={200: OpenApiTypes.OBJECT}
)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def pharmacy_registration_stats(request):
    """Statistiques sur les demandes d'inscription"""
    stats = {
        'total_pharmacies': Pharmacy.objects.count(),
        'pending': Pharmacy.objects.filter(approval_status='pending').count(),
        'approved': Pharmacy.objects.filter(approval_status='approved').count(),
        'rejected': Pharmacy.objects.filter(approval_status='rejected').count(),
        'recent_pending': PendingPharmacySerializer(
            Pharmacy.objects.filter(approval_status='pending').order_by('-created_at')[:5],
            many=True
        ).data
    }
    return Response(stats)
