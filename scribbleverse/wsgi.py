"""
WSGI config for scribbleverse project.
Exposes 'application' (standard WSGI) and 'app' (for Vercel serverless runtime).
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scribbleverse.settings')

application = get_wsgi_application()
app = application
