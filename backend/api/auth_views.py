import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth import password_validation
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.views.decorators.http import require_GET, require_POST
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from .models import SavedResume
from .rate_limits import client_ip, consume_rate_limit


User = get_user_model()


def _read_json(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def _user_payload(user):
    return {
        "id": user.pk,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "hasPassword": user.has_usable_password(),
    }


def _error(message, *, status=400, field_errors=None):
    payload = {"error": message}
    if field_errors:
        payload["fieldErrors"] = field_errors
    return JsonResponse(payload, status=status)


@require_GET
@ensure_csrf_cookie
def csrf_cookie(request):
    return JsonResponse({"detail": "CSRF cookie set."})


@require_GET
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False, "user": None})
    return JsonResponse({
        "authenticated": True,
        "user": _user_payload(request.user),
    })


@require_POST
@csrf_protect
def signup(request):
    data = _read_json(request)
    if data is None:
        return _error("Invalid JSON request.")

    first_name = str(data.get("firstName", "")).strip()
    last_name = str(data.get("lastName", "")).strip()
    email = User.objects.normalize_email(str(data.get("email", "")).strip()).lower()
    password = str(data.get("password", ""))
    confirm_password = str(data.get("confirmPassword", ""))
    field_errors = {}

    if not first_name:
        field_errors["firstName"] = "First name is required."
    if not email or "@" not in email:
        field_errors["email"] = "Enter a valid email address."
    elif len(email) > User._meta.get_field("username").max_length:
        field_errors["email"] = "Email address is too long."
    elif User.objects.filter(email__iexact=email).exists():
        field_errors["email"] = "An account with this email already exists."
    if password != confirm_password:
        field_errors["confirmPassword"] = "Passwords do not match."

    provisional_user = User(
        username=email,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    if password:
        try:
            password_validation.validate_password(password, provisional_user)
        except ValidationError as exc:
            field_errors["password"] = " ".join(exc.messages)
    else:
        field_errors["password"] = "Password is required."

    if field_errors:
        return _error("Please correct the highlighted fields.", field_errors=field_errors)

    with transaction.atomic():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

    login(request, user)
    return JsonResponse({"user": _user_payload(user)}, status=201)


@require_POST
@csrf_protect
def login_user(request):
    data = _read_json(request)
    if data is None:
        return _error("Invalid JSON request.")

    email = User.objects.normalize_email(str(data.get("email", "")).strip()).lower()
    password = str(data.get("password", ""))
    identities = [
        ("login-ip", client_ip(request)),
        ("login-account", email or "missing-email"),
    ]
    for scope, identity in identities:
        allowed, retry_after = consume_rate_limit(
            scope, identity, settings.LOGIN_RATE_LIMIT, settings.LOGIN_RATE_WINDOW_SECONDS
        )
        if not allowed:
            response = _error("Too many login attempts. Wait before trying again.", status=429)
            response["Retry-After"] = str(retry_after)
            return response
    user_record = User.objects.filter(email__iexact=email).first()
    user = authenticate(
        request,
        username=user_record.username if user_record else email,
        password=password,
    )

    if user is None or not user.is_active:
        return _error("Email or password is incorrect.", status=401)

    login(request, user)
    return JsonResponse({"user": _user_payload(user)})


@require_POST
@csrf_protect
def google_login(request):
    data = _read_json(request)
    if data is None:
        return _error("Invalid JSON request.")

    credential = str(data.get("credential", "")).strip()
    if not credential:
        return _error("Google sign-in did not return a credential.")
    if not settings.GOOGLE_CLIENT_ID:
        return _error("Google sign-in is not configured yet.", status=503)

    try:
        token_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except (ValueError, TypeError):
        return _error("We could not verify your Google account.", status=401)

    if not token_info.get("email_verified"):
        return _error("Your Google email address must be verified.", status=401)

    email = User.objects.normalize_email(str(token_info.get("email", "")).strip()).lower()
    if not email or "@" not in email:
        return _error("Google did not provide a valid email address.", status=401)

    user = User.objects.filter(email__iexact=email).first()
    if user is not None:
        if not user.is_active:
            return _error("This account is inactive.", status=403)
        changed_fields = []
        first_name = str(token_info.get("given_name", "")).strip()
        last_name = str(token_info.get("family_name", "")).strip()
        if not user.first_name and first_name:
            user.first_name = first_name
            changed_fields.append("first_name")
        if not user.last_name and last_name:
            user.last_name = last_name
            changed_fields.append("last_name")
        if changed_fields:
            user.save(update_fields=changed_fields)
    else:
        user = User(
            username=email,
            email=email,
            first_name=str(token_info.get("given_name", "")).strip(),
            last_name=str(token_info.get("family_name", "")).strip(),
        )
        user.set_unusable_password()
        user.save()

    login(request, user)
    return JsonResponse({"user": _user_payload(user)})


@require_POST
@csrf_protect
def logout_user(request):
    logout(request)
    return JsonResponse({"detail": "Signed out successfully."})


@require_POST
@csrf_protect
def change_password(request):
    if not request.user.is_authenticated:
        return _error("Authentication required.", status=401)

    data = _read_json(request)
    if data is None:
        return _error("Invalid JSON request.")

    current_password = str(data.get("currentPassword", ""))
    new_password = str(data.get("newPassword", ""))
    confirm_password = str(data.get("confirmPassword", ""))
    field_errors = {}

    if request.user.has_usable_password() and not request.user.check_password(current_password):
        field_errors["currentPassword"] = "Current password is incorrect."
    if new_password != confirm_password:
        field_errors["confirmPassword"] = "New passwords do not match."
    if new_password:
        try:
            password_validation.validate_password(new_password, request.user)
        except ValidationError as exc:
            field_errors["newPassword"] = " ".join(exc.messages)
    else:
        field_errors["newPassword"] = "New password is required."

    if field_errors:
        return _error("Please correct the highlighted fields.", field_errors=field_errors)

    request.user.set_password(new_password)
    request.user.save(update_fields=["password"])
    update_session_auth_hash(request, request.user)
    return JsonResponse({"detail": "Password changed successfully."})


@require_GET
def export_account_data(request):
    if not request.user.is_authenticated:
        return _error("Authentication required.", status=401)
    saved_resume = SavedResume.objects.filter(user=request.user).first()
    return JsonResponse({
        "exportedAt": timezone.now().isoformat(),
        "account": _user_payload(request.user),
        "resume": {
            "data": saved_resume.data if saved_resume else None,
            "revision": saved_resume.revision if saved_resume else 0,
            "updatedAt": saved_resume.updated_at.isoformat() if saved_resume else None,
        },
    })


@require_POST
@csrf_protect
def delete_account(request):
    if not request.user.is_authenticated:
        return _error("Authentication required.", status=401)
    data = _read_json(request)
    if data is None:
        return _error("Invalid JSON request.")
    password = str(data.get("password", ""))
    if request.user.has_usable_password() and not request.user.check_password(password):
        return _error("Password is incorrect.", status=400, field_errors={"password": "Enter your current password to delete the account."})
    user = request.user
    logout(request)
    user.delete()
    return JsonResponse({"detail": "Account and saved resume deleted."})
