import os
import sys

# Add the backend directory to sys.path so Django modules are found
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from resume_backend.wsgi import application as app
