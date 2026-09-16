from django.test import TestCase, Client
from django.urls import reverse
from apps.gallery.models import Doodle
from apps.prompts.models import DoodlePrompt
from apps.guestbook.models import GuestbookEntry


class CoreViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.doodle = Doodle.objects.create(
            title="Test Doodle",
            caption="Testing doodle",
            character_tag="barnaby",
            is_featured=True
        )
        self.prompt = DoodlePrompt.objects.create(
            text="Draw a smiling mountain.",
            category="creatures"
        )
        self.entry = GuestbookEntry.objects.create(
            name="Alice",
            message="Hello world note",
            is_approved=True
        )

    def test_homepage_status_and_context(self):
        response = self.client.get(reverse('core:home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'core/home.html')
        self.assertIn('featured_doodles', response.context)
        self.assertIn('TOTAL_DOODLES', response.context)
        self.assertGreaterEqual(response.context['TOTAL_DOODLES'], 1)

    def test_about_page_status(self):
        response = self.client.get(reverse('core:about'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'core/about.html')
        self.assertContains(response, 'Barnaby the Blob')

    def test_draw_page_status(self):
        response = self.client.get(reverse('core:draw'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'draw/index.html')
        self.assertContains(response, 'doodle-canvas')
