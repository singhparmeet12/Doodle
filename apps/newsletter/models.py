from django.db import models


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    source = models.CharField(max_length=50, default='footer')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Doodle Drop Subscriber'
        verbose_name_plural = 'Doodle Drop Subscribers'

    def __str__(self):
        return self.email
