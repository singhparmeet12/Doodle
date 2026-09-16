import time
from django.core.cache import cache
from django.http import HttpResponseBadRequest


def get_client_ip(request):
    """
    Extract client IP address reliably, checking X-Forwarded-For if behind a reverse proxy.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip


def check_rate_limit(request, action_key="submission", max_requests=5, window_seconds=60):
    """
    Simple, secure per-IP sliding window rate limiter using Django's cache framework.
    Returns (is_allowed: bool, time_remaining: int)
    """
    ip = get_client_ip(request)
    cache_key = f"rl_{action_key}_{ip}"
    current_time = time.time()

    requests_list = cache.get(cache_key, [])
    # Filter out requests older than window_seconds
    valid_requests = [t for t in requests_list if current_time - t < window_seconds]

    if len(valid_requests) >= max_requests:
        oldest = valid_requests[0]
        retry_after = int(window_seconds - (current_time - oldest)) + 1
        return False, retry_after

    valid_requests.append(current_time)
    cache.set(cache_key, valid_requests, window_seconds)
    return True, 0
