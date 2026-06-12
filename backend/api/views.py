from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework import status
import google.generativeai as genai
import os
import json

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
        genai.configure(api_key=api_key)
        
        fresher_rules = ""
        if resume_type == 'fresher':
            fresher_rules = """
        6. [CRITICAL] This is a Fresher / Entry-Level resume. You MUST aggressively condense and summarize all descriptions.
        7. Keep experience and project bullet points to an absolute maximum of 2-3 short, impactful lines.
        8. Prioritize fitting everything into a single-page layout. Remove verbose fluff.
            """

        # Define the exact JSON schema we want Gemini to return
        prompt = f"""
        You are an expert resume parser. I am going to give you the raw text extracted from a PDF resume.
        Your job is to carefully extract all the relevant information and map it EXACTLY to a JSON structure.
        
        Rules:
        1. If a field is not found in the resume, leave it as an empty string "" (for strings) or an empty array [] (for arrays). Do not invent information.
        2. For "experience.description", combine bullet points into a single string separated by newlines (\\n).
        3. For "skills", try to categorize them logically (e.g., "Languages", "Tools", "Frameworks"). If uncertain, use "Technical Skills".
        4. Make sure dates are formatted cleanly (e.g., "Jan 2020", "2021", "Present").
        5. RETURN ONLY VALID JSON. No markdown backticks, no explanatory text.
        {fresher_rules}
        
        
        Schema Structure required:
        {{
            "personalInfo": {{
                "firstName": "",
                "lastName": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "website": "",
                "github": "",
                "title": "",
                "summary": ""
            }},
            "experience": [
                {{
                    "company": "",
                    "position": "",
                    "location": "",
                    "startDate": "",
                    "endDate": "",
                    "current": false,
                    "description": ""
                }}
            ],
            "education": [
                {{
                    "institution": "",
                    "degree": "",
                    "location": "",
                    "startDate": "",
                    "graduationDate": "",
                    "cgpa": "",
                    "description": ""
                }}
            ],
            "skills": [
                {{
                    "name": "",
                    "category": "",
                    "level": ""
                }}
            ],
            "projects": [
                {{
                    "name": "",
                    "description": "",
                    "link": "",
                    "highlights": []
                }}
            ],
            "certifications": [
                {{
                    "name": "",
                    "issuer": "",
                    "date": ""
                }}
            ]
        }}
        
        Raw Resume Text:
        {raw_text}
        """
        
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
        )
        
        text_response = response.text
        # Parse and return as native JSON
        parsed_data = json.loads(text_response)
        
        return Response(parsed_data, status=status.HTTP_200_OK)

    except json.JSONDecodeError:
        return Response({"error": "Failed to parse AI response into valid JSON."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
