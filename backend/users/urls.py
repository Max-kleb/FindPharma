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

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Email verification endpoints
    path('send-verification-code/', send_verification_code, name='send-verification-code'),
    path('verify-code/', verify_email_code, name='verify-code'),
    path('resend-verification-code/', resend_verification_code, name='resend-verification-code'),
    
    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),
    
    # User management (admin only)
    path('', UserListView.as_view(), name='user-list'),
]
