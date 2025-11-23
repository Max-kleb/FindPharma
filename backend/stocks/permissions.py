from rest_framework import permissions


class IsPharmacyOwner(permissions.BasePermission):
    """
    Permission personnalisée pour vérifier que l'utilisateur
    est propriétaire de la pharmacie.
    """
    
    def has_permission(self, request, view):
        """
        Vérifie que l'utilisateur est authentifié et est un utilisateur pharmacie
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les admins ont tous les droits
        if request.user.is_superuser:
            return True
        
        # Les utilisateurs de type 'pharmacy' peuvent accéder
        return request.user.user_type == 'pharmacy' and request.user.pharmacy is not None
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie que l'utilisateur peut modifier cet objet spécifique
        """
        # Les admins ont tous les droits
        if request.user.is_superuser:
            return True
        
        # Vérifier que l'utilisateur gère bien cette pharmacie
        if hasattr(obj, 'pharmacy'):
            return request.user.pharmacy_id == obj.pharmacy_id
        elif hasattr(obj, 'pharmacy_id'):
            return request.user.pharmacy_id == obj.pharmacy_id
        elif hasattr(obj, 'id'):  # C'est une pharmacie
            return request.user.pharmacy_id == obj.id
        
        return False


class IsPharmacyOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission permettant la lecture à tous, mais l'écriture uniquement
    aux propriétaires de la pharmacie.
    """
    
    def has_permission(self, request, view):
        # Lecture autorisée pour tout le monde
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture uniquement pour les utilisateurs authentifiés
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les admins ont tous les droits
        if request.user.is_superuser:
            return True
        
        # Les utilisateurs de type 'pharmacy' peuvent écrire
        return request.user.user_type == 'pharmacy' and request.user.pharmacy is not None
    
    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tout le monde
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture uniquement pour le propriétaire
        if request.user.is_superuser:
            return True
        
        if hasattr(obj, 'pharmacy'):
            return request.user.pharmacy_id == obj.pharmacy_id
        elif hasattr(obj, 'pharmacy_id'):
            return request.user.pharmacy_id == obj.pharmacy_id
        elif hasattr(obj, 'id'):  # C'est une pharmacie
            return request.user.pharmacy_id == obj.id
        
        return False
