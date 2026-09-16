from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from .models import JournalPost


def journal_list(request):
    """
    List of journal/diary posts styled like diary notebooks.
    """
    posts_qs = JournalPost.objects.filter(is_published=True)
    paginator = Paginator(posts_qs, 6)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'page_title': 'The Doodle Diary & Field Notes',
        'active_nav': 'journal',
    }
    return render(request, 'journal/index.html', context)


def journal_detail(request, slug):
    """
    Full diary post with handwritten styling and 'end of this page' doodle signature.
    """
    post = get_object_or_404(JournalPost, slug=slug, is_published=True)
    other_posts = JournalPost.objects.filter(is_published=True).exclude(id=post.id)[:3]

    context = {
        'post': post,
        'other_posts': other_posts,
        'page_title': f"{post.title} — Doodle Diary",
        'active_nav': 'journal',
    }
    return render(request, 'journal/detail.html', context)
