from django.contrib import admin
from .models import Doodle


@admin.register(Doodle)
class DoodleAdmin(admin.ModelAdmin):
    list_display = ('title', 'character_tag', 'created_at', 'is_featured', 'tilt_deg')
    list_filter = ('character_tag', 'is_featured', 'created_at')
    search_fields = ('title', 'caption')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_featured', 'tilt_deg')
