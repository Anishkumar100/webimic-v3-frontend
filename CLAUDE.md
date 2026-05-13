# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent npm projects, each with its own `package.json` and `node_modules`:

- `client/` — Vite + React 18 SPA (deployed to Vercel; `vercel.json` rewrites all paths to `index.html`).
- `server/` — Express API + BullMQ worker that crawls sites and extracts design tokens.

There is no root `package.json`; run commands from inside `client/` or `server/`.

## Common commands

Client (`cd client`):
- `npm run dev` — Vite dev server on port 5173 (auto-opens browser).
- `npm run build` — production build to `client/dist`.
- `npm run preview` — serve the built bundle.

Server (`cd server`):
- `npm run dev` — API + embedded worker with `--watch` reload (port 8000).
- `npm start` — same, without watch mode.
- `npm run dev:worker` / `npm run start:worker` — run the BullMQ worker as a **separate** process. Use this when `DISABLE_EMBEDDED_WORKER=true` is set on the API.
- `npm run seed` — `scripts/seed.js`.

No test runner or linter is configured in either project.

## Environment

Server reads `server/.env` (see `server/.env.example`). Required vars: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `GROK_API_KEY` (Groq, used by Doc B generation). Optional flags: `DEBUG_WS=1`, `DEBUG_HTTP=1`, `DISABLE_EMBEDDED_WORKER=true`, `PUPPETEER_EXECUTABLE_PATH`.

Client reads `client/.env`: `VITE_API_URL` (defaults to `http://localhost:8000`) and `VITE_WS_URL`. `client/src/lib/api.js` is the single fetch wrapper; it stores the JWT in `localStorage` under `webimic_token`.

## Architecture

### Job pipeline (the core of the app)

A "job" is a request to analyze a URL. The flow in `server/`:

1. **`POST /v1/jobs`** (`routes/jobs.js`) creates a `Job` document (`models/Job.js`) with `status: 'queued'`, then calls `enqueueAnalysisJob` (`config/queue.js`) which adds it to the **BullMQ** queue named `webimic-analysis`. The MongoDB `_id` is reused as the BullMQ job id.
2. **Worker** (`workers/workerRuntime.js → startAnalysisWorker`) consumes the queue with `concurrency: 1` (one Chromium stack at a time per machine). It can run **embedded** inside the API process (default — started via `setImmediate` in `server.js`) or as a **separate** process (`workers/processor.js`) when `DISABLE_EMBEDDED_WORKER=true`. Don't run both at once against the same Redis.
3. The worker calls `runCrawlAndExtract` (`workers/crawler.js`), which has two paths:
   - `maxDepth === 1` → fast path using `playwrightCapture.js` directly (skips Crawlee startup).
   - `maxDepth > 1` → `PlaywrightCrawler` (Crawlee) with a Playwright fallback if it captures 0 pages.
4. Pipeline stages (each broadcasts a progress update over WS): capture screenshot + raw computed styles → upload screenshots to **Cloudinary** under `webimic/jobs/<jobId>/screenshots/` → extract tokens (`workers/extractors/{colors,typography,spacing,animations}.js`; colors run first because they need the screenshot buffers, then buffers are nulled and the other three run in parallel) → upsert a `DesignToken` doc → generate Doc A + Doc B PDFs and the LLM context JSON in parallel using a **single shared Puppeteer browser** (`workers/generators/{docA,docB,llmContext}.js`, HTML templates in `workers/templates/`).
5. Final results (Cloudinary URLs, token counts, page list) are written back onto the `Job` doc and the worker broadcasts `JOB_STATUS_UPDATE` with `progress: 100`.

`Job.toJSON` rewrites `_id → id` and aliases `docASize → pdfSize` to match what the client expects; preserve these when changing the schema.

### Live updates

`server.js` exposes a `WebSocketServer` on `/ws` and an exported `broadcast(data)` helper. The worker is given this function (or a logger fallback when running standalone) and emits two event types:
- `JOB_STATUS_UPDATE` — `{ jobId, status, progress }`
- `LOG` — `{ level, message, timestamp }`

The client's `Pipelines.jsx` route subscribes to this socket for live worker status and logs. The standalone worker process has no WS access, so live logs only appear when the worker is embedded.

### API surface

All routes are mounted under `/v1` in `server.js`:
- `auth` — JWT login/signup, token stored client-side in `localStorage` (`webimic_token`).
- `jobs` — CRUD + `GET /:id/status` (lightweight poll that also queries BullMQ for queue state — used as a WS fallback). Deleting a job also deletes the `webimic/jobs/<jobId>` Cloudinary folder and the associated `DesignToken` doc.
- `tokens` — `GET /` aggregates all of the current user's `DesignToken` docs into a single deduplicated catalog (used by the Token Catalogs page).
- `workers` — `GET /status` for queue counts and a synthesized 2-worker view derived from `analysisQueue` state.
- `settings` — user/account settings.

`middleware/auth.js` (`requireAuth`) is the only auth guard; protected routes attach `req.user`. `middleware/validate.js` runs Zod schemas and writes the parsed body to `req.validated` — read from there, not `req.body`, after `validate(...)`.

### Client structure

`client/src/App.jsx` defines all routes. Public pages live at `/`, `/how-it-works`, `/pricing`, `/docs`, `/changelog`, `/auth`; authenticated pages are under `/app/*` and gated by `ProtectedRoute`, which waits for `useAuthStore.authReady` before deciding. `bootstrapAuth()` runs once on mount to restore the session from the stored JWT.

State is split across three Zustand stores in `client/src/store/`: `useAuthStore`, `useJobsStore`, `useUIStore`. All HTTP goes through `client/src/lib/api.js` (it throws an error with `.isNetworkError = true` on connection refused — UI code branches on this).

### Plan limits

`PLAN_LIMITS` in `routes/jobs.js` is currently `Infinity` for all tiers — plan enforcement is intentionally disabled for MVP. The `req.user.jobsUsedThisMonth` counter is still incremented on every job creation.
