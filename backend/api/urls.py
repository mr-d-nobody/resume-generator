from django.urls import path
from . import views

urlpatterns = [
    path('parse-resume', views.parse_resume, name='parse-resume'),
    path('parse-resume/', views.parse_resume, name='parse-resume-with-slash'),
]
