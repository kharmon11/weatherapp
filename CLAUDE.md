# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WeatherApp is a full-stack weather application that shows current conditions and an 8-day forecast for a user-selected location (search by city, browser geolocation, or map click). It has a React/TypeScript frontend and a FastAPI backend; the backend geocodes the location via the Google Maps Geocoding API, then fetches weather from OpenWeatherMap's One Call API 3.0. It is live in production at https://weather.kenharmon.net.

## Tech stack

- **Frontend**: React 19, TypeScript, Vite 7, Sass, `@vis.gl/react-google-maps`, Recharts (forecast graphs), Axios, FontAwesome/react-icons. Package manager: pnpm (npm also works).
- **Backend**: Python 3.11, FastAPI, served via Uvicorn (dev) / Gunicorn+UvicornWorker (prod), httpx for outbound API calls, Pydantic Settings for config.
- **Deployment**: Google Cloud App Engine (standard env, `server/app.yaml`).

## Common commands

### Frontend (run from `client/`)
- `pnpm run dev` — start Vite dev server at `http://localhost:5173`
- `pnpm run build` — type-unchecked prod build (`vite build`), then runs `copy-dist`
- `pnpm run copy-dist` — deletes `../server/app/dist` and copies the built `dist/` there (this is how the frontend gets served by FastAPI in prod)
- `pnpm run build0` — `tsc -b && vite build`, i.e. build with a TypeScript type check first (use this to actually catch type errors; plain `build` does not type-check)
- `pnpm run lint` — ESLint (flat config, `eslint.config.js`)
- `pnpm run preview` — preview the production build locally

### Backend (run from `server/`, with venv active)
- `uvicorn app.main:app --reload` — dev server at `http://localhost:8000`
- `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app` — prod entrypoint (matches `app.yaml`)
- `pip install -r requirements.txt -r requirements-dev.txt` — install prod + test deps (test deps are split into `requirements-dev.txt` so they don't ship to prod)
- `pytest` — run the backend test suite (`server/tests/`, config in `server/pytest.ini`). No Python linter is configured.

### Structure doc
- `scripts/generate-structure.sh` regenerates the file tree block in `README.md` (between `<!-- START STRUCTURE -->`/`<!-- END STRUCTURE -->`). Requires `tree`.

There is no root-level build tooling — the root `package.json`/`pnpm-lock.yaml`/`requirements.txt` are legacy/unused; always `cd client` or `cd server` first.

## Architecture notes

- **`server/app/main.py`** — FastAPI app entrypoint. CORS origins come from `ALLOWED_ORIGINS` env var in production, hardcoded localhost otherwise. When `ENV=production`, it additionally serves the built frontend as static files (mounted at `/`) plus an explicit `no-cache` route for `index.html` (for cache-busting on deploys). In dev, only the API runs — the frontend is served separately by Vite.
- **`server/app/api/openweathermap.py`** — the only API route, `GET /api/openweathermap?location=`. `location` is either a free-text address or a `"lat,lon"` pair (detected via `is_coordinates`). Flow: geocode → fetch weather → merge and return.
- **`server/app/services/geocode.py`** and **`services/openweathermap.py`** — thin async wrappers around the Google Geocoding API and OpenWeatherMap One Call API respectively, using `httpx`. The weather call retries on timeout (3 attempts, backoff) and translates upstream failures into `HTTPException`s with `{error_type, message}` detail payloads — the frontend depends on this shape.
- **`server/app/core/config.py`** — Pydantic `Settings` pulling `GOOGLE_MAPS_GEOCODING_KEY` / `OPENWEATHERMAP_API_KEY` from env (`.env` via `python-dotenv` in dev, `app.yaml` `env_variables` in prod).
- **`server/tests/`** — pytest suite covering `main.py` (CORS/static-mount branching by env), the `/api/openweathermap` route, both service wrappers, `is_coordinates`, and `Settings`. Outbound HTTP to Google/OpenWeatherMap is mocked with `respx` at the transport level (service-layer tests) or by patching the service functions directly (route-level tests) — no test ever makes a real API call. A `conftest.py` fixture stubs `settings` with dummy keys for every test.
- **`client/src/hooks/useWeather.tsx`** — central state/data-fetching hook (weather data, loading, error state) used by `Body.tsx`; all three fetch triggers (form submit, geolocation, map click) funnel through `fetchWeather`.
- **`client/src/services/weatherService.ts`** — the single Axios call to the backend; normalizes Axios errors into `{error_type, message}` objects consumed by `useWeather`.
- **`client/src/components/Body/`** — main UI: `LocationForm` (search/geolocation), `Current` + `GoogleMap` + `WindVane` + `MinutelyChart` (current conditions), `WeekForecast/` (`DailyForecasts` list + `WeekGraphs` temp/wind charts via Recharts). `Current` and `WeekForecast` are lazy-loaded (`React.lazy`) to keep initial bundle small.
- Frontend/backend are coupled by the `copy-dist` step: the client build output must land at `server/app/dist` for the FastAPI prod server to find and serve it.

## Deployment

- Target: **Google Cloud App Engine** (standard environment, Python 3.11 runtime), config in `server/app.yaml`.
- `app.yaml` sets `entrypoint`, `env_variables` (`ENV`, `ALLOWED_ORIGINS`, `OPENWEATHERMAP_API_KEY`, `GOOGLE_MAPS_GEOCODING_KEY`), and `automatic_scaling.target_cpu_utilization: 0.65`.
- `app.yaml` and both `.env` files are gitignored — they exist locally with real production secrets in them but are **not** committed. Never add or force-commit them.
- Deploy sequence: `cd client && pnpm run build` (builds and copies dist into `server/app/dist`), then `gcloud app deploy server/app.yaml` from `server/`.
- `server/.gcloudignore` excludes `.git`, `.gitignore`, `__pycache__/`, `/setup.cfg`, `/scripts`, `/tests`, `requirements-dev.txt`, and `pytest.ini` from the upload.
- Known production origins configured in `ALLOWED_ORIGINS`: `weather.kenharmon.net`, `wx.kenharmon.net`, the raw appspot.com URL, plus staging domains (`staging.kenharmon.net`, a separate `staging-*.appspot.com` project).

## Conventions

- Backend Python: 2-space indentation in `main.py`, `core/config.py`, and `api/openweathermap.py`; 4-space indentation in `services/*.py`. Match whichever file you're editing rather than reformatting.
- Backend errors are raised as `HTTPException(status_code=..., detail={"error_type": ..., "message": ...})` (or a plain string for generic 500s) — keep this shape since the frontend pattern-matches on `error_type`/`message`.
- Frontend: 4-space indentation, function components, `.tsx`/`.ts` with explicit `type`-only imports (`import type {...}`), hooks in `src/hooks/`, one-off helpers in `src/utils/`, Axios types in `src/types/`. Sass files live alongside their component (`Component.tsx` + `Component.sass`).
- Backend has a pytest suite (`server/tests/`, see Architecture notes) — run it after backend changes. Frontend still has no test suite (no Jest/Vitest config); if adding frontend tests, you'll need to set up tooling first.
- The `README.md` project-structure block is generated, not hand-edited — update it via `scripts/generate-structure.sh`, not by hand.

## Things to be careful with

- **This is a live production app** at weather.kenharmon.net (App Engine). Treat deploy-triggering actions (`gcloud app deploy`, editing `server/app.yaml`) as high-impact — confirm with the user before running or changing them.
- `server/app.yaml` (gitignored, present locally) contains real production API keys in plaintext. Don't print its contents, copy it elsewhere, or commit it.
- `pnpm run build` (used by `copy-dist`/deploy) does **not** type-check; a build can "succeed" with type errors. Use `pnpm run build0` if you need a real type-check.
- Changing the `/api/openweathermap` response shape or the `{error_type, message}` error shape requires updating `weatherService.ts`/`useWeather.tsx` in lockstep — they're tightly coupled to it.
- `ALLOWED_ORIGINS` is required and validated at startup in production (`main.py` raises if unset/empty) — don't remove that check.
