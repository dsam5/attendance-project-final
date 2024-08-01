from django.urls import path
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, RegisterView,activate,UserProfileView 

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    # path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),
    path('activate/<uidb64>/<token>/', activate, name='activate'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    # path('test/',test_view,name="test")
    
]

from django.urls import path
from .views import request_password_reset_code, verify_reset_code, reset_password

urlpatterns += [
    path('request-password-reset/', request_password_reset_code, name='request_password_reset'),
    path('verify-reset-code/', verify_reset_code, name='verify_reset_code'),
    path('reset-password/', reset_password, name='reset_password'),
]
