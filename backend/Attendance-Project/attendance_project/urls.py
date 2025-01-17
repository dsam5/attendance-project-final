"""
URL configuration for attendance_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path,include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('users/', include('users.urls')),
#     # path('attendance/',include('attendance.urls')),
# ]



from django.contrib import admin
from django.urls import include, path
from users import views as user_views
from attendance import views as attendance_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', user_views.login_view, name='login'),
    path('logout/', user_views.logout_view, name='logout'),
    path('dashboard/', user_views.dashboard_view, name='dashboard'),
    # path('addstudent/', user_views.capture_face, name='addstudent'),
    # path('check_in/', user_views.check_in, name='check_in'),
    path('attendance/', include("attendance.urls")),
    path('auth/', include('app_auth.urls'))
]
# super username appauth@gmail.com
# password Dollar456