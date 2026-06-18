import json

from django.contrib.auth import get_user_model
from django.test import Client, SimpleTestCase, TestCase

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
