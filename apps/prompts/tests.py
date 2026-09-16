from django.test import TestCase, Client
from django.urls import reverse
from .models import DoodlePrompt


class PromptsApiTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.p1 = DoodlePrompt.objects.create(
            text="Draw a cat who is a detective.",
            category="creatures",
            difficulty="playful"
        )
        self.p2 = DoodlePrompt.objects.create(
            text="Draw a planet made of cheese.",
            category="space",
            difficulty="wild"
        )

    def test_random_prompt_api_returns_json(self):
        response = self.client.get(reverse('prompts:random_prompt'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('text', data)
        self.assertIn('category', data)
        self.assertIn('prompts_given_today', data)

    def test_exclude_parameter(self):
        response = self.client.get(f"{reverse('prompts:random_prompt')}?exclude={self.p1.id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['id'], self.p2.id)
