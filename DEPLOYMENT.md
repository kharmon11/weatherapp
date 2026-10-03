# Deployment

WeatherApp deploys automatically to Google Cloud App Engine via GitHub Actions. There is no routine manual deploy step — merging a pull request into `master` is the only action that ships code.

> **Now served from Cloud Run:** `weather.kenharmon.net` and `wx.kenharmon.net` were moved to Cloud Run (see [Cloud Run deployment](#cloud-run-deployment)). `ci-cd.yml` still has *two* deploy jobs that both run on every `master` push: `deploy-cloud-run` (the live pipeline) and `deploy` (App Engine, described below). The App Engine job is now only a temporary fallback and will be removed when App Engine is retired. Everything below that describes App Engine is therefore historical until then.

## Pipeline overview

Defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

**On every push and pull request** (any branch): the `backend-tests` and `frontend-tests` jobs run in parallel — `pytest` for the backend, `pnpm test` (Vitest) for the frontend. Both must pass for a PR to be mergeable.

**On push to `master` only**, after both test jobs pass, the `deploy` job runs:

1. **Build the frontend** — `pnpm run build` (type-check, `vite build`, copy into `server/app/dist`), using the `VITE_*` build-time variables described below.
2. **Authenticate to Google Cloud** via Workload Identity Federation (no static service account key is stored anywhere).
3. **Render `server/app.yaml`** from the committed, secret-free `server/app.yaml.template`, substituting real values from GitHub secrets/variables via `envsubst`.
4. **Compute a version id** — `sha-<short commit sha>` — so every deployed App Engine version is traceable back to the commit that produced it.
5. **Deploy to App Engine with `promote: false`** — this creates a real, running version at its own dedicated URL, but `weather.kenharmon.net` keeps serving whatever was previously live. Nothing user-facing changes yet.
6. **Smoke test the new version** — [`client/scripts/smoke-test.mjs`](client/scripts/smoke-test.mjs) launches headless Chromium, loads the new version's own URL, submits a real search ("Boston, MA"), and fails if:
   - an uncaught JavaScript exception occurs,
   - any unexpected console error is logged,
   - the location search form (`#location-input`) never renders, or
   - a real weather result never appears for the search.

   This check runs against the actual deployed artifact, not the build output, and exercises the real Geocoding → OpenWeatherMap → frontend round trip — it catches failures that only manifest at runtime in a browser (e.g. a missing build-time environment variable, or a broken backend integration), which a plain HTTP status check would miss entirely.

   **Known, accepted gap:** it does not verify the Google Map renders. Requests to `maps.googleapis.com` are intercepted and given an empty response before the page loads, so the real Maps script never runs during this check. The real script can't reliably load in *any* headless CI browser — its HTTP-referrer restriction can't cover the ephemeral per-deploy hostname, and separately, GitHub's runners have no GPU, so Maps' WebGL-dependent rendering fails too. Both are real, confirmed dead ends, not assumptions. Real users never hit either problem: they load the real script from the promoted custom domain (an allowed referrer) with a real GPU.
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
| `VITE_GOOGLE_MAPS_MAP_ID` | Frontend build-time: Google Maps map ID |
| `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` | Frontend build-time: GA measurement ID |

Note: `VITE_API_BASE_URL` (used locally, see the frontend `.env` example in `README.md`) is deliberately **not** set in CI — leaving it unset makes deployed builds call their own origin instead of a fixed domain, which works correctly for every deployed environment. See `client/src/services/weatherService.ts`.

### Secrets (sensitive)

| Name | Purpose |
|---|---|
| `OPENWEATHERMAP_API_KEY` | Backend: OpenWeatherMap API key, rendered into `app.yaml` |
| `GOOGLE_MAPS_GEOCODING_KEY` | Backend: Google Geocoding API key, rendered into `app.yaml` |
| `VITE_GOOGLE_MAPS_JAVASCRIPT_KEY` | Frontend build-time: Google Maps JS API key. Ends up publicly visible in the shipped JS bundle by design (that's how the Maps JS API works) — kept as a GitHub secret to avoid it sitting in the workflow source, and protected in production via HTTP-referrer restriction in Google Cloud Console rather than by being hidden. Its referrer restriction can't cover the ephemeral non-promoted-candidate hostname (Google doesn't support wildcarding the per-deploy `sha-<hash>-dot-...appspot.com` shape) — one of two reasons the real Maps script is never actually called during the smoke test (see the gap noted in the pipeline overview above), rather than something worked around per-error. The app has since moved to Cloud Run, whose tagged candidate URL is stable and could be allowed as an exact referrer, which removes the hostname problem; the missing GPU on the runners remains, so the smoke test still intercepts the Maps script. |

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

## Cloud Run deployment

The `deploy-cloud-run` job in `.github/workflows/ci-cd.yml` runs alongside the App Engine `deploy` job on every push to `master`. It deploys to a Cloud Run service named `weatherapp` in `us-central1`, which now serves `weather.kenharmon.net` and `wx.kenharmon.net`. The App Engine job (and everything above that describes App Engine) is removed once that service is retired.

**What the job does** (same shape as the App Engine flow): builds the image from [`server/Dockerfile`](server/Dockerfile) (repo root as the build context, filtered by [`.dockerignore`](.dockerignore); the frontend is built inside the image from the `VITE_*` build args), pushes it to Artifact Registry tagged with the commit SHA, deploys it with `--no-traffic --tag=candidate`, runs the same `client/scripts/smoke-test.mjs` against the candidate URL, and only then runs `gcloud run services update-traffic ... --to-latest`. A failed smoke test leaves the previous revision serving all traffic.

**Additional GitHub variables** (Settings → Secrets and variables → Actions → Variables):

| Name | Purpose |
|---|---|
| `ARTIFACT_REGISTRY_PATH` | Image path without a tag, e.g. `us-central1-docker.pkg.dev/<project-id>/weatherapp/app` |
| `RUNTIME_SA_EMAIL` | Service account the container runs as (`weatherapp-runtime@<project-id>.iam.gserviceaccount.com`) |

The existing `GCP_*`, `ALLOWED_ORIGINS`, and `VITE_*` variables and the `VITE_GOOGLE_MAPS_JAVASCRIPT_KEY` secret are reused as-is. The two backend API keys are **not** read from GitHub by this job: the service gets `OPENWEATHERMAP_API_KEY` and `GOOGLE_MAPS_GEOCODING_KEY` from Secret Manager (`weatherapp-openweathermap-key`, `weatherapp-geocoding-key`, mounted as env vars at `:latest`). The GitHub copies of those two secrets stay only for the App Engine job until it is retired. Because `:latest` is resolved when an instance starts, a rotated secret version takes effect after the next deploy (or a new revision).

**GCP-side setup (done once, by hand):**
- Artifact Registry Docker repository `weatherapp` in `us-central1` (separate from App Engine's `gae-standard` repository).
- Secret Manager secrets above, readable (`roles/secretmanager.secretAccessor`) by the `weatherapp-runtime` service account only.
- The existing deployer service account additionally holds `roles/run.admin` (project), `roles/artifactregistry.writer` (on the `weatherapp` repository), and `roles/iam.serviceAccountUser` (on `weatherapp-runtime` only).
- The Cloud Run service was created by a manual first deploy (without `--no-traffic`, from an image built locally with the real `VITE_*` values). The pipeline's `--no-traffic --tag=candidate` → promote flow has been confirmed to work against the existing service.

**Rollback on Cloud Run** — shift traffic back to an earlier revision without a new deploy:

```bash
gcloud run revisions list --service=weatherapp --region=us-central1 --project=<project-id>
gcloud run services update-traffic weatherapp \
  --to-revisions=<previous-revision>=100 \
  --region=us-central1 --project=<project-id>
```

**Temporary Maps referrer entry:** to test the map before the cutover, the service's own `run.app` URL was added to the Maps JS key's HTTP-referrer restriction. It is no longer needed now that the custom domains point at Cloud Run and should be removed from the key. The `candidate---...run.app` URL the pipeline smoke-tests is stable across deploys (it is derived from the tag and the service), so it could be added as an exact referrer, but that would not change the smoke test: the real Maps script still can't render on GitHub's GPU-less runners, so the test continues to intercept it.

**Still to do:** retire App Engine (delete versions, disable the app, clear the `gae-standard` images and staging buckets), then remove the App Engine job, `server/app.yaml.template`, `server/.gcloudignore`, the `appspot.com` entries from `ALLOWED_ORIGINS`, the deployer service account's App Engine roles, and the App Engine-specific parts of these docs.

## Known limitations

- **The smoke test does not verify the Google Map renders.** The real Maps JS script is intercepted and never actually loaded during the check (see `client/scripts/smoke-test.mjs`). It can't reliably load in any headless CI browser regardless of configuration: its HTTP-referrer restriction can't cover the ephemeral per-deploy hostname, and separately, headless Chromium has no GPU on GitHub's runners, so the WebGL-dependent map rendering fails too. Both were hit and confirmed directly, not assumed. If the map's own integration ever breaks (e.g. wrong Map ID, broken marker logic), this pipeline would not catch it — that would need to be checked manually against the promoted URL after a deploy. Now that the app is on Cloud Run, the hostname half of this no longer applies (the tagged candidate URL is stable and could be allowed as an exact referrer), but the GPU half does, so this gap remains.
- **No manual approval gate.** Promotion is fully automatic once the smoke test passes — there's no human-in-the-loop review step before traffic shifts. This was a deliberate choice (see project history); adding one would mean splitting the `deploy` job and configuring a GitHub Environment with required reviewers.
- **No version cleanup.** Every push to `master` leaves a version behind, promoted or not.
- **Two GitHub Actions still show a Node.js 20 deprecation warning** (`google-github-actions/auth`, `google-github-actions/deploy-appengine`) — GitHub auto-shims them to Node 24 for now, but this depends on Google shipping an updated release before Node 20 support is fully removed from Actions runners (expected fall 2026). Worth checking their release notes periodically.
