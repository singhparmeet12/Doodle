from django.test import TestCase, Client
from django.urls import reverse
from .models import JournalPost


class JournalTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.post = JournalPost.objects.create(
            title="The Mystery of the Missing 6B Pencil",
            excerpt="Where do all the soft graphite pencils go?",
            body="<p>An investigation was launched under the sofa.</p>",
            is_published=True
        )
        self.draft = JournalPost.objects.create(
            title="Unfinished Doodle Dreams",
            excerpt="A draft post",
            body="<p>Not ready for the world yet.</p>",
            is_published=False
        )

    def test_journal_list_shows_only_published(self):
        response = self.client.get(reverse('journal:list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['page_obj']), 1)
        self.assertEqual(response.context['page_obj'][0].title, "The Mystery of the Missing 6B Pencil")

    def test_journal_detail_view(self):
        response = self.client.get(reverse('journal:detail', kwargs={'slug': self.post.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "The Mystery of the Missing 6B Pencil")
        self.assertContains(response, "An investigation was launched under the sofa.")

    def test_draft_detail_returns_404(self):
        response = self.client.get(reverse('journal:detail', kwargs={'slug': self.draft.slug}))
        self.assertEqual(response.status_code, 404)
