# Google OAuth Debugging Guide

A comprehensive guide for diagnosing and fixing Google OAuth failures in ContributorHub. This covers the two error scenarios users encounter and walks through every layer of the stack.

---

## Table of Contents

1. [Understanding the Error Messages](#understanding-the-error-messages)
2. [Root Cause Analysis for ContributorHub](#root-cause-analysis-for-contributorhub)
3. [Common Causes of Google OAuth Failure](#common-causes-of-google-oauth-failure)
4. [Step-by-Step Debugging Checklist](#step-by-step-debugging-checklist)
5. [Google Cloud Console Configuration](#google-cloud-console-configuration)
6. [Client-Side Debugging](#client-side-debugging)
7. [Server-Side Debugging](#server-side-debugging)
8. [Browser DevTools Inspection](#browser-devtools-inspection)
9. [Code Fixes for Common Pitfalls](#code-fixes-for-common-pitfalls)
10. [Verifying the Fix Locally](#verifying-the-fix-locally)

---

## Understanding the Error Messages

Users see one of two errors when clicking "Continue with Google":

### Error 1: "Google OAuth is not configured"

**What it means:** The backend server is reachable, but the required Google OAuth environment variables are not set.

**Trace through the code:**

```
User clicks "Continue with Google"
  → client/src/pages/LoginPage.tsx: handleGoogleLogin()
    → fetch("http://localhost:4000/api/auth/google")
      → server/src/routes/auth.ts: GET /api/auth/google
        → checks process.env.GOOGLE_CLIENT_ID
        → checks process.env.GOOGLE_CALLBACK_URL
        → BOTH are undefined → returns 503: "Google OAuth is not configured"
```

### Error 2: "Network error. Is the server running?"

**What it means:** The `fetch()` call itself failed — the browser could not reach the backend API at all.

**Trace through the code:**

```
User clicks "Continue with Google"
  → client/src/pages/LoginPage.tsx: handleGoogleLogin()
    → fetch("http://localhost:4000/api/auth/google")
      → THROWS (network error, CORS blocked, server down)
        → catch block → "Network error. Is the server running?"
```

---

## Root Cause Analysis for ContributorHub

The **primary cause** in this codebase is that Google OAuth requires three environment variables that are all marked as `optional()` in the server config and are **not set by default**:

```typescript
// server/src/config/env.ts
GOOGLE_CLIENT_ID: z.string().optional(),
GOOGLE_CLIENT_SECRET: z.string().optional(),
GOOGLE_CALLBACK_URL: z.string().url().optional()
```

The `GET /api/auth/google` route explicitly checks for these and returns a 503 if missing:

```typescript
// server/src/routes/auth.ts (lines 123-133)
authRouter.get("/google", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !redirectUri) {
    res.status(503).json({ error: "Google OAuth is not configured" });
    return;
  }
  // ...
});
```

**The "Network error" variant** occurs when the backend server is not running at all, or CORS is blocking the cross-origin request from `localhost:5173` to `localhost:4000`.

---

## Common Causes of Google OAuth Failure

| # | Cause | Symptom | Layer |
|---|-------|---------|-------|
| 1 | Missing `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars | "Google OAuth is not configured" | Server config |
| 2 | Missing `GOOGLE_CALLBACK_URL` env var | "Google OAuth is not configured" | Server config |
| 3 | Backend server not running | "Network error. Is the server running?" | Infrastructure |
| 4 | CORS not enabled on backend | "Network error. Is the server running?" | Server config |
| 5 | Wrong OAuth client ID (typo, wrong project) | Google shows "Error 400: invalid_request" | Google Cloud |
| 6 | Redirect URI mismatch | Google shows "Error 400: redirect_uri_mismatch" | Google Cloud |
| 7 | JavaScript origins not authorized | Google blocks the request | Google Cloud |
| 8 | OAuth consent screen not configured | Google shows "Access blocked" | Google Cloud |
| 9 | Client secret is wrong or revoked | Token exchange fails silently on server | Server runtime |
| 10 | Token exchange endpoint returns error | Server returns 500 | Server runtime |
| 11 | Callback doesn't return token to frontend | User lands on JSON page, not the app | Client/Server |
| 12 | `fetch()` URL hardcoded to wrong host/port | Request goes to wrong server | Client config |

---

## Step-by-Step Debugging Checklist

### Phase 1: Is the backend reachable?

- [ ] **Check the server is running:**
  ```bash
  curl http://localhost:4000/health
  # Expected: {"status":"ok"}
  ```

- [ ] **Check the Google auth endpoint directly:**
  ```bash
  curl http://localhost:4000/api/auth/google
  ```
  - If `{"error":"Google OAuth is not configured"}` → Go to Phase 2
  - If connection refused → Start the server
  - If no response → Check port, firewall

- [ ] **Check CORS is enabled** (only relevant when frontend is on a different origin):
  ```bash
  curl -s -D- -o /dev/null http://localhost:4000/api/auth/google \
    -H "Origin: http://localhost:5173"
  # Look for: access-control-allow-origin header
  ```

### Phase 2: Are the environment variables set?

- [ ] **Verify the three Google OAuth env vars exist:**
  ```bash
  echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
  echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET"
  echo "GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL"
  ```
  All three must be non-empty.

- [ ] **Verify they're in your `.env` file:**
  ```bash
  grep GOOGLE .env
  ```

- [ ] **Verify the server loads them:** Add a temporary log to `server/src/routes/auth.ts`:
  ```typescript
  console.log("GOOGLE_CLIENT_ID set:", !!process.env.GOOGLE_CLIENT_ID);
  ```

### Phase 3: Is the Google Cloud Console configured correctly?

- [ ] OAuth consent screen is published (not in "Testing" with limited users)
- [ ] OAuth 2.0 Client ID is of type "Web application"
- [ ] **Authorized JavaScript origins** includes your frontend URL:
  - `http://localhost:5173` (Vite dev)
  - `http://localhost:3000` (Docker/nginx)
- [ ] **Authorized redirect URIs** includes your callback URL:
  - `http://localhost:4000/api/auth/google/callback`
- [ ] Client ID and secret match what's in your `.env`

### Phase 4: Does the OAuth flow complete?

- [ ] **Test the redirect URL generation:**
  ```bash
  curl http://localhost:4000/api/auth/google
  # Should return: {"url":"https://accounts.google.com/o/oauth2/v2/auth?..."}
  ```

- [ ] **Open that URL in a browser** — does Google's consent screen appear?

- [ ] **After consent, does the callback work?**
  Check the server logs for errors during token exchange.

- [ ] **Does the callback return a JWT to the frontend?**
  The current callback returns JSON — the frontend needs to handle this.

### Phase 5: Browser console and network inspection

- [ ] Open DevTools → Console tab → Click "Continue with Google"
- [ ] Look for: `ERR_CONNECTION_REFUSED`, `CORS`, `TypeError: Failed to fetch`
- [ ] Open DevTools → Network tab → Filter by "auth"
- [ ] Check the response status and body of the `/api/auth/google` request

---

## Google Cloud Console Configuration

### Step-by-step setup

1. **Go to** https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable the Google+ API** (or "Google Identity" API):
   - APIs & Services → Library → Search "Google Identity" → Enable
4. **Configure OAuth consent screen:**
   - APIs & Services → OAuth consent screen
   - User Type: External (for public) or Internal (for org)
   - App name: ContributorHub
   - Support email: your email
   - Authorized domains: your domain (for production)
   - Scopes: `email`, `profile`, `openid`
   - **Publish the app** (or add test users while in Testing mode)
5. **Create OAuth 2.0 credentials:**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Name: ContributorHub
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:3000
     http://localhost:4000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:4000/api/auth/google/callback
     ```
   - Click Create → Copy the **Client ID** and **Client Secret**

### Common mistakes

| Mistake | Fix |
|---------|-----|
| Using "Desktop app" instead of "Web application" | Delete and recreate as Web application |
| Missing `http://localhost:5173` in JS origins | Add it in Credentials → Edit |
| Redirect URI has trailing slash | Remove it: `.../callback` not `.../callback/` |
| Using `https://` for localhost | Use `http://` — Google allows HTTP for localhost |
| Consent screen in "Testing" mode | Add test user emails, or publish the app |

---

## Client-Side Debugging

### Check 1: Is the API base URL correct?

```typescript
// client/src/pages/LoginPage.tsx
const API_BASE = "http://localhost:4000"; // Must match your running server
```

**Pitfall:** If you changed the server port via `PORT=3001`, update this too.

### Check 2: Is the button's onClick handler firing?

Open browser console and add a temporary breakpoint:

```typescript
async function handleGoogleLogin() {
  console.log("Google login clicked"); // ← Add this
  setError("");
  try {
    const res = await fetch(`${API_BASE}/api/auth/google`);
    console.log("Response status:", res.status); // ← Add this
    // ...
```

### Check 3: Is `fetch()` failing or returning an error?

The catch block catches **all** failures with a generic message. Temporarily log the actual error:

```typescript
} catch (err) {
  console.error("Actual error:", err); // ← Add this to see the real error
  setError("Network error. Is the server running?");
}
```

### Check 4: After Google redirects back, does the app handle the callback?

The current implementation has a gap: `GET /api/auth/google/callback` returns JSON, but the browser navigates to it directly after Google redirects. The frontend needs to handle the callback URL.

**Fix — redirect the user back to the frontend with the token:**

```typescript
// In server/src/routes/auth.ts, replace the callback JSON response with a redirect:
res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
```

Then add a route in the frontend to extract the token from the URL.

---

## Server-Side Debugging

### Check 1: Are env vars loaded?

```bash
# Start server with explicit env vars
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com" \
GOOGLE_CLIENT_SECRET="your-secret" \
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback" \
DATABASE_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub" \
DIRECT_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub" \
npm run dev -w server
```

### Check 2: Does the endpoint return a valid OAuth URL?

```bash
curl -s http://localhost:4000/api/auth/google | python3 -m json.tool
```

Expected:
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=openid+email+profile&access_type=offline&prompt=consent"
}
```

**Verify the URL contains:**
- Your actual `client_id`
- Your actual `redirect_uri` matching Google Console

### Check 3: Token exchange fails

Add logging to `server/src/auth/google.ts`:

```typescript
export async function exchangeCodeForTokens(...) {
  const response = await fetch("https://oauth2.googleapis.com/token", { ... });

  if (!response.ok) {
    const err = await response.text();
    console.error("Token exchange error:", response.status, err); // ← Add this
    throw new Error(`Google token exchange failed: ${err}`);
  }
  // ...
}
```

Common token exchange errors:
- `"invalid_grant"` — Authorization code expired (> 10 min) or already used
- `"invalid_client"` — Wrong client secret
- `"redirect_uri_mismatch"` — Redirect URI doesn't match Google Console

### Check 4: User info fetch fails

```typescript
export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { ... });

  if (!response.ok) {
    const body = await response.text();
    console.error("User info error:", response.status, body); // ← Add this
    throw new Error("Failed to fetch Google user info");
  }
  // ...
}
```

### Check 5: Database user creation fails

If a user with the same email already exists (registered via email/password) but has no `googleId`, the code links the accounts. Check for unique constraint violations.

---

## Browser DevTools Inspection

### Console Tab

Click "Continue with Google" and look for:

| Error | Meaning | Fix |
|-------|---------|-----|
| `TypeError: Failed to fetch` | Server unreachable | Start backend, check port |
| `Access to fetch... has been blocked by CORS policy` | CORS not configured | Add `cors()` middleware |
| `net::ERR_CONNECTION_REFUSED` | Server not running on that port | Start server, check PORT |
| `SyntaxError: Unexpected token` | Server returned HTML instead of JSON | Check the endpoint returns JSON |

### Network Tab

1. Filter by `auth`
2. Click "Continue with Google"
3. Look at the `GET /api/auth/google` request:
   - **Status 503** → Google OAuth env vars not set
   - **Status 200** → Check the response body for the OAuth URL
   - **CORS error** → Request blocked before reaching server
   - **No request** → onClick handler not firing

---

## Code Fixes for Common Pitfalls

### Fix 1: Add Google credentials to `.env`

```env
# Add to your .env file
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"
```

### Fix 2: CORS not enabled

If the backend doesn't have CORS middleware:

```typescript
// server/src/app.ts
import cors from "cors";

export function createApp() {
  const app = express();
  app.use(cors()); // ← Add this before routes
  app.use(express.json());
  // ...
}
```

This is already implemented in ContributorHub but may be missing in other projects.

### Fix 3: Callback returns JSON instead of redirecting

The callback currently returns JSON, but the browser navigates directly to the callback URL. For a SPA, redirect back to the frontend:

```typescript
// server/src/routes/auth.ts — in the /google/callback handler
// Replace:
res.json({ token, user: { ... } });

// With:
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
res.redirect(`${frontendUrl}?token=${token}`);
```

Then in the frontend, parse the token from the URL on mount:

```typescript
// client/src/App.tsx — in useEffect
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get("token");
if (tokenFromUrl) {
  localStorage.setItem("token", tokenFromUrl);
  window.history.replaceState({}, "", "/"); // Clean URL
  // fetch /api/auth/me with the token...
}
```

### Fix 4: API_BASE URL hardcoded

If the frontend is served from a different host in production:

```typescript
// Instead of hardcoded:
const API_BASE = "http://localhost:4000";

// Use environment variable:
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
```

Then set `VITE_API_BASE` in your `.env` or build config.

### Fix 5: Consent screen in "Testing" mode

If Google shows "Access blocked: app has not completed the Google verification process":
- Go to Google Cloud Console → OAuth consent screen
- Either add the user's email to "Test users"
- Or click "Publish App" to make it available to all Google accounts

---

## Verifying the Fix Locally

### Step 1: Set up Google credentials

```bash
# Add to .env
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"
```

### Step 2: Restart the server with the env vars

```bash
source .env  # if using dotenv-cli
# or pass inline:
GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." GOOGLE_CALLBACK_URL="..." \
DATABASE_URL="..." DIRECT_URL="..." npm run dev -w server
```

### Step 3: Test the endpoint

```bash
curl -s http://localhost:4000/api/auth/google | python3 -m json.tool
# Should return {"url": "https://accounts.google.com/..."}
```

### Step 4: Test the full flow

1. Open http://localhost:5173
2. Click "Continue with Google"
3. Google's consent screen should appear
4. Select your Google account
5. Google redirects to the callback URL
6. Verify you're authenticated in the app

### Step 5: Test error scenarios

```bash
# Wrong password
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# Expected: {"error":"Invalid email or password"}

# Without auth header
curl -s http://localhost:4000/api/auth/me
# Expected: {"error":"Authentication required"}

# Google not configured (remove env vars)
curl -s http://localhost:4000/api/auth/google
# Expected: {"error":"Google OAuth is not configured"}
```

### Step 6: Verify in Docker

```bash
docker compose down -v
# Add GOOGLE_* vars to docker-compose.yml server.environment section
docker compose up -d --build
curl http://localhost:4000/api/auth/google
```

---

## Quick Reference: Environment Variables for Google OAuth

| Variable | Example | Where to get it |
|----------|---------|----------------|
| `GOOGLE_CLIENT_ID` | `123456789-abc.apps.googleusercontent.com` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxxxxx` | Google Cloud Console → Credentials |
| `GOOGLE_CALLBACK_URL` | `http://localhost:4000/api/auth/google/callback` | Must match "Authorized redirect URIs" in Console |
