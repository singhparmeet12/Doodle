from django.urls import path
from . import views

app_name = 'prompts'

urlpatterns = [
    path('random/', views.api_random_prompt, name='random_prompt'),
]
