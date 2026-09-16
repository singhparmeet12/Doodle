from django.test import TestCase, Client
from django.urls import reverse
from django.core.cache import cache
from .models import GuestbookEntry


class GuestbookTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        cache.clear()
        self.approved_note = GuestbookEntry.objects.create(
            name="Bob the Doodler",
            message="Barnaby is wonderful!",
            mood="star",
            is_approved=True
        )
        self.unapproved_note = GuestbookEntry.objects.create(
            name="Spammer",
            message="Buy cheap stuff now",
            mood="star",
            is_approved=False
        )

    def test_only_approved_notes_appear_on_wall(self):
        response = self.client.get(reverse('guestbook:list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Bob the Doodler")
        self.assertNotContains(response, "Buy cheap stuff now")

    def test_submission_held_for_moderation(self):
        payload = {
            'name': 'New Sketcher',
            'message': 'This is my first time drawing here!',
            'mood': 'crayon',
            'paper_color': 'coral',
            'hp_website': '',  # Empty honeypot
        }
        response = self.client.post(reverse('guestbook:submit'), payload)
        self.assertEqual(response.status_code, 302)

        new_entry = GuestbookEntry.objects.get(name='New Sketcher')
        self.assertFalse(new_entry.is_approved)  # Must be unapproved until admin acts

    def test_honeypot_rejects_bot(self):
        payload = {
            'name': 'SpamBot 3000',
            'message': 'Free crypto tokens here!',
            'mood': 'blob',
            'paper_color': 'yellow',
            'hp_website': 'https://spamsite.com',  # Bot filled honeypot
        }
        response = self.client.post(reverse('guestbook:submit'), payload)
        self.assertFalse(GuestbookEntry.objects.filter(name='SpamBot 3000').exists())

    def test_ajax_submission_returns_json(self):
        payload = {
            'name': 'Ajax Artist',
            'message': 'Testing ajax sticky pinning',
            'mood': 'rainbow',
            'paper_color': 'blue',
            'hp_website': '',
        }
        response = self.client.post(
            reverse('guestbook:submit'),
            payload,
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('Barnaby will inspect it', data['message'])
