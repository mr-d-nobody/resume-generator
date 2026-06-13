import os
import sys

# Add the project root directory and backend directory to sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, 'backend')
sys.path.append(root_dir)
sys.path.append(backend_dir)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "resume_backend.settings")

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
