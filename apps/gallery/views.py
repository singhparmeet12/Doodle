from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import Doodle


def gallery_list(request):
    """
    Scrapbook gallery page with character filtering, pagination, and lightbox support.
    """
    tag = request.GET.get('tag', 'all').lower().strip()
    doodles_qs = Doodle.objects.all()

    if tag and tag != 'all':
        doodles_qs = doodles_qs.filter(character_tag=tag)

    paginator = Paginator(doodles_qs, 9)  # 9 doodles per page
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    character_choices = [
        ('all', 'All Doodles ✨'),
        ('barnaby', 'Barnaby the Blob 🧸'),
        ('pip', 'Pip the Bird 🐦'),
        ('cloudia', 'Sir Reginald Cloud ☁️'),
        ('inky', 'Inky the Octopus 🐙'),
        ('cosmic', 'Cosmic Scribbles 🚀'),
        ('daily', 'Daily Sketches ✏️'),
    ]

    context = {
        'page_obj': page_obj,
        'current_tag': tag,
        'character_choices': character_choices,
        'page_title': 'The Scrapbook Gallery',
        'active_nav': 'gallery',
        'total_count': doodles_qs.count(),
    }
    return render(request, 'gallery/index.html', context)


def gallery_detail(request, slug):
    """
    Individual doodle view page (useful for direct sharing & SEO).
    """
    doodle = get_object_or_404(Doodle, slug=slug)
    related_doodles = Doodle.objects.filter(character_tag=doodle.character_tag).exclude(id=doodle.id)[:4]

    context = {
        'doodle': doodle,
        'related_doodles': related_doodles,
        'page_title': f"{doodle.title} — Scribbleverse Gallery",
        'active_nav': 'gallery',
    }
    return render(request, 'gallery/detail.html', context)


def doodle_json(request, slug):
    """
    JSON endpoint for lightbox AJAX data if needed.
    """
    doodle = get_object_or_404(Doodle, slug=slug)
    data = {
        'title': doodle.title,
        'slug': doodle.slug,
        'caption': doodle.caption,
        'character': doodle.get_character_tag_display(),
        'date': doodle.created_at.strftime('%B %d, %Y'),
        'svg_content': doodle.svg_content,
        'image_url': doodle.image.url if doodle.image else None,
    }
    return JsonResponse(data)
