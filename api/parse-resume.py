from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle resume parsing POST requests."""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            raw_text = data.get('raw_text', '')
            resume_type = data.get('resume_type', 'experienced')

            if not raw_text:
                self._send_json(400, {"error": "No raw_text provided"})
                return

            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                self._send_json(500, {"error": "Gemini API key is not configured on the server."})
                return

            genai.configure(api_key=api_key)

            fresher_rules = ""
            if resume_type == 'fresher':
                fresher_rules = """
            6. [CRITICAL] This is a Fresher / Entry-Level resume. You MUST aggressively condense and summarize all descriptions.
            7. Keep experience and project bullet points to an absolute maximum of 2-3 short, impactful lines.
            8. Prioritize fitting everything into a single-page layout. Remove verbose fluff.
                """

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

            parsed_data = json.loads(response.text)
            self._send_json(200, parsed_data)

        except json.JSONDecodeError:
            self._send_json(500, {"error": "Failed to parse AI response into valid JSON."})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _send_json(self, status_code, data):
        """Helper to send a JSON response."""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
