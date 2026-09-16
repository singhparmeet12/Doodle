from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config


class Command(BaseCommand):
    help = 'Creates a default superuser for Django admin moderation if one does not exist.'

    def handle(self, *args, **options):
        User = get_user_model()
        username = config('ADMIN_USERNAME', default='barnaby_admin')
        email = config('ADMIN_EMAIL', default='barnaby@scribbleverse.art')
        password = config('ADMIN_PASSWORD', default='wobblycrayons2026')

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(
                f"Superuser '{username}' created successfully!\n"
                f"Username: {username}\n"
                f"Password: {password}\n"
                f"Login at: /admin/"
            ))
        else:
            self.stdout.write(self.style.WARNING(f"Superuser '{username}' already exists."))
