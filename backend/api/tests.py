from django.test import SimpleTestCase

from .views import normalize_parsed_resume


class NormalizeParsedResumeTests(SimpleTestCase):
    def test_preserves_custom_heading_and_content(self):
        result = normalize_parsed_resume({
            "personalInfo": {"firstName": "Ada"},
            "customSections": [{
                "title": "Extra Curricular Activities",
                "description": "Led the robotics club\nOrganized a hackathon",
            }],
        })

        self.assertEqual(result["personalInfo"]["firstName"], "Ada")
        self.assertEqual(result["customSections"], [{
            "title": "Extra Curricular Activities",
            "description": "Led the robotics club\nOrganized a hackathon",
        }])

    def test_uses_fallback_title_without_reclassifying_content(self):
        result = normalize_parsed_resume({
            "achievements": [],
            "customSections": [{
                "title": "   ",
                "content": ["Mentored first-year students", "Ran weekly workshops"],
            }],
        })

        self.assertEqual(result["achievements"], [])
        self.assertEqual(result["customSections"], [{
            "title": "Custom Section",
            "description": "Mentored first-year students\nRan weekly workshops",
        }])
