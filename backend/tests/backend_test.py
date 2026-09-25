"""
Backend API test suite for AI Job Application Assistant.
Node/Express real backend behind FastAPI proxy at REACT_APP_BACKEND_URL/api.
"""
import os
import io
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback read from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"

DEMO_EMAIL = "demo@jobassist.com"
DEMO_PASSWORD = "demo1234"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def demo_token(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200, f"Demo login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def demo_headers(demo_token):
    return {"Authorization": f"Bearer {demo_token}"}


@pytest.fixture(scope="session")
def new_user(s):
    email = f"TEST_{uuid.uuid4().hex[:8]}@jobassist.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "test1234", "name": "Test User"})
    assert r.status_code == 201, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"email": email, "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def new_user_headers(new_user):
    return {"Authorization": f"Bearer {new_user['token']}"}


# ---------- Health ----------
def test_health(s):
    r = s.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_root(s):
    r = s.get(f"{API}")
    assert r.status_code == 200
    j = r.json()
    assert j.get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_login_demo(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
        assert r.status_code == 200
        j = r.json()
        assert "token" in j and isinstance(j["token"], str) and len(j["token"]) > 10
        assert j["user"]["email"] == DEMO_EMAIL

    def test_login_invalid_password(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrongwrong"})
        assert r.status_code == 401
        assert "error" in r.json()

    def test_login_missing_fields(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL})
        assert r.status_code == 400

    def test_register_and_duplicate(self, s):
        email = f"TEST_{uuid.uuid4().hex[:8]}@jobassist.com"
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "abcdef", "name": "X"})
        assert r.status_code == 201
        assert r.json()["user"]["email"] == email.lower()
        # duplicate
        r2 = s.post(f"{API}/auth/register", json={"email": email, "password": "abcdef"})
        assert r2.status_code == 409

    def test_register_bad_email(self, s):
        r = s.post(f"{API}/auth/register", json={"email": "notanemail", "password": "abcdef"})
        assert r.status_code == 400

    def test_register_short_password(self, s):
        r = s.post(f"{API}/auth/register", json={"email": f"TEST_{uuid.uuid4().hex[:6]}@x.com", "password": "abc"})
        assert r.status_code == 400

    def test_me_requires_auth(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, s, demo_headers):
        r = s.get(f"{API}/auth/me", headers=demo_headers)
        assert r.status_code == 200
        assert r.json()["user"]["email"] == DEMO_EMAIL


# ---------- Profile ----------
class TestProfile:
    def test_get_profile(self, s, demo_headers):
        r = s.get(f"{API}/profile", headers=demo_headers)
        assert r.status_code == 200
        j = r.json()
        assert "profile" in j and "email" in j

    def test_update_profile_and_persist(self, s, new_user_headers):
        payload = {
            "personal": {"fullName": "TEST User", "email": "test@example.com", "phone": "1234567890", "location": "NYC"},
            "professional": {"skills": ["Java", "React", "SQL"], "experienceYears": "3"},
            "education": [{"degree": "Bachelor of Technology", "school": "IIT", "year": "2020"}],
            "experience": [{"company": "Acme", "role": "SWE", "duration": "2 yrs"}],
        }
        r = s.put(f"{API}/profile", json=payload, headers=new_user_headers)
        assert r.status_code == 200
        prof = r.json()["profile"]
        assert prof["personal"]["fullName"] == "TEST User"
        assert prof["professional"]["skills"] == ["Java", "React", "SQL"]
        assert len(prof["education"]) == 1
        # GET verify
        r2 = s.get(f"{API}/profile", headers=new_user_headers)
        assert r2.status_code == 200
        p2 = r2.json()["profile"]
        assert p2["personal"]["phone"] == "1234567890"
        assert len(p2["experience"]) == 1

    def test_completion(self, s, new_user_headers):
        r = s.get(f"{API}/profile/completion", headers=new_user_headers)
        assert r.status_code == 200
        assert isinstance(r.json()["percent"], int)
        assert 0 <= r.json()["percent"] <= 100

    def test_profile_unauth(self, s):
        r = s.get(f"{API}/profile")
        assert r.status_code == 401


# ---------- Resume ----------
def _make_pdf_bytes(text="John Doe\nSkills: Java, Python, React, SQL, Docker\nEducation: Bachelor of Technology\n"):
    """Return a real PDF that pdf-parse can read. Use the pdf-parse test fixture as base."""
    fixture = "/app/server/node_modules/pdf-parse/test/data/01-valid.pdf"
    try:
        with open(fixture, "rb") as f:
            return f.read()
    except Exception:
        # Fallback minimal (may not parse)
        return b"%PDF-1.4\n%%EOF"


class TestResume:
    _uploaded_id = None

    def test_upload_resume(self, s, new_user_headers):
        pdf = _make_pdf_bytes()
        files = {"resume": ("TEST_resume.pdf", pdf, "application/pdf")}
        r = s.post(f"{API}/resume/upload", files=files, headers=new_user_headers)
        assert r.status_code == 201, r.text
        j = r.json()
        assert j["resume"]["fileName"] == "TEST_resume.pdf"
        assert j["resume"]["isActive"] is True
        assert "parsed" in j["resume"]
        TestResume._uploaded_id = j["resume"]["_id"]

    def test_upload_non_pdf(self, s, new_user_headers):
        files = {"resume": ("test.txt", b"hello", "text/plain")}
        r = s.post(f"{API}/resume/upload", files=files, headers=new_user_headers)
        assert r.status_code == 400

    def test_list_resumes(self, s, new_user_headers):
        r = s.get(f"{API}/resume", headers=new_user_headers)
        assert r.status_code == 200
        arr = r.json()["resumes"]
        assert isinstance(arr, list)
        assert any(x["_id"] == TestResume._uploaded_id for x in arr)

    def test_get_resume_file(self, s, new_user_headers):
        assert TestResume._uploaded_id
        r = s.get(f"{API}/resume/{TestResume._uploaded_id}/file", headers=new_user_headers)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")

    def test_delete_resume(self, s, new_user_headers):
        assert TestResume._uploaded_id
        r = s.delete(f"{API}/resume/{TestResume._uploaded_id}", headers=new_user_headers)
        assert r.status_code == 200
        assert r.json().get("success") is True


# ---------- Job Analyzer ----------
class TestJob:
    JD = ("We're hiring a Software Engineer. Requirements: strong Java, JavaScript, React, "
          "REST APIs, Docker, Spring Boot. Bachelors degree required. 0-1 years experience.")

    def test_analyze(self, s, demo_headers):
        r = s.post(f"{API}/job/analyze", json={"description": self.JD, "title": "SWE", "company": "Acme"}, headers=demo_headers)
        assert r.status_code == 200
        analysis = r.json()["analysis"]
        assert isinstance(analysis, dict)

    def test_analyze_too_short(self, s, demo_headers):
        r = s.post(f"{API}/job/analyze", json={"description": "hi"}, headers=demo_headers)
        assert r.status_code == 400

    def test_match_never_invents_skills(self, s, new_user_headers):
        # profile has only Java + React (no Docker)
        s.put(f"{API}/profile", json={
            "professional": {"skills": ["Java", "React"], "experienceYears": "1"},
            "education": [{"degree": "Bachelor of Technology"}],
        }, headers=new_user_headers)
        r = s.post(f"{API}/job/match", json={"description": TestJob.JD, "title": "SWE"}, headers=new_user_headers)
        assert r.status_code == 200
        j = r.json()
        assert "match" in j
        m = j["match"]
        assert isinstance(m["score"], int) and 0 <= m["score"] <= 100
        strong_lower = [x.lower() for x in m["strongMatches"]]
        # Ensure no invented skills - each in strongMatches must be in user's skills list
        user_skills = {"java", "react"}
        for s_ in strong_lower:
            assert s_ in user_skills, f"Invented skill: {s_}"
        # Docker should be in missing since user doesn't have it
        missing_lower = [x.lower() for x in m["missing"]]
        assert "docker" in missing_lower

    def test_save_job_and_list(self, s, demo_headers):
        r = s.post(f"{API}/job/save", json={"title": "TEST SWE", "company": "TEST Co", "description": self.JD}, headers=demo_headers)
        assert r.status_code == 201
        job_id = r.json()["job"]["_id"]

        r2 = s.get(f"{API}/job", headers=demo_headers)
        assert r2.status_code == 200
        assert any(j["_id"] == job_id for j in r2.json()["jobs"])

        r3 = s.delete(f"{API}/job/{job_id}", headers=demo_headers)
        assert r3.status_code == 200


# ---------- Applications ----------
class TestApplications:
    def test_crud_and_status(self, s, demo_headers):
        # Create
        r = s.post(f"{API}/applications", json={"company": "TEST_Co", "role": "SWE", "status": "Saved"}, headers=demo_headers)
        assert r.status_code == 201
        app_id = r.json()["application"]["_id"]

        # List
        r2 = s.get(f"{API}/applications", headers=demo_headers)
        assert r2.status_code == 200
        assert any(a["_id"] == app_id for a in r2.json()["applications"])
        assert isinstance(r2.json()["statuses"], list)

        # Update status
        r3 = s.put(f"{API}/applications/{app_id}", json={"status": "Applied"}, headers=demo_headers)
        assert r3.status_code == 200
        assert r3.json()["application"]["status"] == "Applied"

        # Delete
        r4 = s.delete(f"{API}/applications/{app_id}", headers=demo_headers)
        assert r4.status_code == 200

    def test_analytics(self, s, demo_headers):
        r = s.get(f"{API}/applications/analytics", headers=demo_headers)
        assert r.status_code == 200
        j = r.json()
        for k in ["total", "thisWeek", "thisMonth", "avgMatch", "interviews", "interviewRate", "byStatus"]:
            assert k in j

    def test_create_no_company(self, s, demo_headers):
        r = s.post(f"{API}/applications", json={"role": "x"}, headers=demo_headers)
        assert r.status_code == 400


# ---------- AI form mapping ----------
class TestFormMapping:
    def test_full_name(self, s, demo_headers):
        r = s.post(f"{API}/ai/form-mapping", json={"label": "Full Name"}, headers=demo_headers)
        assert r.status_code == 200
        assert r.json()["result"]["fieldKey"] == "fullName"

    def test_mobile_number(self, s, demo_headers):
        r = s.post(f"{API}/ai/form-mapping", json={"label": "Mobile Number"}, headers=demo_headers)
        assert r.status_code == 200
        assert r.json()["result"]["fieldKey"] == "phone"

    def test_university_name(self, s, demo_headers):
        r = s.post(f"{API}/ai/form-mapping", json={"label": "University Name"}, headers=demo_headers)
        assert r.status_code == 200
        assert r.json()["result"]["fieldKey"] == "university"

    def test_linkedin(self, s, demo_headers):
        r = s.post(f"{API}/ai/form-mapping", json={"label": "LinkedIn Profile"}, headers=demo_headers)
        assert r.status_code == 200
        assert r.json()["result"]["fieldKey"] == "linkedin"

    def test_batch(self, s, demo_headers):
        r = s.post(f"{API}/ai/form-mapping", json={"fields": [
            {"label": "Full Name"}, {"label": "Mobile Number"}, {"label": "LinkedIn Profile"}
        ]}, headers=demo_headers)
        assert r.status_code == 200
        results = r.json()["results"]
        assert [x["fieldKey"] for x in results] == ["fullName", "phone", "linkedin"]


# ---------- Extension download ----------
def test_extension_zip_download(s):
    r = s.get(f"{BASE_URL}/job-assistant-extension.zip", allow_redirects=True)
    assert r.status_code == 200
    assert len(r.content) > 100
