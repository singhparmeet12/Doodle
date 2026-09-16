from django.contrib import admin
from .models import DoodlePrompt


@admin.register(DoodlePrompt)
class DoodlePromptAdmin(admin.ModelAdmin):
    list_display = ('text', 'category', 'difficulty', 'times_drawn', 'created_at')
    list_filter = ('category', 'difficulty')
    search_fields = ('text',)
