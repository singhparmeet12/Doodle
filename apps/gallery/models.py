from django.db import models
from django.utils.text import slugify
from django.utils import timezone
import random


class Doodle(models.Model):
    CHARACTER_CHOICES = [
        ('barnaby', 'Barnaby the Blob'),
        ('pip', 'Pip the Pencil Bird'),
        ('cloudia', 'Sir Reginald Cloud'),
        ('inky', 'Inky the Octopus'),
        ('cosmic', 'Cosmic Scribble'),
        ('daily', 'Daily Sketchbook'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    image = models.ImageField(upload_to='doodles/', blank=True, null=True)
    svg_content = models.TextField(
        blank=True,
        help_text="Inline SVG doodle illustration code if no raster image provided"
    )
    caption = models.CharField(max_length=300, help_text="Short handwritten-style caption")
    character_tag = models.CharField(
        max_length=50,
        choices=CHARACTER_CHOICES,
        default='barnaby'
    )
    created_at = models.DateField(default=timezone.now)
    is_featured = models.BooleanField(default=False)
    tilt_deg = models.IntegerField(
        default=0,
        help_text="Subtle scrapbook tilt in degrees (-6 to +6)"
    )

    class Meta:
        ordering = ['-created_at', '-id']
        verbose_name = 'Doodle Entry'
        verbose_name_plural = 'Doodle Entries'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'doodle'
            slug = base_slug
            counter = 1
            while Doodle.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if self.tilt_deg == 0:
            # Pick a slight random tilt between -4 and 4 degrees for scrapbook feel
            self.tilt_deg = random.choice([-5, -3, -2, -1, 1, 2, 3, 5])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_character_tag_display()})"
