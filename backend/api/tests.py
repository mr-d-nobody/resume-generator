import json

from django.contrib.auth import get_user_model
from django.test import Client, SimpleTestCase, TestCase
from django.test import override_settings

from .views import is_transient_gemini_error, normalize_parsed_resume
from .models import SavedResume
from .resume_validation import validate_resume_data


class NormalizeParsedResumeTests(SimpleTestCase):
    def test_classifies_temporary_gemini_failures_for_retry(self):
        temporary_error = type("TemporaryError", (), {"code": 503})()
        invalid_request = type("InvalidRequest", (), {"code": 400})()

        self.assertTrue(is_transient_gemini_error(temporary_error))
        self.assertFalse(is_transient_gemini_error(invalid_request))

    def test_preserves_flexible_links_and_certificate_details(self):
        result = normalize_parsed_resume({
            "personalInfo": {
                "links": [{"label": "LeetCode", "url": "leetcode.com/ada"}],
            },
            "certifications": [{
                "name": "Cloud",
                "credentialURL": "example.com/verify",
                "credentialID": "ABC-123",
            }],
        })

        self.assertEqual(result["personalInfo"]["links"], [{
            "label": "LeetCode",
            "url": "leetcode.com/ada",
        }])
        self.assertEqual(result["certifications"][0]["url"], "example.com/verify")
        self.assertEqual(result["certifications"][0]["credentialId"], "ABC-123")

    def test_removes_legacy_profile_photo(self):
        result = normalize_parsed_resume({
            "personalInfo": {
                "firstName": "Ada",
                "photo": "data:image/png;base64,legacy-photo",
            },
        })

        self.assertNotIn("photo", result["personalInfo"])

    def test_removes_empty_placeholders_from_optional_fields(self):
        result = normalize_parsed_resume({
            "certifications": [
                {
                    "name": "Cloud Certificate",
                    "issuer": "Example",
                    "date": "None",
                    "expirationDate": None,
                    "credentialId": "null",
                    "url": "N/A",
                    "description": "undefined",
                },
                {
                    "name": "None",
                    "issuer": None,
                    "date": "N/A",
                },
            ],
            "customSections": [{
                "title": "Profiles",
                "entries": [{
                    "title": "LeetCode",
                    "description": "100 problems solved",
                    "url": "None",
                }],
            }],
        })

        self.assertEqual(len(result["certifications"]), 1)
        self.assertEqual(result["certifications"][0]["date"], "")
        self.assertEqual(result["certifications"][0]["credentialId"], "")
        self.assertEqual(result["certifications"][0]["url"], "")
        self.assertEqual(result["certifications"][0]["description"], "")
        self.assertEqual(result["customSections"][0]["entries"][0]["url"], "")

    def test_preserves_project_link_labels(self):
        result = normalize_parsed_resume({
            "projects": [{
                "name": "Portfolio",
                "links": [
                    {"label": "Live Demo", "url": "portfolio.example.com"},
                    {"label": "GitHub", "url": "github.com/ada/portfolio"},
                ],
            }],
        })

        self.assertEqual(result["projects"][0]["links"], [
            {"label": "Live Demo", "url": "portfolio.example.com"},
            {"label": "GitHub", "url": "github.com/ada/portfolio"},
        ])

    def test_preserves_links_inside_custom_sections(self):
        result = normalize_parsed_resume({
            "customSections": [{
                "title": "Competitive Programming Profiles",
                "links": [
                    {"label": "LeetCode", "url": "leetcode.com/ada"},
                    {"label": "Codeforces", "url": "codeforces.com/profile/ada"},
                ],
            }],
        })

        self.assertEqual(result["customSections"][0]["links"], [
            {"label": "LeetCode", "url": "leetcode.com/ada"},
            {"label": "Codeforces", "url": "codeforces.com/profile/ada"},
        ])

    def test_preserves_structured_custom_entries(self):
        result = normalize_parsed_resume({
            "customSections": [{
                "title": "Competitive & Analytical Profile",
                "entries": [
                    {
                        "title": "LeetCode",
                        "description": "100+ DSA problems solved",
                        "url": "leetcode.com/ada",
                        "linkLabel": "Profile",
                    },
                    {
                        "title": "AtCoder",
                        "description": "Rating 301",
                        "url": "",
                        "linkLabel": "",
                    },
                ],
            }],
        })

        self.assertEqual(len(result["customSections"][0]["entries"]), 2)
        self.assertEqual(
            result["customSections"][0]["entries"][0]["url"],
            "leetcode.com/ada",
        )

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


class ResumeValidationTests(SimpleTestCase):
    def test_rejects_missing_and_invalid_core_fields(self):
        errors = validate_resume_data({
            "personalInfo": {
                "firstName": "",
                "lastName": "User",
                "email": "invalid",
                "phone": "letters",
            }
        })
        self.assertIn("personalInfo.firstName", errors)
        self.assertIn("personalInfo.email", errors)
        self.assertIn("personalInfo.phone", errors)

    def test_rejects_reversed_dates_and_invalid_grade(self):
        errors = validate_resume_data({
            "personalInfo": {
                "firstName": "Ada",
                "lastName": "Lovelace",
                "email": "ada@example.com",
                "phone": "+44 20 7946 0958",
            },
            "experience": [{
                "company": "Example",
                "position": "Engineer",
                "startDate": "2025-05",
                "endDate": "2024-05",
            }],
            "education": [{
                "degree": "BSc",
                "institution": "Example University",
                "cgpa": "12/10",
            }],
        })
        self.assertIn("experience.0.endDate", errors)
        self.assertIn("education.0.cgpa", errors)

    def test_rejects_nested_unsafe_links_and_certificate_dates(self):
        errors = validate_resume_data({
            "personalInfo": {"firstName": "Ada", "lastName": "Lovelace", "email": "ada@example.com", "phone": "+44 20 7946 0958"},
            "certifications": [{"name": "Cloud", "date": "2025-01", "expirationDate": "2024-01", "url": "javascript:bad"}],
            "customSections": [{"title": "Profiles", "entries": [{"title": "Profile", "url": "data:text/html,bad"}]}],
        })
        self.assertIn("certifications.0.expirationDate", errors)
        self.assertIn("certifications.0.url", errors)
        self.assertIn("customSections.0.entries.0.url", errors)

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


class AuthenticationApiTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.client.get("/api/auth/csrf")

    def post_json(self, path, payload):
        return self.client.post(
            path,
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.client.cookies["csrftoken"].value,
        )

    def valid_resume(self, first_name="Ada"):
        return {
            "personalInfo": {
                "firstName": first_name,
                "lastName": "Lovelace",
                "email": "ada@example.com",
                "phone": "+44 20 7946 0958",
            }
        }

    def test_signup_hashes_password_and_creates_session(self):
        response = self.post_json("/api/auth/signup", {
            "firstName": "Ada",
            "lastName": "Lovelace",
            "email": "ada@example.com",
            "password": "A-secure-passphrase-1843",
            "confirmPassword": "A-secure-passphrase-1843",
        })

        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(email="ada@example.com")
        self.assertNotEqual(user.password, "A-secure-passphrase-1843")
        self.assertTrue(user.check_password("A-secure-passphrase-1843"))
        self.assertTrue(self.client.get("/api/auth/me").json()["authenticated"])

    def test_login_logout_and_change_password(self):
        user = get_user_model().objects.create_user(
            username="grace@example.com",
            email="grace@example.com",
            password="Original-passphrase-1843",
        )

        login_response = self.post_json("/api/auth/login", {
            "email": user.email,
            "password": "Original-passphrase-1843",
        })
        self.assertEqual(login_response.status_code, 200)

        change_response = self.post_json("/api/auth/change-password", {
            "currentPassword": "Original-passphrase-1843",
            "newPassword": "Updated-passphrase-2843",
            "confirmPassword": "Updated-passphrase-2843",
        })
        self.assertEqual(change_response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("Updated-passphrase-2843"))

        logout_response = self.post_json("/api/auth/logout", {})
        self.assertEqual(logout_response.status_code, 200)
        self.assertFalse(self.client.get("/api/auth/me").json()["authenticated"])

    def test_auth_writes_require_csrf(self):
        response = Client(enforce_csrf_checks=True).post(
            "/api/auth/login",
            data=json.dumps({"email": "nobody@example.com", "password": "nope"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    @override_settings(LOGIN_RATE_LIMIT=2, LOGIN_RATE_WINDOW_SECONDS=60)
    def test_login_attempts_are_throttled_by_database_bucket(self):
        for _ in range(2):
            response = self.post_json("/api/auth/login", {"email": "limited@example.com", "password": "wrong"})
            self.assertEqual(response.status_code, 401)
        limited = self.post_json("/api/auth/login", {"email": "limited@example.com", "password": "wrong"})
        self.assertEqual(limited.status_code, 429)
        self.assertIn("Retry-After", limited)

    def test_resume_parser_requires_authentication(self):
        response = self.post_json("/api/parse-resume", {"raw_text": "example"})
        self.assertIn(response.status_code, (401, 403))

    @override_settings(AI_USER_RATE_LIMIT=1, AI_IP_RATE_LIMIT=2, AI_RATE_WINDOW_SECONDS=60)
    def test_resume_parser_rate_limit_applies_to_authenticated_user(self):
        user = get_user_model().objects.create_user(
            username="ai-limit@example.com", email="ai-limit@example.com", password="A-secure-passphrase-1843"
        )
        self.client.force_login(user)
        first = self.post_json("/api/parse-resume", {"raw_text": ""})
        self.assertEqual(first.status_code, 400)
        second = self.post_json("/api/parse-resume", {"raw_text": ""})
        self.assertEqual(second.status_code, 429)

    def test_user_can_save_replace_and_load_resume_json(self):
        user = get_user_model().objects.create_user(
            username="resume@example.com",
            email="resume@example.com",
            password="A-secure-passphrase-1843",
        )
        self.client.force_login(user)

        first_payload = {
            "data": {
                "resumeData": self.valid_resume("Ada"),
                "selectedTemplate": "16",
            },
            "expectedRevision": 0,
        }
        save_response = self.post_json_with_method("/api/resume", first_payload, "put")
        self.assertEqual(save_response.status_code, 200)
        self.assertEqual(save_response.json()["revision"], 1)
        self.assertEqual(SavedResume.objects.filter(user=user).count(), 1)

        replacement = {
            "data": {
                "resumeData": self.valid_resume("Grace"),
                "selectedTemplate": "12",
            },
            "expectedRevision": 1,
        }
        replace_response = self.post_json_with_method("/api/resume", replacement, "put")
        self.assertEqual(replace_response.status_code, 200)
        self.assertEqual(replace_response.json()["revision"], 2)
        self.assertEqual(SavedResume.objects.filter(user=user).count(), 1)

        load_response = self.client.get("/api/resume")
        self.assertEqual(load_response.status_code, 200)
        self.assertEqual(
            load_response.json()["data"]["resumeData"]["personalInfo"]["firstName"],
            "Grace",
        )
        self.assertEqual(load_response.json()["revision"], 2)

    def test_stale_revision_cannot_overwrite_newer_resume(self):
        user = get_user_model().objects.create_user(
            username="conflict@example.com",
            email="conflict@example.com",
            password="A-secure-passphrase-1843",
        )
        self.client.force_login(user)

        first = self.post_json_with_method("/api/resume", {
            "data": {"resumeData": self.valid_resume("First")},
            "expectedRevision": 0,
        }, "put")
        second = self.post_json_with_method("/api/resume", {
            "data": {"resumeData": self.valid_resume("Second")},
            "expectedRevision": first.json()["revision"],
        }, "put")
        stale = self.post_json_with_method("/api/resume", {
            "data": {"resumeData": self.valid_resume("Stale")},
            "expectedRevision": first.json()["revision"],
        }, "put")

        self.assertEqual(second.status_code, 200)
        self.assertEqual(stale.status_code, 409)
        self.assertTrue(stale.json()["conflict"])
        self.assertEqual(stale.json()["current"]["revision"], 2)
        self.assertEqual(
            SavedResume.objects.get(user=user).data["resumeData"]["personalInfo"]["firstName"],
            "Second",
        )

    def test_resume_api_rejects_invalid_data(self):
        user = get_user_model().objects.create_user(
            username="invalid-resume@example.com",
            email="invalid-resume@example.com",
            password="A-secure-passphrase-1843",
        )
        self.client.force_login(user)
        response = self.post_json_with_method("/api/resume", {
            "data": {"resumeData": {"personalInfo": {"email": "bad"}}},
            "expectedRevision": 0,
        }, "put")
        self.assertEqual(response.status_code, 422)
        self.assertIn("personalInfo.firstName", response.json()["fieldErrors"])
        self.assertFalse(SavedResume.objects.filter(user=user).exists())

    def post_json_with_method(self, path, payload, method):
        return getattr(self.client, method)(
            path,
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.client.cookies["csrftoken"].value,
        )

    def test_resume_api_requires_authentication(self):
        client = Client(enforce_csrf_checks=True)
        client.get("/api/auth/csrf")
        response = client.get("/api/resume")
        self.assertEqual(response.status_code, 401)

    def test_user_can_export_and_delete_resume_data(self):
        user = get_user_model().objects.create_user(
            username="data@example.com", email="data@example.com", password="A-secure-passphrase-1843"
        )
        self.client.force_login(user)
        save = self.post_json_with_method("/api/resume", {
            "data": {"resumeData": self.valid_resume()}, "expectedRevision": 0,
        }, "put")
        self.assertEqual(save.status_code, 200)
        exported = self.client.get("/api/auth/data-export")
        self.assertEqual(exported.status_code, 200)
        self.assertEqual(exported.json()["account"]["email"], "data@example.com")
        deleted = self.post_json_with_method("/api/resume", {}, "delete")
        self.assertEqual(deleted.status_code, 200)
        self.assertFalse(SavedResume.objects.filter(user=user).exists())

    def test_delete_account_requires_password_and_removes_user(self):
        user = get_user_model().objects.create_user(
            username="delete@example.com", email="delete@example.com", password="A-secure-passphrase-1843"
        )
        self.client.force_login(user)
        wrong = self.post_json("/api/auth/delete-account", {"password": "wrong"})
        self.assertEqual(wrong.status_code, 400)
        self.assertTrue(get_user_model().objects.filter(pk=user.pk).exists())
        deleted = self.post_json("/api/auth/delete-account", {"password": "A-secure-passphrase-1843"})
        self.assertEqual(deleted.status_code, 200)
        self.assertFalse(get_user_model().objects.filter(pk=user.pk).exists())
