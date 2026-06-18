from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework import status
from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types
import os
import json

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

        if description:
            normalized["customSections"].append({
                "title": title or "Custom Section",
                "description": description,
            })

    return normalized


@api_view(['POST'])
@throttle_classes([AnonRateThrottle])
def parse_resume(request):
    raw_text = request.data.get('raw_text', '')
    resume_type = request.data.get('resume_type', 'experienced')
    
    if not raw_text:
        return Response({"error": "No raw_text provided"}, status=status.HTTP_400_BAD_REQUEST)

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return Response({"error": "Gemini API key is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        client = genai.Client(api_key=api_key)
        
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
        - Return only valid JSON matching the keys below.
        {fresher_rules}

        {{
          "personalInfo": {{"firstName":"","lastName":"","email":"","phone":"","location":"","linkedin":"","website":"","github":"","title":"","summary":""}},
          "experience": [{{"company":"","position":"","location":"","startDate":"","endDate":"","current":false,"description":""}}],
          "education": [{{"institution":"","degree":"","location":"","startDate":"","graduationDate":"","cgpa":"","description":""}}],
          "skills": [{{"name":"","category":"","level":""}}],
          "projects": [{{"name":"","description":"","link":"","highlights":[]}}],
          "certifications": [{{"name":"","issuer":"","date":""}}],
          "achievements": [{{"title":"","organization":"","date":"","description":""}}],
          "customSections": [{{"title":"","description":""}}]
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
        quota_error = None

        for model_name in model_names:
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
            except genai_errors.ClientError as exc:
                if exc.code == 429:
                    quota_error = exc
                else:
                    raise

        if response is None:
            if quota_error:
                raise quota_error
            raise genai_errors.ClientError(
                429, "No Gemini model with available quota is configured."
            )
        
        text_response = response.text
        # Parse and return as native JSON
        parsed_data = normalize_parsed_resume(json.loads(text_response))
        
        return Response(parsed_data, status=status.HTTP_200_OK)

    except genai_errors.ClientError as exc:
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
