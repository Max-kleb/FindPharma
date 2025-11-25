from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Medicine
from .serializers import MedicineSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    """
    API endpoint CRUD complet pour les médicaments.
    - LIST/READ: Accessible à tous
    - CREATE/UPDATE/DELETE: Réservé aux pharmacies et admins
    """
    queryset = Medicine.objects.all().order_by('name')
    serializer_class = MedicineSerializer
    
    def get_permissions(self):
        """
        Permissions personnalisées selon l'action
        """
        if self.action in ['list', 'retrieve', 'search']:
            # Lecture accessible à tous
            permission_classes = [permissions.AllowAny]
        else:
            # Création/Modification/Suppression réservée aux utilisateurs authentifiés
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Optionnellement filtrer par recherche
        """
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Recherche de médicaments par nom
        GET /api/medicines/search/?q=paracetamol
        """
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'results': []})
        
        medicines = Medicine.objects.filter(name__icontains=query)[:20]
        serializer = self.get_serializer(medicines, many=True)
        
        return Response({'results': serializer.data})
