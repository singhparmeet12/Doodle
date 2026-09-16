import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
root_path = Path(__file__).resolve().parent.parent
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scribbleverse.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
app = application
