# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    UpdateProfileView,
    ChangePasswordView,
    UserListView,
)
from .verification_views import (
    send_verification_code,
    verify_email_code,
    resend_verification_code,
)
from .user_management_views import (
    list_users,
    get_user,
    create_user,
    update_user,
    delete_user,
)
from .pharmacy_registration_views import (
    RegisterPharmacyView,
    PendingPharmaciesView,
    ApprovePharmacyView,
    RejectPharmacyView,
    pharmacy_registration_stats,
)
from .google_auth import google_auth

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # === PHARMACY REGISTRATION (NEW) ===
    path('register-pharmacy/', RegisterPharmacyView.as_view(), name='register-pharmacy'),
    
    # Email verification endpoints
    path('send-verification-code/', send_verification_code, name='send-verification-code'),
    path('verify-code/', verify_email_code, name='verify-code'),
    path('resend-verification-code/', resend_verification_code, name='resend-verification-code'),
    
    # Google OAuth2 authentication
    path('google/', google_auth, name='google-auth'),
    
    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),
    
    # User management (admin only)
    path('', UserListView.as_view(), name='user-list'),
    
    # Admin user management (CRUD)
    path('admin/users/', list_users, name='admin-list-users'),
    path('admin/users/<int:user_id>/', get_user, name='admin-get-user'),
    path('admin/users/create/', create_user, name='admin-create-user'),
    path('admin/users/<int:user_id>/update/', update_user, name='admin-update-user'),
    path('admin/users/<int:user_id>/delete/', delete_user, name='admin-delete-user'),
    
    # === PHARMACY APPROVAL (Admin only) ===
    path('admin/pharmacies/pending/', PendingPharmaciesView.as_view(), name='admin-pending-pharmacies'),
    path('admin/pharmacies/<int:pharmacy_id>/approve/', ApprovePharmacyView.as_view(), name='admin-approve-pharmacy'),
    path('admin/pharmacies/<int:pharmacy_id>/reject/', RejectPharmacyView.as_view(), name='admin-reject-pharmacy'),
    path('admin/pharmacies/stats/', pharmacy_registration_stats, name='admin-pharmacy-stats'),
]
