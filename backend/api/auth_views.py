import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth import password_validation
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.views.decorators.http import require_GET, require_POST


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

    if not request.user.check_password(current_password):
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
