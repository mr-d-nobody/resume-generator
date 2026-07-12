from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types
import os
import json
import time

from .rate_limits import client_ip, consume_rate_limit

STANDARD_SECTION_NAMES = (
    "Personal Info",
    "Summary",
    "Experience",
    "Education",
    "Skills",
    "Projects",
    "Certifications",
    "Achievements",
)

TRANSIENT_GEMINI_STATUS_CODES = {429, 500, 502, 503, 504}
EMPTY_PLACEHOLDERS = {
    "", "none", "null", "undefined", "n/a", "na",
    "not available", "not applicable", "nil", "-",
}


def clean_optional_text(value):
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in EMPTY_PLACEHOLDERS else text


def is_transient_gemini_error(exc):
    return getattr(exc, "code", None) in TRANSIENT_GEMINI_STATUS_CODES


def normalize_project_highlights(description, highlights):
    if not isinstance(highlights, list):
        return []

    description_key = " ".join(description.lower().split())
    cleaned = [clean_optional_text(item) for item in highlights]
    cleaned = [item for item in cleaned if item]
    joined_key = " ".join("\n".join(cleaned).lower().split())
    if description_key and joined_key == description_key:
        return []

    result = []
    seen = set()
    for highlight in cleaned:
        key = " ".join(highlight.lower().split())
        if not key or key == description_key or key in seen:
            continue
        seen.add(key)
        result.append(highlight)
    return result


def normalize_parsed_resume(parsed_data):
    """Keep the API contract small and make custom-section naming deterministic."""
    if not isinstance(parsed_data, dict):
        parsed_data = {}

    normalized = {
        "personalInfo": parsed_data.get("personalInfo") if isinstance(parsed_data.get("personalInfo"), dict) else {},
        "experience": parsed_data.get("experience") if isinstance(parsed_data.get("experience"), list) else [],
        "education": parsed_data.get("education") if isinstance(parsed_data.get("education"), list) else [],
        "skills": parsed_data.get("skills") if isinstance(parsed_data.get("skills"), list) else [],
        "projects": parsed_data.get("projects") if isinstance(parsed_data.get("projects"), list) else [],
        "certifications": parsed_data.get("certifications") if isinstance(parsed_data.get("certifications"), list) else [],
        "achievements": parsed_data.get("achievements") if isinstance(parsed_data.get("achievements"), list) else [],
        "customSections": [],
    }

    personal_info = normalized["personalInfo"]
    personal_info.pop("photo", None)
    links = personal_info.get("links")
    if not isinstance(links, list):
        links = []
    personal_info["links"] = [
        {
            "label": clean_optional_text(link.get("label", "")),
            "url": clean_optional_text(link.get("url", "")),
        }
        for link in links
        if isinstance(link, dict) and clean_optional_text(link.get("url", ""))
    ]

    normalized_certifications = []
    for certification in normalized["certifications"]:
        if not isinstance(certification, dict):
            continue
        normalized_certification = {
            "name": clean_optional_text(certification.get("name", "")),
            "issuer": clean_optional_text(certification.get("issuer", "")),
            "date": clean_optional_text(certification.get("date", "")),
            "expirationDate": clean_optional_text(certification.get("expirationDate", "")),
            "credentialId": clean_optional_text(
                certification.get("credentialId", certification.get("credentialID", ""))
            ),
            "url": clean_optional_text(
                certification.get(
                    "url",
                    certification.get("credentialURL", certification.get("certificateURL", "")),
                )
            ),
            "linkLabel": clean_optional_text(certification.get("linkLabel", "")) or "Verify",
            "description": clean_optional_text(certification.get("description", "")),
        }
        if any(normalized_certification[field] for field in (
            "name", "issuer", "date", "expirationDate",
            "credentialId", "url", "description",
        )):
            normalized_certifications.append(normalized_certification)
    normalized["certifications"] = normalized_certifications

    normalized_projects = []
    for project in normalized["projects"]:
        if not isinstance(project, dict):
            continue
        description = clean_optional_text(project.get("description", ""))
        links = project.get("links")
        if not isinstance(links, list):
            links = []
        normalized_links = [
            {
                "label": clean_optional_text(link.get("label", "")),
                "url": clean_optional_text(link.get("url", "")),
            }
            for link in links
            if isinstance(link, dict) and clean_optional_text(link.get("url", ""))
        ]
        legacy_url = clean_optional_text(project.get("link", ""))
        if legacy_url and not any(link["url"] == legacy_url for link in normalized_links):
            normalized_links.insert(0, {
                "label": clean_optional_text(project.get("linkLabel", "")) or "Live Demo",
                "url": legacy_url,
            })
        normalized_projects.append({
            **project,
            "name": clean_optional_text(project.get("name", "")),
            "description": description,
            "highlights": normalize_project_highlights(description, project.get("highlights")),
            "links": normalized_links,
        })
    normalized["projects"] = normalized_projects

    custom_sections = parsed_data.get("customSections")
    if not isinstance(custom_sections, list):
        custom_sections = []

    for section in custom_sections:
        if not isinstance(section, dict):
            continue

        title = section.get("title")
        title = title.strip() if isinstance(title, str) else ""

        description = section.get("description", section.get("content", ""))
        if isinstance(description, list):
            description = "\n".join(str(item).strip() for item in description if str(item).strip())
        elif not isinstance(description, str):
            description = str(description or "")
        description = description.strip()
        links = section.get("links")
        if not isinstance(links, list):
            links = []
        links = [
            {
                "label": clean_optional_text(link.get("label", "")) or "Profile",
                "url": clean_optional_text(link.get("url", "")),
            }
            for link in links
            if isinstance(link, dict) and clean_optional_text(link.get("url", ""))
        ]
        entries = section.get("entries")
        if not isinstance(entries, list):
            entries = []
        entries = [
            {
                "title": clean_optional_text(entry.get("title", "")),
                "description": clean_optional_text(
                    entry.get("description", entry.get("details", ""))
                ),
                "url": clean_optional_text(entry.get("url", "")),
                "linkLabel": clean_optional_text(entry.get("linkLabel", ""))
                or clean_optional_text(entry.get("title", ""))
                or "Profile",
            }
            for entry in entries
            if isinstance(entry, dict)
            and any(clean_optional_text(entry.get(key, "")) for key in ("title", "description", "details", "url"))
        ]

        if description or links or entries:
            normalized_section = {
                "title": title or "Custom Section",
                "description": description,
            }
            if links:
                normalized_section["links"] = links
            if entries:
                normalized_section["entries"] = entries
            normalized["customSections"].append(normalized_section)

    return normalized


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_resume(request):
    content_length = int(request.META.get('CONTENT_LENGTH') or 0)
    if content_length > settings.AI_MAX_REQUEST_BYTES:
        return Response({"error": "Resume parsing request is too large."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

    for scope, identity, limit in (
        ('ai-user', request.user.pk, settings.AI_USER_RATE_LIMIT),
        ('ai-ip', client_ip(request), settings.AI_IP_RATE_LIMIT),
    ):
        allowed, retry_after = consume_rate_limit(scope, identity, limit, settings.AI_RATE_WINDOW_SECONDS)
        if not allowed:
            return Response(
                {"error": "Resume parsing limit reached. Use manual entry or try again after the limit resets.", "code": "ai_rate_limited"},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(retry_after)},
            )

    raw_text = request.data.get('raw_text', '')
    resume_type = request.data.get('resume_type', 'experienced')
    
    if not raw_text:
        return Response({"error": "No raw_text provided"}, status=status.HTTP_400_BAD_REQUEST)
    if not isinstance(raw_text, str) or len(raw_text) > settings.AI_MAX_TEXT_CHARS:
        return Response({"error": "Extracted resume text is too large."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return Response({"error": "Gemini API key is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        client = genai.Client(
            api_key=api_key,
            http_options=genai_types.HttpOptions(timeout=int(os.environ.get('GEMINI_TIMEOUT_MS', '20000'))),
        )
        
        fresher_rules = ""
        if resume_type == 'fresher':
            fresher_rules = """
        This is a fresher/entry-level resume. Condense experience and project
        descriptions to at most 2-3 short bullets without inventing facts.
            """

        prompt = f"""
        Extract this resume into compact JSON. Return data only; never return
        presentation, typography, HTML, markdown, or styling instructions.

        The only standard section categories are:
        {", ".join(STANDARD_SECTION_NAMES)}.

        Classification rules:
        - Map a source section to a standard category only when it is clearly
          that category or a direct synonym.
        - Summary belongs in personalInfo.summary.
        - Every source section outside those eight categories is a custom
          section. Do not squeeze it into the closest standard category.
        - Preserve each custom section's source heading exactly when it is
          identifiable. If it is unclear, use "Custom Section".
        - Keep separate non-standard source sections as separate customSections.
        - Put custom content in description with bullets separated by "\\n".
        - Use empty strings/arrays for missing data and never invent facts.
        - Preserve the candidate's professional headline/tagline exactly in
          personalInfo.title, including multiple roles and separators such as
          "FULL-STACK DEVELOPER • AI/ML • BACKEND DEVELOPER".
        - Put LinkedIn, GitHub, and a primary website in their legacy
          personalInfo fields. Put collections of other profiles (LeetCode,
          Codeforces, HackerRank, AtCoder, CodeChef, Kaggle, Behance, etc.) in
          an appropriate customSections entry with label/URL pairs in links.
          Preserve the source section heading when available.
        - For profile collections and other repeated custom content, create one
          structured entry per source row in customSections.entries. Keep the
          entry's title, details, URL, and visible link label together. Example:
          LeetCode + "100+ DSA problems solved" + its LeetCode URL is one entry;
          AtCoder and Chess.com are separate entries. Do not return these as
          unrelated description bullets plus a detached links array.
        - The input may include an "Embedded hyperlinks" list extracted from
          clickable PDF annotations. Use those URLs even when the visible
          resume text only says "LeetCode", "GitHub", "Live Demo", or "Verify".
        - For projects, keep description as a short overview and highlights as
          separate bullet points or technologies. Never copy description into
          highlights. If the source has no highlights, return an empty list.
          Preserve every URL in projects.links and preserve the
          author's visible hyperlink label when identifiable. If only a URL is
          available, infer a useful label: "GitHub" for GitHub repositories,
          otherwise "Live Demo". Never use the generic label "Link".
        - Preserve certificate verification URLs, credential IDs, descriptions,
          issue dates, expiration dates, and visible verify-link labels. Match
          certificate/credential URLs from embedded hyperlinks to the relevant
          certificate whenever the surrounding text or domain makes it clear.
        - Return only valid JSON matching the keys below.
        {fresher_rules}

        {{
          "personalInfo": {{"firstName":"","lastName":"","email":"","phone":"","location":"","linkedin":"","website":"","github":"","links":[{{"label":"","url":""}}],"title":"","summary":""}},
          "experience": [{{"company":"","position":"","location":"","startDate":"","endDate":"","current":false,"description":""}}],
          "education": [{{"institution":"","degree":"","location":"","startDate":"","graduationDate":"","cgpa":"","description":""}}],
          "skills": [{{"name":"","category":"","level":""}}],
          "projects": [{{"name":"","description":"","links":[{{"label":"Live Demo","url":""}}],"highlights":[]}}],
          "certifications": [{{"name":"","issuer":"","date":"","expirationDate":"","credentialId":"","url":"","linkLabel":"Verify","description":""}}],
          "achievements": [{{"title":"","organization":"","date":"","description":""}}],
          "customSections": [{{"title":"","description":"","entries":[{{"title":"","description":"","url":"","linkLabel":""}}]}}]
        }}

        Resume text:
        {raw_text}
        """
        
        # Pin models instead of using "latest", whose target and quota pool can
        # change without notice. Fall back only when a model's quota is busy.
        configured_models = os.environ.get(
            'GEMINI_MODELS',
            os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash-lite,gemini-2.0-flash-lite'),
        )
        model_names = [name.strip() for name in configured_models.split(',') if name.strip()]
        response = None
        transient_error = None
        attempts_per_model = max(1, int(os.environ.get('GEMINI_RETRY_ATTEMPTS', '2')))

        for model_name in model_names:
            for attempt in range(attempts_per_model):
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=genai_types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.1,
                        ),
                    )
                    break
                except genai_errors.APIError as exc:
                    if not is_transient_gemini_error(exc):
                        raise
                    transient_error = exc
                    if attempt < attempts_per_model - 1:
                        time.sleep(0.75 * (attempt + 1))

            if response is not None:
                break

        if response is None:
            if transient_error:
                raise transient_error
            return Response(
                {
                    "error": "No Gemini model is configured for resume parsing.",
                    "code": "ai_model_not_configured",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        
        text_response = response.text
        # Parse and return as native JSON
        parsed_data = normalize_parsed_resume(json.loads(text_response))
        
        return Response(parsed_data, status=status.HTTP_200_OK)

    except genai_errors.APIError as exc:
        if exc.code == 429:
            return Response(
                {
                    "error": (
                        "Gemini API quota has been reached. Wait for the quota to reset "
                        "or configure a Gemini API key with available quota, then try again."
                    ),
                    "code": "ai_quota_exceeded",
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        elif exc.code in {500, 502, 503, 504}:
            return Response(
                {
                    "error": (
                        "Gemini is temporarily busy. The app tried the configured "
                        "fallback models, but none were available. Please wait a "
                        "moment and try again."
                    ),
                    "code": "ai_temporarily_unavailable",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        elif exc.code == 403:
            return Response(
                {
                    "error": "The configured Gemini API key is invalid or does not have permission to use this model.",
                    "code": "ai_permission_denied",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        elif exc.code == 400:
            return Response(
                {
                    "error": f"Gemini could not process this resume: {exc}",
                    "code": "ai_invalid_request",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            return Response(
                {"error": f"Gemini API error: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    except json.JSONDecodeError:
        return Response({"error": "Failed to parse AI response into valid JSON."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
