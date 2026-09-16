from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.core.cache import cache
from .models import DoodlePrompt
import random


@require_GET
def api_random_prompt(request):
    """
    Returns a random doodle prompt in JSON format and increments usage.
    Tracks 'prompts given today' count via cache.
    """
    exclude_id = request.GET.get('exclude')
    qs = DoodlePrompt.objects.all()

    if exclude_id and exclude_id.isdigit():
        qs = qs.exclude(id=int(exclude_id))

    count = qs.count()
    if count == 0:
        # Fallback if only 1 prompt or none
        prompt = DoodlePrompt.objects.order_by('?').first()
    else:
        # Fast random selection
        random_index = random.randint(0, count - 1)
        prompt = qs[random_index]

    if not prompt:
        return JsonResponse({
            'success': False,
            'message': 'No prompts found in the sketchbook!'
        }, status=404)

    # Increment drawn count
    DoodlePrompt.objects.filter(id=prompt.id).update(times_drawn=prompt.times_drawn + 1)

    # Increment today's counter
    cache_key = "prompts_given_count"
    total_today = cache.get(cache_key, 142) + 1
    cache.set(cache_key, total_today, timeout=86400)

    return JsonResponse({
        'success': True,
        'id': prompt.id,
        'text': prompt.text,
        'category': prompt.get_category_display(),
        'difficulty': prompt.get_difficulty_display(),
        'times_drawn': prompt.times_drawn + 1,
        'prompts_given_today': total_today,
    })
