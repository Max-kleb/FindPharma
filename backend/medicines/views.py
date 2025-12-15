from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.response import Response
from django.db import IntegrityError
from django.db.models import Q
from .models import Medicine
from .serializers import MedicineSerializer
from .wikipedia_service import get_medicine_info_from_wikipedia


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
        if self.action in ['list', 'retrieve', 'search', 'wikipedia_info', 'categories', 'by_category', 'autocomplete', 'popular']:
            # Lecture accessible à tous
            permission_classes = [permissions.AllowAny]
        else:
            # Création/Modification/Suppression réservée aux utilisateurs authentifiés
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """
        Crée un médicament avec vérification des doublons
        """
        name = request.data.get('name', '').strip()
        dosage = request.data.get('dosage', '').strip() or None
        form = request.data.get('form', '').strip() or None
        
        # Vérifier si un médicament identique existe déjà
        existing = Medicine.objects.filter(
            name__iexact=name,
            dosage=dosage,
            form=form
        ).first()
        
        if existing:
            return Response(
                {'error': f'Ce médicament existe déjà: {existing.name} {existing.dosage or ""} ({existing.form or ""})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'error': 'Ce médicament existe déjà (nom + dosage + forme identiques)'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def get_queryset(self):
        """
        Optionnellement filtrer par recherche et catégorie
        """
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(indications__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category=category)
        
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
        
        medicines = Medicine.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query)
        )[:20]
        serializer = self.get_serializer(medicines, many=True)
        
        return Response({'results': serializer.data})
    
    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        """
        Auto-complétion rapide pour la recherche
        GET /api/medicines/autocomplete/?q=par
        Retourne les noms uniques de médicaments correspondants
        """
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return Response({'suggestions': []})
        
        # Recherche rapide sur le nom uniquement
        medicines = Medicine.objects.filter(
            name__icontains=query
        ).values('name', 'dosage', 'form', 'category').distinct()[:10]
        
        # Formatter les suggestions
        suggestions = []
        seen_names = set()
        
        for med in medicines:
            # Suggestion du nom seul (unique)
            if med['name'] not in seen_names:
                suggestions.append({
                    'type': 'name',
                    'value': med['name'],
                    'display': med['name'],
                    'category': med['category']
                })
                seen_names.add(med['name'])
            
            # Suggestion avec dosage
            full_name = f"{med['name']} {med['dosage']}"
            if full_name not in seen_names and med['dosage']:
                suggestions.append({
                    'type': 'full',
                    'value': full_name,
                    'display': f"{med['name']} {med['dosage']} ({med['form']})",
                    'category': med['category']
                })
                seen_names.add(full_name)
        
        return Response({
            'query': query,
            'suggestions': suggestions[:8]  # Limiter à 8 suggestions
        })
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Médicaments les plus recherchés/populaires
        GET /api/medicines/popular/
        """
        # Pour l'instant, retourner les médicaments par catégorie courante
        popular_categories = ['analgesique', 'antibiotique', 'antipaludeen', 'anti_inflammatoire']
        
        results = []
        for cat in popular_categories:
            meds = Medicine.objects.filter(category=cat).values('name').distinct()[:3]
            for med in meds:
                if med['name'] not in [r['name'] for r in results]:
                    results.append({
                        'name': med['name'],
                        'category': cat
                    })
        
        return Response({'popular': results[:12]})
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Liste toutes les catégories disponibles
        GET /api/medicines/categories/
        """
        return Response({
            'categories': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in Medicine.CATEGORY_CHOICES
            ]
        })
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Médicaments groupés par catégorie
        GET /api/medicines/by_category/?category=antibiotique
        """
        category = request.query_params.get('category', None)
        
        if not category:
            return Response({'error': 'Paramètre category requis'}, status=400)
        
        medicines = Medicine.objects.filter(category=category)
        serializer = self.get_serializer(medicines, many=True)
        
        return Response({
            'category': category,
            'count': medicines.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def wikipedia_info(self, request):
        """
        Récupère les informations d'un médicament depuis Wikipedia
        GET /api/medicines/wikipedia_info/?name=paracetamol
        """
        name = request.query_params.get('name', '')
        
        if not name:
            return Response(
                {'error': 'Le paramètre "name" est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        info = get_medicine_info_from_wikipedia(name)
        
        if info:
            return Response({
                'found': True,
                'data': info
            })
        else:
            return Response({
                'found': False,
                'message': f'Aucune information trouvée pour "{name}" sur Wikipedia'
            })
