from django.urls import path
from . import views
from . import auth_views
from . import resume_views

urlpatterns = [
    path('parse-resume', views.parse_resume, name='parse-resume'),
    path('parse-resume/', views.parse_resume, name='parse-resume-with-slash'),
    path('auth/csrf', auth_views.csrf_cookie, name='auth-csrf'),
    path('auth/me', auth_views.current_user, name='auth-me'),
    path('auth/signup', auth_views.signup, name='auth-signup'),
    path('auth/login', auth_views.login_user, name='auth-login'),
    path('auth/google', auth_views.google_login, name='auth-google'),
    path('auth/logout', auth_views.logout_user, name='auth-logout'),
    path('auth/change-password', auth_views.change_password, name='auth-change-password'),
    path('auth/data-export', auth_views.export_account_data, name='auth-data-export'),
    path('auth/delete-account', auth_views.delete_account, name='auth-delete-account'),
    path('resume', resume_views.saved_resume, name='saved-resume'),
]
