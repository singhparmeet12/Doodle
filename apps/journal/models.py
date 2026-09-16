from django.db import models
from django.utils.text import slugify
from django.utils import timezone


class JournalPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    excerpt = models.TextField(max_length=350, help_text="Short handwritten excerpt for previews")
    body = models.TextField(help_text="Diary entry body (HTML/rich text formatted)")
    cover_image = models.ImageField(upload_to='journal/', blank=True, null=True)
    svg_cover = models.TextField(blank=True, help_text="Inline SVG cover doodle if no raster image")
    mood = models.CharField(max_length=60, default="Crayon Fueled 🖍️", help_text="Author doodle mood")
    published_date = models.DateField(default=timezone.now)
    is_published = models.BooleanField(default=True)
    read_time = models.CharField(max_length=40, default="3 min doodle read")

    class Meta:
        ordering = ['-published_date', '-id']
        verbose_name = 'Journal Post'
        verbose_name_plural = 'Journal Posts'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'journal-entry'
            slug = base_slug
            counter = 1
            while JournalPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
