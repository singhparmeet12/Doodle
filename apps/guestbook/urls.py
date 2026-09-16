from django.urls import path
from . import views

app_name = 'guestbook'

urlpatterns = [
    path('', views.guestbook_list, name='list'),
    path('submit/', views.guestbook_submit, name='submit'),
]
