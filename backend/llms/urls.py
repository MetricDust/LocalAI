
from django.urls import path
from . import views

urlpatterns = [
    path('chat', views.completions, name='completions'),
    path('models', views.models, name='models'),
]
