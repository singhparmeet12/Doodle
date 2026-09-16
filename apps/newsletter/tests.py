from django.test import TestCase, Client
from django.urls import reverse
from django.core.cache import cache
from .models import NewsletterSubscriber


class NewsletterTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        cache.clear()

    def test_valid_subscription(self):
        response = self.client.post(
            reverse('newsletter:subscribe'),
            {'email': 'test@doodle.art', 'hp_url': ''},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(NewsletterSubscriber.objects.filter(email='test@doodle.art').exists())

    def test_honeypot_blocks_bot(self):
        response = self.client.post(
            reverse('newsletter:subscribe'),
            {'email': 'bot@doodle.art', 'hp_url': 'http://bot.com'},
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )
        self.assertFalse(NewsletterSubscriber.objects.filter(email='bot@doodle.art').exists())
