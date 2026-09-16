from django.db import models
import random


class GuestbookEntry(models.Model):
    MOOD_CHOICES = [
        ('star', '🌟 Starry Eyed'),
        ('blob', '🧸 Cozy Blob'),
        ('coffee', '☕ Over-Caffeinated Scribbler'),
        ('rainbow', '🌈 Pure Joy'),
        ('crayon', '🖍️ Drawing Wildly'),
        ('sleepy', '💤 Sleepy Doodler'),
    ]

    COLOR_CHOICES = [
        ('yellow', 'Sunshine Note'),
        ('coral', 'Coral Note'),
        ('blue', 'Sky Note'),
        ('green', 'Grass Note'),
        ('purple', 'Lavender Note'),
    ]

    name = models.CharField(max_length=80, help_text="Your nickname or doodle pen-name")
    message = models.TextField(max_length=500, help_text="A friendly message or doodle thought")
    mood = models.CharField(max_length=50, choices=MOOD_CHOICES, default='star')
    paper_color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='yellow')
    tilt_deg = models.IntegerField(default=-2, help_text="Scrapbook sticky note tilt")
    is_approved = models.BooleanField(
        default=False,
        help_text="Requires admin approval to appear on the public wall"
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Guestbook Sticky Note'
        verbose_name_plural = 'Guestbook Sticky Notes'

    def save(self, *args, **kwargs):
        if not self.paper_color or self.paper_color == 'yellow':
            self.paper_color = random.choice(['yellow', 'coral', 'blue', 'green', 'purple'])
        if self.tilt_deg == -2:
            self.tilt_deg = random.choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
        super().save(*args, **kwargs)

    def __str__(self):
        status = "Approved" if self.is_approved else "Pending Approval"
        return f"{self.name} - {self.mood} ({status})"
