# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from pharmacies.models import Pharmacy

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les informations utilisateur"""
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'user_type',
            'pharmacy',
            'pharmacy_name',
            'phone',
            'date_joined',
            'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'un nouvel utilisateur"""
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    pharmacy_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'username', 
            'password', 
            'password2', 
            'email', 
            'first_name', 
            'last_name',
            'user_type',
            'pharmacy_id',
            'phone'
        ]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'user_type': {'required': False},
            'phone': {'required': False},
        }
    
    def validate(self, attrs):
        """Validation personnalisée"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Les mots de passe ne correspondent pas."
            })
        
        # Valider que si user_type est 'pharmacy', une pharmacy_id est fournie
        if attrs.get('user_type') == 'pharmacy':
            pharmacy_id = attrs.get('pharmacy_id')
            if not pharmacy_id:
                raise serializers.ValidationError({
                    "pharmacy_id": "Une pharmacie doit être spécifiée pour un utilisateur de type pharmacie."
                })
            
            # Vérifier que la pharmacie existe
            try:
                Pharmacy.objects.get(id=pharmacy_id)
            except Pharmacy.DoesNotExist:
                raise serializers.ValidationError({
                    "pharmacy_id": f"La pharmacie avec l'ID {pharmacy_id} n'existe pas."
                })
        
        return attrs
    
    def create(self, validated_data):
        """Créer un nouvel utilisateur"""
        validated_data.pop('password2')
        pharmacy_id = validated_data.pop('pharmacy_id', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type=validated_data.get('user_type', 'customer'),
            phone=validated_data.get('phone', ''),
        )
        
        # Associer la pharmacie si fournie
        if pharmacy_id:
            user.pharmacy_id = pharmacy_id
            user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    old_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "Les nouveaux mots de passe ne correspondent pas."
            })
        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour le profil utilisateur"""
    email = serializers.EmailField(required=False)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone']
        
    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value


# ============================================================================
# SERIALIZERS POUR L'INSCRIPTION DES PHARMACIES
# ============================================================================

class PharmacyRegistrationSerializer(serializers.Serializer):
    """
    Serializer professionnel pour l'inscription d'une nouvelle pharmacie.
    Crée simultanément la pharmacie et le compte gérant avec statut 'pending'.
    """
    
    # === INFORMATIONS PHARMACIE ===
    pharmacy_name = serializers.CharField(
        max_length=255,
        help_text="Nom officiel de la pharmacie"
    )
    license_number = serializers.CharField(
        max_length=100,
        help_text="Numéro d'agrément officiel (ex: CAM-PHARM-2024-XXXX)"
    )
    pharmacy_address = serializers.CharField(
        help_text="Adresse complète de la pharmacie"
    )
    pharmacy_phone = serializers.CharField(
        max_length=20,
        help_text="Téléphone de la pharmacie"
    )
    pharmacy_email = serializers.EmailField(
        required=False,
        allow_blank=True,
        help_text="Email de contact de la pharmacie"
    )
    
    # === GÉOLOCALISATION ===
    latitude = serializers.FloatField(
        min_value=-90,
        max_value=90,
        help_text="Latitude GPS de la pharmacie"
    )
    longitude = serializers.FloatField(
        min_value=-180,
        max_value=180,
        help_text="Longitude GPS de la pharmacie"
    )
    
    # === HORAIRES (optionnel) ===
    opening_hours = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Horaires d'ouverture au format JSON"
    )
    
    # === INFORMATIONS GÉRANT ===
    manager_first_name = serializers.CharField(
        max_length=150,
        help_text="Prénom du gérant"
    )
    manager_last_name = serializers.CharField(
        max_length=150,
        help_text="Nom du gérant"
    )
    manager_email = serializers.EmailField(
        help_text="Email professionnel du gérant (pour la connexion)"
    )
    manager_phone = serializers.CharField(
        max_length=20,
        help_text="Téléphone du gérant"
    )
    username = serializers.CharField(
        max_length=150,
        help_text="Nom d'utilisateur pour la connexion"
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Mot de passe (minimum 8 caractères)"
    )
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirmation du mot de passe"
    )
    
    def validate_license_number(self, value):
        """Vérifie que le numéro d'agrément n'existe pas déjà"""
        from pharmacies.models import Pharmacy
        if Pharmacy.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(
                "Une pharmacie avec ce numéro d'agrément existe déjà."
            )
        return value
    
    def validate_username(self, value):
        """Vérifie que le nom d'utilisateur n'existe pas"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Ce nom d'utilisateur est déjà pris."
            )
        return value
    
    def validate_manager_email(self, value):
        """Vérifie que l'email n'est pas déjà utilisé"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Cet email est déjà utilisé par un autre compte."
            )
        return value
    
    def validate(self, attrs):
        """Validation globale"""
        # Vérifier que les mots de passe correspondent
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Les mots de passe ne correspondent pas."
            })
        
        # Vérifier les coordonnées GPS (Cameroun approximativement)
        lat, lon = attrs['latitude'], attrs['longitude']
        if not (1.5 <= lat <= 13.5 and 8.0 <= lon <= 16.5):
            # Warning mais pas bloquant
            pass
        
        return attrs
    
    def create(self, validated_data):
        """
        Crée la pharmacie et le compte gérant avec statut 'pending'.
        """
        from pharmacies.models import Pharmacy
        
        # 1. Créer la pharmacie avec statut pending
        pharmacy = Pharmacy.objects.create(
            name=validated_data['pharmacy_name'],
            license_number=validated_data['license_number'],
            address=validated_data['pharmacy_address'],
            phone=validated_data['pharmacy_phone'],
            email=validated_data.get('pharmacy_email', ''),
            latitude=validated_data['latitude'],
            longitude=validated_data['longitude'],
            opening_hours=validated_data.get('opening_hours', {}),
            approval_status='pending',
            is_active=False,  # Inactive jusqu'à approbation
        )
        
        # 2. Créer le compte gérant avec statut pending
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['manager_email'],
            password=validated_data['password'],
            first_name=validated_data['manager_first_name'],
            last_name=validated_data['manager_last_name'],
            phone=validated_data['manager_phone'],
            user_type='pharmacy',
            pharmacy=pharmacy,
            approval_status='pending',
        )
        
        # 3. Associer le soumetteur à la pharmacie
        pharmacy.submitted_by = user
        pharmacy.save()
        
        return {
            'user': user,
            'pharmacy': pharmacy
        }


class PendingPharmacySerializer(serializers.ModelSerializer):
    """Serializer pour afficher les pharmacies en attente de validation"""
    manager_name = serializers.SerializerMethodField()
    manager_email = serializers.SerializerMethodField()
    manager_phone = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        from pharmacies.models import Pharmacy
        model = Pharmacy
        fields = [
            'id', 'name', 'license_number', 'address', 'phone', 'email',
            'latitude', 'longitude', 'opening_hours',
            'approval_status', 'submitted_at',
            'manager_name', 'manager_email', 'manager_phone'
        ]
    
    def get_manager_name(self, obj):
        if obj.submitted_by:
            return f"{obj.submitted_by.first_name} {obj.submitted_by.last_name}".strip()
        return None
    
    def get_manager_email(self, obj):
        if obj.submitted_by:
            return obj.submitted_by.email
        return None
    
    def get_manager_phone(self, obj):
        if obj.submitted_by:
            return obj.submitted_by.phone
        return None


class ApprovalActionSerializer(serializers.Serializer):
    """Serializer pour les actions d'approbation/rejet"""
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Motif de refus (obligatoire pour le rejet)"
    )
    
    def validate(self, attrs):
        action = self.context.get('action')
        if action == 'reject' and not attrs.get('reason'):
            raise serializers.ValidationError({
                "reason": "Le motif de refus est obligatoire."
            })
        return attrs
