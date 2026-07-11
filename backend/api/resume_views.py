import json

from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods

from .models import SavedResume
from .resume_validation import validate_resume_data


MAX_RESUME_BYTES = 1024 * 1024


def _error(message, status=400, field_errors=None):
    payload = {"error": message}
    if field_errors:
        payload["fieldErrors"] = field_errors
    return JsonResponse(payload, status=status)


@require_http_methods(["GET", "PUT", "DELETE"])
@csrf_protect
def saved_resume(request):
    if not request.user.is_authenticated:
        return _error("Authentication required.", status=401)

    if request.method == "DELETE":
        deleted, _ = SavedResume.objects.filter(user=request.user).delete()
        return JsonResponse({"deleted": bool(deleted), "detail": "Saved resume deleted."})

    if request.method == "GET":
        record = SavedResume.objects.filter(user=request.user).first()
        if record is None:
            return JsonResponse({
                "exists": False,
                "data": None,
                "revision": 0,
                "updatedAt": None,
            })
        return JsonResponse({
            "exists": True,
            "data": record.data,
            "revision": record.revision,
            "updatedAt": record.updated_at.isoformat(),
        })

    if len(request.body) > MAX_RESUME_BYTES:
        return _error("Resume data is too large.", status=413)

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return _error("Invalid JSON request.")

    data = payload.get("data")
    if not isinstance(data, dict):
        return _error("Resume data must be a JSON object.")
    resume_data = data.get("resumeData")
    field_errors = validate_resume_data(resume_data, require_core=True)
    if field_errors:
        return _error(
            "Correct the invalid resume fields before saving.",
            status=422,
            field_errors=field_errors,
        )
    expected_revision = payload.get("expectedRevision", 0)
    if not isinstance(expected_revision, int) or expected_revision < 0:
        return _error("expectedRevision must be a non-negative integer.")

    encoded = json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    if len(encoded) > MAX_RESUME_BYTES:
        return _error("Resume data is too large.", status=413)

    with transaction.atomic():
        record = SavedResume.objects.select_for_update().filter(user=request.user).first()
        current_revision = record.revision if record else 0
        if expected_revision != current_revision:
            return JsonResponse({
                "error": "This resume was updated from another device.",
                "conflict": True,
                "current": {
                    "data": record.data if record else None,
                    "revision": current_revision,
                    "updatedAt": record.updated_at.isoformat() if record else None,
                },
            }, status=409)

        if record is None:
            record = SavedResume.objects.create(
                user=request.user,
                data=data,
                revision=1,
            )
        else:
            record.data = data
            record.revision += 1
            record.save(update_fields=["data", "revision", "updated_at"])

    return JsonResponse({
        "saved": True,
        "revision": record.revision,
        "updatedAt": record.updated_at.isoformat(),
    })
