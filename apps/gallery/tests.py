from django.test import TestCase, Client
from django.urls import reverse
from .models import Doodle


class GalleryTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.doodle1 = Doodle.objects.create(
            title="Barnaby at Sunrise",
            caption="First morning drawing",
            character_tag="barnaby",
            svg_content="<svg></svg>"
        )
        self.doodle2 = Doodle.objects.create(
            title="Pip Sharpens Beak",
            caption="Morning sharpening ritual",
            character_tag="pip",
            svg_content="<svg></svg>"
        )

    def test_doodle_slug_auto_generation(self):
        self.assertEqual(self.doodle1.slug, "barnaby-at-sunrise")
        self.assertNotEqual(self.doodle1.tilt_deg, 0)

    def test_gallery_list_and_filter(self):
        # All
        response = self.client.get(reverse('gallery:list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['page_obj']), 2)

        # Filter by Pip
        response_pip = self.client.get(reverse('gallery:list') + '?tag=pip')
        self.assertEqual(response_pip.status_code, 200)
        self.assertEqual(len(response_pip.context['page_obj']), 1)
        self.assertEqual(response_pip.context['page_obj'][0].title, "Pip Sharpens Beak")

    def test_gallery_detail(self):
        response = self.client.get(reverse('gallery:detail', kwargs={'slug': self.doodle1.slug}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Barnaby at Sunrise")

    def test_gallery_json_api(self):
        response = self.client.get(reverse('gallery:json', kwargs={'slug': self.doodle1.slug}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['title'], "Barnaby at Sunrise")
        self.assertEqual(data['caption'], "First morning drawing")
