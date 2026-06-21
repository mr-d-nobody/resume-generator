from django.db import models
from django.conf import settings


class SavedResume(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_resume",
    )
    data = models.JSONField(default=dict)
    revision = models.PositiveBigIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume for {self.user}"
