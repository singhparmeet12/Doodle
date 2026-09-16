from django.contrib import admin
from .models import JournalPost


@admin.register(JournalPost)
class JournalPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'mood', 'published_date', 'is_published')
    list_filter = ('is_published', 'published_date')
    search_fields = ('title', 'excerpt', 'body')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
