from django.urls import path
from . import views

urlpatterns = [
    # US 8 : Dashboard Admin - Statistiques
    path('admin/stats/', views.admin_dashboard_stats, name='admin-stats'),
    path('admin/activity/', views.admin_recent_activity, name='admin-activity'),
    
    # Formulaire de contact
    path('contact/', views.send_contact_email, name='send-contact-email'),
]