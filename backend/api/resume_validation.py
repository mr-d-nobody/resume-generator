import re
from urllib.parse import urlparse


LIMITS = {
    "name": 80,
    "short": 120,
    "email": 254,
    "phone": 32,
    "url": 500,
    "summary": 1200,
    "description": 3000,
    "grade": 30,
    "list_items": 100,
}
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
MONTH_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def _text(value):
    return value.strip() if isinstance(value, str) else ""


def _valid_url(value):
    raw = _text(value)
    if not raw:
        return True
    if len(raw) > LIMITS["url"]:
        return False
    explicit_scheme = re.match(r"^[a-z][a-z\d+.-]*:", raw, re.I)
    if explicit_scheme and not re.match(r"^https?://", raw, re.I):
        return False
    candidate = raw if re.match(r"^https?://", raw, re.I) else f"https://{raw}"
    parsed = urlparse(candidate)
    try:
        parsed.port
    except ValueError:
        return False
    return parsed.scheme in {"http", "https"} and bool(parsed.hostname) and not re.search(r"\s", parsed.netloc)


def _valid_phone(value):
    raw = _text(value)
    digits = re.sub(r"\D", "", raw)
    return (
        7 <= len(digits) <= 15
        and len(raw) <= LIMITS["phone"]
        and not re.search(r"[a-z]", raw, re.I)
        and bool(re.fullmatch(r"[+\d\s().-]+", raw))
    )


def _valid_grade(value, grade_label=""):
    raw = _text(value)
    if not raw:
        return True
    if len(raw) > LIMITS["grade"]:
        return False
    if _text(grade_label).lower() == "percentage":
        match = re.fullmatch(r"(\d+(?:\.\d+)?)%?", raw)
        return bool(match) and float(match.group(1)) <= 100
    if re.fullmatch(r"(?:[A-F][+-]?|first class|second class|distinction)", raw, re.I):
        return True
    match = re.fullmatch(r"(\d+(?:\.\d+)?)%", raw)
    if match:
        return float(match.group(1)) <= 100
    match = re.fullmatch(r"(\d+(?:\.\d+)?)\s*/\s*(4|5|10|100)", raw)
    if match:
        return float(match.group(1)) <= float(match.group(2))
    return bool(re.fullmatch(r"\d+(?:\.\d+)?", raw)) and float(raw) <= 10


def validate_resume_data(data, require_core=True):
    errors = {}
    resume = data if isinstance(data, dict) else {}
    personal = resume.get("personalInfo") if isinstance(resume.get("personalInfo"), dict) else {}

    def add(path, message):
        errors.setdefault(path, message)

    def check_text(value, path, label, limit, required=False):
        raw = _text(value)
        if required and not raw:
            add(path, f"{label} is required.")
        elif len(raw) > limit:
            add(path, f"{label} must be {limit} characters or fewer.")

    check_text(personal.get("firstName"), "personalInfo.firstName", "First name", LIMITS["name"], require_core)
    check_text(personal.get("lastName"), "personalInfo.lastName", "Last name", LIMITS["name"], require_core)
    check_text(personal.get("email"), "personalInfo.email", "Email", LIMITS["email"], require_core)
    check_text(personal.get("phone"), "personalInfo.phone", "Phone", LIMITS["phone"], require_core)
    check_text(personal.get("summary"), "personalInfo.summary", "Professional summary", LIMITS["summary"])
    check_text(personal.get("location"), "personalInfo.location", "Location", LIMITS["short"])
    email = _text(personal.get("email"))
    if email and not EMAIL_PATTERN.fullmatch(email):
        add("personalInfo.email", "Enter a valid email address.")
    phone = _text(personal.get("phone"))
    if phone and not _valid_phone(phone):
        add("personalInfo.phone", "Enter a valid phone number with 7 to 15 digits.")
    for field in ("linkedin", "website", "github"):
        if not _valid_url(personal.get(field)):
            add(f"personalInfo.{field}", f"{field.title()} must be a valid HTTP or HTTPS URL.")
    experience = resume.get("experience") if isinstance(resume.get("experience"), list) else []
    if len(experience) > LIMITS["list_items"]:
        add("experience", f"Experience is limited to {LIMITS['list_items']} entries.")
    for index, item in enumerate(experience):
        item = item if isinstance(item, dict) else {}
        base = f"experience.{index}"
        check_text(item.get("company"), f"{base}.company", f"Experience {index + 1} company", LIMITS["short"], True)
        check_text(item.get("position"), f"{base}.position", f"Experience {index + 1} position", LIMITS["short"], True)
        check_text(item.get("description"), f"{base}.description", f"Experience {index + 1} description", LIMITS["description"])
        start, end = _text(item.get("startDate")), _text(item.get("endDate"))
        if not start:
            add(f"{base}.startDate", f"Experience {index + 1} start date is required.")
        elif not MONTH_PATTERN.fullmatch(start):
            add(f"{base}.startDate", f"Experience {index + 1} has an invalid start date.")
        if end and not MONTH_PATTERN.fullmatch(end):
            add(f"{base}.endDate", f"Experience {index + 1} has an invalid end date.")
        if not item.get("current") and start and end and end < start:
            add(f"{base}.endDate", f"Experience {index + 1} end date cannot be before its start date.")

    education = resume.get("education") if isinstance(resume.get("education"), list) else []
    for index, item in enumerate(education):
        item = item if isinstance(item, dict) else {}
        base = f"education.{index}"
        check_text(item.get("degree"), f"{base}.degree", f"Education {index + 1} degree", LIMITS["short"], True)
        check_text(item.get("institution"), f"{base}.institution", f"Education {index + 1} institution", LIMITS["short"], True)
        check_text(item.get("description"), f"{base}.description", f"Education {index + 1} description", LIMITS["description"])
        check_text(item.get("location"), f"{base}.location", f"Education {index + 1} location", LIMITS["short"])
        graduation = _text(item.get("graduationDate"))
        if graduation and not MONTH_PATTERN.fullmatch(graduation):
            add(f"{base}.graduationDate", f"Education {index + 1} has an invalid graduation date.")
        if not _valid_grade(item.get("cgpa"), item.get("gradeLabel")):
            add(f"{base}.cgpa", f"Education {index + 1} grade is invalid.")

    for index, item in enumerate(resume.get("skills") if isinstance(resume.get("skills"), list) else []):
        name = item if isinstance(item, str) else item.get("name") if isinstance(item, dict) else ""
        check_text(name, f"skills.{index}.name", f"Skill {index + 1}", LIMITS["short"], True)
    for index, item in enumerate(resume.get("projects") if isinstance(resume.get("projects"), list) else []):
        item = item if isinstance(item, dict) else {}
        base = f"projects.{index}"
        check_text(item.get("name"), f"{base}.name", f"Project {index + 1} name", LIMITS["short"], True)
        check_text(item.get("description"), f"{base}.description", f"Project {index + 1} description", LIMITS["description"])
        highlights = item.get("highlights") if isinstance(item.get("highlights"), list) else []
        if len(highlights) > LIMITS["list_items"]:
            add(f"{base}.highlights", f"Project {index + 1} has too many highlights.")
        check_text("\n".join(_text(value) for value in highlights), f"{base}.highlights", f"Project {index + 1} highlights", LIMITS["description"])
        for link_index, link in enumerate(item.get("links") if isinstance(item.get("links"), list) else []):
            if isinstance(link, dict):
                check_text(link.get("label"), f"{base}.links.{link_index}.label", f"Project {index + 1} link label", LIMITS["short"])
                if not _valid_url(link.get("url")):
                    add(f"{base}.links.{link_index}.url", f"Project {index + 1} link is invalid.")
    for index, item in enumerate(resume.get("certifications") if isinstance(resume.get("certifications"), list) else []):
        item = item if isinstance(item, dict) else {}
        base = f"certifications.{index}"
        check_text(item.get("name"), f"{base}.name", f"Certification {index + 1} name", LIMITS["short"], True)
        check_text(item.get("issuer"), f"{base}.issuer", f"Certification {index + 1} issuer", LIMITS["short"])
        check_text(item.get("description"), f"{base}.description", f"Certification {index + 1} description", LIMITS["description"])
        if not _valid_url(item.get("url")):
            add(f"{base}.url", f"Certification {index + 1} URL is invalid.")
        issue, expiration = _text(item.get("date")), _text(item.get("expirationDate"))
        if issue and not MONTH_PATTERN.fullmatch(issue):
            add(f"{base}.date", f"Certification {index + 1} issue date is invalid.")
        if expiration and not MONTH_PATTERN.fullmatch(expiration):
            add(f"{base}.expirationDate", f"Certification {index + 1} expiration date is invalid.")
        if issue and expiration and expiration < issue:
            add(f"{base}.expirationDate", f"Certification {index + 1} expiration cannot be before its issue date.")

    for index, item in enumerate(resume.get("achievements") if isinstance(resume.get("achievements"), list) else []):
        item = item if isinstance(item, dict) else {}
        base = f"achievements.{index}"
        check_text(item.get("title"), f"{base}.title", f"Achievement {index + 1} title", LIMITS["short"], True)
        check_text(item.get("organization"), f"{base}.organization", f"Achievement {index + 1} organization", LIMITS["short"])
        check_text(item.get("description"), f"{base}.description", f"Achievement {index + 1} description", LIMITS["description"])
        date = _text(item.get("date"))
        if date and not MONTH_PATTERN.fullmatch(date):
            add(f"{base}.date", f"Achievement {index + 1} date is invalid.")

    for index, item in enumerate(resume.get("customSections") if isinstance(resume.get("customSections"), list) else []):
        item = item if isinstance(item, dict) else {}
        base = f"customSections.{index}"
        check_text(item.get("title"), f"{base}.title", f"Custom section {index + 1} heading", LIMITS["short"], True)
        check_text(item.get("description"), f"{base}.description", f"Custom section {index + 1} description", LIMITS["description"])
        for entry_index, entry in enumerate(item.get("entries") if isinstance(item.get("entries"), list) else []):
            if not isinstance(entry, dict):
                continue
            entry_base = f"{base}.entries.{entry_index}"
            check_text(entry.get("title"), f"{entry_base}.title", f"Custom entry {entry_index + 1} title", LIMITS["short"])
            check_text(entry.get("description"), f"{entry_base}.description", f"Custom entry {entry_index + 1} description", LIMITS["description"])
            if not _valid_url(entry.get("url")):
                add(f"{entry_base}.url", f"Custom entry {entry_index + 1} URL is invalid.")

    return errors
