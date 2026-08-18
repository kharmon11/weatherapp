# Deployment

WeatherApp deploys automatically to Google Cloud App Engine via GitHub Actions. There is no routine manual deploy step — merging a pull request into `master` is the only action that ships code.

## Pipeline overview

Defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

**On every push and pull request** (any branch): the `backend-tests` and `frontend-tests` jobs run in parallel — `pytest` for the backend, `pnpm test` (Vitest) for the frontend. Both must pass for a PR to be mergeable.

**On push to `master` only**, after both test jobs pass, the `deploy` job runs:

1. **Build the frontend** — `pnpm run build` (type-check, `vite build`, copy into `server/app/dist`), using the `VITE_*` build-time variables described below.
2. **Authenticate to Google Cloud** via Workload Identity Federation (no static service account key is stored anywhere).
3. **Render `server/app.yaml`** from the committed, secret-free `server/app.yaml.template`, substituting real values from GitHub secrets/variables via `envsubst`.
4. **Compute a version id** — `sha-<short commit sha>` — so every deployed App Engine version is traceable back to the commit that produced it.
5. **Deploy to App Engine with `promote: false`** — this creates a real, running version at its own dedicated URL, but `weather.kenharmon.net` keeps serving whatever was previously live. Nothing user-facing changes yet.
6. **Smoke test the new version** — [`client/scripts/smoke-test.mjs`](client/scripts/smoke-test.mjs) launches headless Chromium, loads the new version's own URL, and fails if:
   - an uncaught JavaScript exception occurs,
   - a console error is logged, or
   - the location search form (`#location-input`) never renders.

   This check runs against the actual deployed artifact, not the build output — it catches failures that only manifest at runtime in a browser (e.g. a missing build-time environment variable), which a plain HTTP status check would miss entirely.
7. **Promote to live traffic** — only reached if the smoke test passed. `gcloud app services set-traffic default --splits=<version>=1` shifts 100% of traffic to the new version.

If the smoke test fails, step 7 never runs (GitHub Actions skips remaining steps in a job once a prior step fails) — the previously-live version keeps serving all traffic, untouched, and the workflow run shows red at the smoke-test step with the specific failure printed in its log.

**Note:** the `push` trigger has no path filtering, so *any* push to `master` — including documentation-only changes — runs the full build-deploy-smoke-test-promote sequence. This is harmless (it just deploys and promotes an identical, already-smoke-tested build) but means every merge to `master` creates a new App Engine version, whether or not the app itself changed.

## Required GitHub configuration

Configured under the repo's **Settings → Secrets and variables → Actions**.

### Variables (non-sensitive)

| Name | Purpose |
|---|---|
| `GCP_PROJECT_ID` | Target GCP project |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full resource name of the WIF provider used to authenticate |
| `GCP_SERVICE_ACCOUNT` | Email of the service account the pipeline impersonates via WIF |
| `ALLOWED_ORIGINS` | CORS origins for the backend, rendered into `app.yaml` |
| `VITE_API_BASE_URL` | Frontend build-time: backend base URL |
| `VITE_GOOGLE_MAPS_MAP_ID` | Frontend build-time: Google Maps map ID |
| `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` | Frontend build-time: GA measurement ID |

### Secrets (sensitive)

| Name | Purpose |
|---|---|
| `OPENWEATHERMAP_API_KEY` | Backend: OpenWeatherMap API key, rendered into `app.yaml` |
| `GOOGLE_MAPS_GEOCODING_KEY` | Backend: Google Geocoding API key, rendered into `app.yaml` |
| `VITE_GOOGLE_MAPS_JAVASCRIPT_KEY` | Frontend build-time: Google Maps JS API key. Ends up publicly visible in the shipped JS bundle by design (that's how the Maps JS API works) — kept as a GitHub secret to avoid it sitting in the workflow source, and protected in production via HTTP-referrer restriction in Google Cloud Console rather than by being hidden. |

None of the above are ever committed to the repository. `server/app.yaml.template` and the workflow file reference them by name only.

## GCP-side setup (already done; reference only)

The pipeline authenticates via Workload Identity Federation rather than a downloaded service account key:

- A dedicated service account (`github-actions-deployer`) holds:
  - `roles/appengine.deployer`, `roles/appengine.serviceAdmin` (deploy + traffic control)
  - `roles/cloudbuild.builds.editor`, `roles/iam.serviceAccountUser` (App Engine standard deploys go through Cloud Build)
  - `roles/storage.objectAdmin`, scoped to just the App Engine staging bucket (`staging.<project-id>.appspot.com`) — not project-wide
- A Workload Identity Pool + OIDC provider trusts GitHub Actions' own token issuer, restricted by an attribute condition to this specific repository.
- The service account is bound to `roles/iam.workloadIdentityUser`, restricted to a `principal://` matching pushes to `refs/heads/master` in this repo specifically — no other branch or repo can assume this identity, even though the provider itself is scoped more broadly.

None of this needs to change for routine development. It only needs revisiting if the GCP project, service account, or repository ownership changes.

## Manual / emergency deploy

There's no supported manual deploy path — the pipeline is the deploy mechanism. If GitHub Actions is unavailable and a deploy is genuinely urgent, `gcloud app deploy server/app.yaml` still works from a local checkout with a real `server/app.yaml`, but be aware:
- it bypasses the smoke test and promotes immediately (no `promote: false` safety net),
- the next successful pipeline run on `master` will supersede it with its own version anyway.

Treat this as a last resort, not a routine option.

## Rollback

If a promoted version turns out to be broken despite passing the smoke test (i.e. a failure mode the smoke test doesn't cover), traffic can be shifted back to a previous version without a new deploy:

```bash
# List recent versions and see which one was previously live
gcloud app versions list --service=default --project=<project-id>

# Shift 100% of traffic back to a known-good version
gcloud app services set-traffic default \
  --splits=<previous-version-id>=1 \
  --project=<project-id> \
  --quiet
```

Old, un-promoted versions (including ones left behind by failed smoke tests) accumulate in App Engine over time — there's currently no automated cleanup. Pruning them periodically via `gcloud app versions delete` is a manual, low-priority housekeeping task, not something the pipeline handles.

## Known limitations

- **No manual approval gate.** Promotion is fully automatic once the smoke test passes — there's no human-in-the-loop review step before traffic shifts. This was a deliberate choice (see project history); adding one would mean splitting the `deploy` job and configuring a GitHub Environment with required reviewers.
- **No version cleanup.** Every push to `master` leaves a version behind, promoted or not.
- **Two GitHub Actions still show a Node.js 20 deprecation warning** (`google-github-actions/auth`, `google-github-actions/deploy-appengine`) — GitHub auto-shims them to Node 24 for now, but this depends on Google shipping an updated release before Node 20 support is fully removed from Actions runners (expected fall 2026). Worth checking their release notes periodically.
