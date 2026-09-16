from django.contrib import admin
from .models import NewsletterSubscriber


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'created_at', 'is_active', 'source')
    list_filter = ('is_active', 'created_at', 'source')
    search_fields = ('email',)
