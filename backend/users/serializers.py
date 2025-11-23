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
