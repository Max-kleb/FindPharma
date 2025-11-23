from django.http import JsonResponse
from django.shortcuts import redirect


def home_view(request):
    """
    Page d'accueil de l'API FindPharma
    Redirige vers la documentation Swagger
    """
    return JsonResponse({
        'message': 'Bienvenue sur l\'API FindPharma',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/docs/',
            'api_redoc': '/api/redoc/',
            'api_schema': '/api/schema/',
            'pharmacies': '/api/pharmacies/',
            'search': '/api/search/',
            'nearby': '/api/nearby/',
        },
        'documentation': 'Accédez à /api/docs/ pour la documentation interactive',
    })


def redirect_to_docs(request):
    """Redirige la racine vers la documentation Swagger"""
    return redirect('/api/docs/')
