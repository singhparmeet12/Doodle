from django.contrib import admin
from .models import GuestbookEntry


@admin.register(GuestbookEntry)
class GuestbookEntryAdmin(admin.ModelAdmin):
    list_display = ('name', 'mood', 'paper_color', 'is_approved', 'created_at', 'ip_address')
    list_filter = ('is_approved', 'mood', 'paper_color', 'created_at')
    search_fields = ('name', 'message', 'ip_address')
    list_editable = ('is_approved',)
    actions = ['approve_selected', 'unapprove_selected']

    @admin.action(description='Approve selected guestbook sticky notes')
    def approve_selected(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description='Unapprove selected sticky notes (hide from public)')
    def unapprove_selected(self, request, queryset):
        queryset.update(is_approved=False)
