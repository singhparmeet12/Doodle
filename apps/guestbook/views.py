from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import GuestbookEntry
from .forms import GuestbookForm
from apps.core.utils import get_client_ip, check_rate_limit


def guestbook_list(request):
    """
    Public wall of approved sticky notes and a submission form.
    """
    stickies = GuestbookEntry.objects.filter(is_approved=True)
    form = GuestbookForm()

    context = {
        'stickies': stickies,
        'form': form,
        'page_title': 'Visitor Guestbook & Sticky Wall',
        'active_nav': 'guestbook',
        'total_notes': stickies.count(),
    }
    return render(request, 'guestbook/index.html', context)


@require_http_methods(["POST"])
def guestbook_submit(request):
    """
    Process guestbook note submissions.
    Enforces IP-based rate limiting and honeypot check.
    Entries are held for admin moderation (is_approved=False).
    """
    is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', '')

    # Rate limiting: max 3 notes per 60 seconds per IP
    allowed, retry_after = check_rate_limit(request, action_key="guestbook", max_requests=3, window_seconds=60)
    if not allowed:
        msg = f"Whoa, hold your pens! You're doodling too fast. Please wait {retry_after} seconds before pinning another note."
        if is_ajax:
            return JsonResponse({'success': False, 'message': msg}, status=429)
        messages.error(request, msg)
        return redirect('guestbook:list')

    form = GuestbookForm(request.POST)
    if form.is_valid():
        entry = form.save(commit=False)
        entry.is_approved = False  # Held for admin moderation
        entry.ip_address = get_client_ip(request)
        entry.save()

        success_msg = "Woohoo! Your sticky note has been pinned to the drying rack. Barnaby will inspect it with his magnifying glass before it appears on the public wall!"
        if is_ajax:
            return JsonResponse({
                'success': True,
                'message': success_msg,
                'note': {
                    'name': entry.name,
                    'message': entry.message,
                    'mood': entry.get_mood_display(),
                    'paper_color': entry.paper_color,
                    'tilt_deg': entry.tilt_deg,
                }
            })
        messages.success(request, success_msg)
        return redirect('guestbook:list')
    else:
        # Collect errors
        error_msg = "Oops! Please check your note: " + "; ".join([f"{f}: {e[0]}" for f, e in form.errors.items()])
        if is_ajax:
            return JsonResponse({'success': False, 'message': error_msg, 'errors': form.errors}, status=400)
        messages.error(request, error_msg)
        return redirect('guestbook:list')
