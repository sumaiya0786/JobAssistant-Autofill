# PRD — JobAssist: AI Job Application Assistant

## Original problem statement
Build a production-quality AI Job Application Assistant consisting of THREE parts:
1. **Chrome Extension (Manifest V3, vanilla JS)** — the MAIN product: Smart Autofill, AI Form Detection, Job Analyzer, Resume Match.
2. **Web Dashboard** — Profile, Resume, Job Analysis, Application Tracker, analytics.
3. **Backend** — Node.js + Express + MongoDB + (Gemini) AI.
Stack constraints: HTML/CSS/vanilla JS extension (no TS/React in extension), Node/Express backend, MongoDB/Mongoose, JWT + bcrypt auth, Gemini AI via secure backend (never in extension), pdf-parse for resumes. Assistant must NEVER auto-submit and NEVER invent skills.

## User choices (this build)
- AI = deterministic **MOCK** now (Gemini swappable later), React web dashboard, Node.js/Express backend, vanilla-JS extension. First-pass scope kept as-is (Auth, Profile, Resume, Job Analyzer + Match, Smart Autofill extension, Application Tracker).

## Architecture (as deployed on this platform)
- **Real backend**: Node.js/Express/Mongoose in `/app/server`, listens on `127.0.0.1:5001`, all routes under `/api`.
- **Proxy**: `/app/backend/server.py` (FastAPI) runs on `0.0.0.0:8001` (platform requirement) and reverse-proxies every request to Node. Node is a supervisor program (`/etc/supervisor/conf.d/node_backend.conf`).
- **Frontend**: React (CRA) dashboard in `/app/frontend`, calls `REACT_APP_BACKEND_URL/api/*` with JWT Bearer token (localStorage `ja_token`).
- **Extension**: `/app/extension` (MV3, vanilla JS), downloadable zip at `/frontend/public/job-assistant-extension.zip`, served on the dashboard's Extension page.
- **AI layer**: `/app/server/services/geminiService.js` (mock; swap in Gemini here). Env: `AI_PROVIDER=mock`, `GEMINI_API_KEY` reserved.

## User personas
- Student / early-career job seeker applying to many roles who wants to autofill forms and gauge fit quickly.

## Core requirements (static)
- JWT auth (bcrypt hashing), profile CRUD, resume upload + PDF parse, transparent job match scoring, smart form autofill by semantics (label/placeholder/name/id/aria/autocomplete/nearby text), never auto-submit, application tracker + analytics.

## Implemented (2026-06)
- Auth (register/login/me) with bcryptjs + JWT Bearer. ✅ tested
- Profile (personal/professional/education/experience/projects/other) with per-section merge + completion %. ✅
- Resume upload (multipart field `resume`), pdf-parse text extraction, deterministic skill/section parsing, list/view/delete, versions/labels. ✅
- Job Analyzer + transparent Match (required/preferred split, strong/missing skills, education/experience checks, recommendation, suggestions — never invents skills). ✅
- Save Job + Saved Jobs page. ✅
- Application Tracker (CRUD, inline status: Saved/Applying/Applied/Interview/Rejected/Offer) + analytics (week/month/avg match/interview rate/by status). ✅
- AI endpoints: form-mapping (semantic + ambiguity/sensitive handling), resume-analysis, job-analysis. ✅
- Chrome Extension (MV3): popup (login + dashboard + quick actions), content script floating assistant (detect form, Autofill, Analyze, Review), formDetector, autofill (React-safe value setter, highlights, ambiguity/sensitive review chips, never touches submit), fieldMapper (local, mirrors backend), storage/api/validators, background SW, icons, test-form.html demo. ✅ (built; cannot be auto-loaded in Playwright)
- React dashboard with custom SaaS design (Outfit/IBM Plex Sans, dark-green palette, flat bordered cards). ✅
- Testing: 32/32 backend pytest passed; frontend E2E flows 100%.

## Backlog / remaining
- **P1**: Swap mock AI for real Gemini in `geminiService.js` (needs `GEMINI_API_KEY`).
- **P2**: Upgrade `pdf-parse` (or use pdfjs-dist ≥2.x / pdf-parse-fork) for broader PDF compatibility.
- **P2**: Editable parsed-resume fields in UI; resume version recommendation per job.
- **P2**: Site-specific adapters (Greenhouse/Lever/Workday); remembered per-site manual field mappings.
- **P3**: Real Chrome Web Store packaging; deploy backend to Render + MongoDB Atlas.

## Next tasks
- Provide Gemini key to enable real AI; broaden PDF parser; add per-site autofill adapters.
