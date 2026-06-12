from django.urls import path
from . import views

urlpatterns = [
    path('parse-resume/', views.parse_resume, name='parse-resume'),
]
