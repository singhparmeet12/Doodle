from datetime import datetime
from apps.gallery.models import Doodle
from apps.prompts.models import DoodlePrompt
from apps.guestbook.models import GuestbookEntry


def scribbleverse_context(request):
    """
    Global context processor for Scribbleverse branding, counts, and theme.
    """
    try:
        doodle_count = Doodle.objects.count()
    except Exception:
        doodle_count = 0

    try:
        prompt_count = DoodlePrompt.objects.count()
    except Exception:
        prompt_count = 0

    try:
        guestbook_count = GuestbookEntry.objects.filter(is_approved=True).count()
    except Exception:
        guestbook_count = 0

    return {
        'SITE_NAME': 'Scribbleverse',
        'SITE_TAGLINE': 'A whimsical doodle universe where imagination wanders off the margins',
        'MASCOT_NAME': 'Barnaby the Scribble Blob',
        'CURRENT_YEAR': datetime.now().year,
        'TOTAL_DOODLES': doodle_count,
        'TOTAL_PROMPTS': prompt_count,
        'APPROVED_STICKIES': guestbook_count,
    }
