#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'resume_backend.settings')
    # The repository also has a top-level Vercel `api/` directory. Explicitly
    # seed Django's app test label so `manage.py test` does not discover that
    # serverless directory and silently report zero tests.
    if len(sys.argv) >= 2 and sys.argv[1] == 'test':
        options_with_values = {
            '-v', '--verbosity', '--parallel', '--pattern', '--top-level-directory',
            '--testrunner', '--shuffle', '--durations',
        }
        labels = []
        skip_next = False
        for argument in sys.argv[2:]:
            if skip_next:
                skip_next = False
                continue
            if argument in options_with_values:
                skip_next = True
                continue
            if not argument.startswith('-'):
                labels.append(argument)
        if not labels:
            sys.argv.append('api.tests')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
