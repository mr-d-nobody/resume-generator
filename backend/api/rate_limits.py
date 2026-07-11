import hashlib
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import RateLimitBucket


def client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return (forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "")) or "unknown"


def _hashed_key(scope, identity):
    return hashlib.sha256(f"{scope}:{identity}".encode("utf-8")).hexdigest()


def consume_rate_limit(scope, identity, limit, window_seconds):
    """Return (allowed, retry_after_seconds) using the existing SQL database."""
    key = _hashed_key(scope, identity)
    now = timezone.now()
    window = timedelta(seconds=window_seconds)

    for attempt in range(2):
        try:
            with transaction.atomic():
                bucket = RateLimitBucket.objects.select_for_update().filter(key=key).first()
                if bucket is None:
                    RateLimitBucket.objects.create(key=key, window_start=now, count=1)
                    return True, 0
                elapsed = now - bucket.window_start
                if elapsed >= window:
                    bucket.window_start = now
                    bucket.count = 1
                    bucket.save(update_fields=["window_start", "count", "updated_at"])
                    return True, 0
                if bucket.count >= limit:
                    return False, max(1, int((window - elapsed).total_seconds()))
                bucket.count += 1
                bucket.save(update_fields=["count", "updated_at"])
                return True, 0
        except IntegrityError:
            if attempt:
                raise
    return False, window_seconds
