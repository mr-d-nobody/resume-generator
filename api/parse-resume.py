import os
import sys

# ONLY add the backend directory to sys.path (not the project root).
# This ensures Django's 'api' app resolves to backend/api/ and not this Vercel api/ directory.
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "resume_backend.settings")

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
