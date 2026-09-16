from django.db import models


class DoodlePrompt(models.Model):
    CATEGORY_CHOICES = [
        ('creatures', 'Weird Creatures & Pets 🐾'),
        ('space', 'Cosmic Doodles 🚀'),
        ('everyday', 'Everyday Objects with Faces ☕'),
        ('fantasy', 'Tiny Adventures 🍄'),
        ('abstract', 'Wobbly Feelings & Scribbles 🌀'),
    ]

    DIFFICULTY_CHOICES = [
        ('quick', '2-Minute Warmup ⏱️'),
        ('playful', 'Playful Sketch 🎨'),
        ('wild', 'Wild Imagination 🌟'),
    ]

    text = models.CharField(max_length=300)
    category = models.CharField(
        max_length=60,
        choices=CATEGORY_CHOICES,
        default='creatures'
    )
    difficulty = models.CharField(
        max_length=30,
        choices=DIFFICULTY_CHOICES,
        default='playful'
    )
    times_drawn = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Doodle Prompt'
        verbose_name_plural = 'Doodle Prompts'

    def __str__(self):
        return f"{self.text[:50]}... [{self.get_category_display()}]"
