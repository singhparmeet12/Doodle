from django.urls import path
from . import views

app_name = 'gallery'

urlpatterns = [
    path('', views.gallery_list, name='list'),
    path('<slug:slug>/', views.gallery_detail, name='detail'),
    path('api/doodle/<slug:slug>/', views.doodle_json, name='json'),
]
