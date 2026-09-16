from django.shortcuts import render
from apps.gallery.models import Doodle
from apps.journal.models import JournalPost
from apps.prompts.models import DoodlePrompt
from apps.guestbook.models import GuestbookEntry


def home(request):
    """
    Scribbleverse Homepage with signature GSAP scroll-line,
    gallery sneak peek, random prompt teaser, journal posts, and guestbook stickies.
    """
    featured_doodles = Doodle.objects.filter(is_featured=True)[:6]
    if not featured_doodles.exists():
        featured_doodles = Doodle.objects.all()[:6]

    recent_posts = JournalPost.objects.filter(is_published=True)[:3]
    initial_prompt = DoodlePrompt.objects.order_by('?').first()
    guestbook_stickies = GuestbookEntry.objects.filter(is_approved=True)[:6]

    context = {
        'featured_doodles': featured_doodles,
        'recent_posts': recent_posts,
        'initial_prompt': initial_prompt,
        'guestbook_stickies': guestbook_stickies,
        'page_title': 'Welcome to the Doodle Universe',
        'active_nav': 'home',
    }
    return render(request, 'core/home.html', context)


def about(request):
    """
    The whimsical story of Scribbleverse, character dossiers, and sketchbook manifesto.
    """
    context = {
        'page_title': 'The Scribbleverse Story & Friends',
        'active_nav': 'about',
    }
    return render(request, 'core/about.html', context)


def draw(request):
    """
    'Draw With Me' HTML5 Canvas Studio page.
    """
    initial_prompt = DoodlePrompt.objects.order_by('?').first()
    context = {
        'page_title': 'Draw With Me — Doodle Studio',
        'active_nav': 'draw',
        'initial_prompt': initial_prompt,
    }
    return render(request, 'draw/index.html', context)


def handler404(request, exception=None):
    return render(request, '404.html', status=404)


def handler500(request):
    return render(request, '500.html', status=500)
