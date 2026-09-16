from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from .models import NewsletterSubscriber
from .forms import NewsletterForm
from apps.core.utils import check_rate_limit


@require_http_methods(["POST"])
def newsletter_subscribe(request):
    """
    Handle newsletter subscription for 'doodle drops'.
    """
    is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', '')

    allowed, retry_after = check_rate_limit(request, action_key="newsletter", max_requests=4, window_seconds=60)
    if not allowed:
        msg = f"Please wait {retry_after} seconds before trying to subscribe again."
        if is_ajax:
            return JsonResponse({'success': False, 'message': msg}, status=429)
        messages.error(request, msg)
        return redirect(request.META.get('HTTP_REFERER', '/'))

    form = NewsletterForm(request.POST)
    if form.is_valid():
        email = form.cleaned_data['email'].lower().strip()
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={'source': request.POST.get('source', 'footer')}
        )

        if created:
            msg = "🎨 You're on the doodle drop list! Look out for silly doodles in your inbox soon."
        else:
            msg = "✨ You are already subscribed to doodle drops! Thank you for staying wobbly."

        if is_ajax:
            return JsonResponse({'success': True, 'message': msg})
        messages.success(request, msg)
        return redirect(request.META.get('HTTP_REFERER', '/'))
    else:
        err = "Please enter a valid email address."
        if is_ajax:
            return JsonResponse({'success': False, 'message': err}, status=400)
        messages.error(request, err)
        return redirect(request.META.get('HTTP_REFERER', '/'))
