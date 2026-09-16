"""
URL configuration for scribbleverse project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.core.urls', namespace='core')),
    path('gallery/', include('apps.gallery.urls', namespace='gallery')),
    path('journal/', include('apps.journal.urls', namespace='journal')),
    path('api/prompts/', include('apps.prompts.urls', namespace='prompts')),
    path('guestbook/', include('apps.guestbook.urls', namespace='guestbook')),
    path('newsletter/', include('apps.newsletter.urls', namespace='newsletter')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'apps.core.views.handler404'
handler500 = 'apps.core.views.handler500'
