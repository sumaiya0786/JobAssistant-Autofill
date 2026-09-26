# JobAssist — AI Job Application Assistant
demo link https://jobassist-frontend-02.onrender.com

A production-style AI job-application assistant with three parts:

1. **Chrome Extension** (Manifest V3, vanilla JS) — the main product: smart autofill, AI form detection, job analyzer, resume match. Lives in `/extension`.
2. **Web Dashboard** (React) — profile, resume management, job analyzer, application tracker, analytics. Lives in `/frontend`.
3. **Backend** (Node.js + Express + Mongoose + MongoDB) — REST API, JWT auth, deterministic AI mock (swap-in Gemini later). Lives in `/server`.

> On this hosted environment, a small FastAPI reverse-proxy (`/backend/server.py`) runs on port 8001 (platform requirement) and forwards every `/api/*` request to the Node backend on `127.0.0.1:5001`. Locally / on Render you run the Node backend directly.

---

## Tech stack
- Extension: HTML5, CSS3, Vanilla JS (ES6+), Chrome MV3 APIs, Content Scripts, Service Worker, Storage API, MutationObserver
- Backend: Node.js, Express, REST, Mongoose
- Database: MongoDB (Atlas in production)
- Auth: JWT + bcryptjs (passwords never stored in plain text)
- AI: pluggable service layer (`server/services/geminiService.js`) — currently a deterministic MOCK; drop in the Gemini API key/call later
- Resume parsing: `pdf-parse`

---

## Run locally

### 1. Backend (`/server`)
```bash
cd server
npm install         # or: yarn
# create server/.env  (or reuse /backend/.env which it loads by default)
#   MONGO_URL=<your mongodb atlas uri>
#   DB_NAME=jobassist
#   JWT_SECRET=<random 64-char hex>
#   NODE_PORT=5001
#   AI_PROVIDER=mock
#   GEMINI_API_KEY=<optional, for future>
node server.js
```
The API is served under `/api` (e.g. `POST /api/auth/register`).

### 2. Web dashboard (`/frontend`)
```bash
cd frontend
yarn install
# frontend/.env -> REACT_APP_BACKEND_URL=http://localhost:5001   (local)
yarn start
```

### 3. Chrome extension (`/extension`)
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `/extension` folder
4. Open the JobAssist popup, paste your **Backend URL** and **sign in**
5. Open `extension/test-form.html` (or any job page) → click the floating **JobAssist** button → **Autofill Form**

The extension **never submits** applications — it only fills fields for your review.

---

## Deployment
- **Backend** → Render (Node web service). Set env vars `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `AI_PROVIDER`, `GEMINI_API_KEY`.
- **Database** → MongoDB Atlas.
- **Extension** → keep as "Load unpacked" during dev; structure is Web-Store ready.

## Security
- JWT bearer auth, bcrypt password hashing
- All AI/secret access happens server-side — the Gemini key is never shipped in the extension
- CORS enabled; only required Chrome permissions requested

## Adding real Gemini AI later
Replace the deterministic logic inside `server/services/geminiService.js`
(`analyzeJobDescription`, `analyzeResume`, `mapFormField`) with Gemini API calls using
`process.env.GEMINI_API_KEY`. No controller/route changes needed.
