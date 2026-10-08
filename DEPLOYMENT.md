# Deployment

WeatherApp deploys automatically to Google Cloud Run via GitHub Actions. There is no routine manual deploy step — merging a pull request into `master` is the only action that ships code. The Cloud Run service `weatherapp` (region `us-central1`) serves `weather.kenharmon.net` and `wx.kenharmon.net`.

The app previously ran on App Engine; that deployment was retired and its pipeline job, `server/app.yaml.template` and `server/.gcloudignore` were removed. Anything App Engine-specific you find in the git history is no longer part of the deploy.

## Pipeline overview

Defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

**On every push and pull request** (any branch): the `backend-tests` and `frontend-tests` jobs run in parallel — `pytest` for the backend, `pnpm test` (Vitest) for the frontend. Both must pass for a PR to be mergeable.

**On push to `master` only**, after both test jobs pass, the `deploy-cloud-run` job runs:

1. **Authenticate to Google Cloud** via Workload Identity Federation (no static service account key is stored anywhere), then set up the Cloud SDK and Docker access to Artifact Registry.
2. **Build the image** from [`server/Dockerfile`](server/Dockerfile) (repo root as the build context, filtered by [`.dockerignore`](.dockerignore)). The frontend is built inside the image from the `VITE_*` build args described below.
3. **Push the image** to Artifact Registry, tagged with the commit SHA.
4. **Deploy a candidate revision** with `--no-traffic --tag=candidate`. This creates a real, running revision at its own stable URL, but `weather.kenharmon.net` keeps serving whatever was previously live. Nothing user-facing changes yet. The service runs as the `weatherapp-runtime` service account with `ENV=production` and `ALLOWED_ORIGINS` set, reads its two API keys from Secret Manager, and is limited to 0–2 instances with 512 MiB.
5. **Smoke test the candidate** — [`client/scripts/smoke-test.mjs`](client/scripts/smoke-test.mjs) launches headless Chromium, loads the candidate's URL, submits a real search ("Boston, MA"), and fails if:
   - an uncaught JavaScript exception occurs,
   - any unexpected console error is logged,
   - the location search form (`#location-input`) never renders, or
   - a real weather result never appears for the search.

   This check runs against the actual deployed artifact, not the build output, and exercises the real Geocoding → OpenWeatherMap → frontend round trip — it catches failures that only manifest at runtime in a browser (e.g. a missing build-time environment variable, a bad API key, or a broken backend integration), which a plain HTTP status check would miss entirely.

   **Known, accepted gap:** it does not verify the Google Map renders. Requests to `maps.googleapis.com` are intercepted and given an empty response before the page loads, so the real Maps script never runs during this check. The real script can't reliably load in a headless CI browser: GitHub's runners have no GPU, so Maps' WebGL-dependent rendering fails. Real users have a real GPU and load the script from the promoted custom domain (an allowed referrer).
6. **Promote to live traffic** — only reached if the smoke test passed: `gcloud run services update-traffic weatherapp --to-latest` shifts 100% of traffic to the new revision.

If the smoke test fails, step 6 never runs (GitHub Actions skips remaining steps in a job once a prior step fails) — the previously-live revision keeps serving all traffic, untouched, and the workflow run shows red at the smoke-test step with the specific failure printed in its log.

**Note:** the `push` trigger has no path filtering, so *any* push to `master` — including documentation-only changes — runs the full build-deploy-smoke-test-promote sequence. This is harmless (it deploys and promotes an identical, already-smoke-tested build) but means every merge to `master` pushes a new image and creates a new revision, whether or not the app itself changed.

## Required GitHub configuration

Configured under the repo's **Settings → Secrets and variables → Actions**.

### Variables (non-sensitive)

| Name | Purpose |
|---|---|
| `GCP_PROJECT_ID` | Target GCP project |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full resource name of the WIF provider used to authenticate |
| `GCP_SERVICE_ACCOUNT` | Email of the service account the pipeline impersonates via WIF |
| `ARTIFACT_REGISTRY_PATH` | Image path without a tag, e.g. `us-central1-docker.pkg.dev/<project-id>/weatherapp/app` |
| `RUNTIME_SA_EMAIL` | Service account the container runs as (`weatherapp-runtime@<project-id>.iam.gserviceaccount.com`) |
| `ALLOWED_ORIGINS` | CORS origins for the backend, set as an env var on the Cloud Run service |
| `VITE_GOOGLE_MAPS_MAP_ID` | Frontend build-time: Google Maps map ID |
| `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` | Frontend build-time: GA measurement ID |

Note: `VITE_API_BASE_URL` (used locally, see the frontend `.env` example in `README.md`) is deliberately **not** set in CI — leaving it unset makes deployed builds call their own origin instead of a fixed domain, which works correctly for every deployed environment. See `client/src/services/weatherService.ts`.

### Secrets (sensitive)

| Name | Purpose |
|---|---|
| `VITE_GOOGLE_MAPS_JAVASCRIPT_KEY` | Frontend build-time: Google Maps JS API key. Ends up publicly visible in the shipped JS bundle by design (that's how the Maps JS API works) — kept as a GitHub secret to avoid it sitting in the workflow source, and protected in production via HTTP-referrer restriction in Google Cloud Console rather than by being hidden. |

The two backend API keys are **not** GitHub secrets: the Cloud Run service gets `OPENWEATHERMAP_API_KEY` and `GOOGLE_MAPS_GEOCODING_KEY` from Secret Manager (`weatherapp-openweathermap-key`, `weatherapp-geocoding-key`, mounted as env vars at `:latest`). Because `:latest` is resolved when an instance starts, a rotated secret version takes effect after the next deploy (or a new revision). The test jobs use dummy key values set in the workflow.

None of the above are ever committed to the repository.

## GCP-side setup (already done; reference only)

The pipeline authenticates via Workload Identity Federation rather than a downloaded service account key:

- A dedicated service account (`github-actions-deployer`) holds:
  - `roles/run.admin` (project) — deploy revisions and shift traffic
  - `roles/artifactregistry.writer`, on the `weatherapp` repository only — push images
  - `roles/iam.serviceAccountUser`, on `weatherapp-runtime` only — deploy a service that runs as it
- A Workload Identity Pool + OIDC provider trusts GitHub Actions' own token issuer, restricted by an attribute condition to this specific repository.
- The service account is bound to `roles/iam.workloadIdentityUser`, restricted to a `principal://` matching pushes to `refs/heads/master` in this repo specifically — no other branch or repo can assume this identity, even though the provider itself is scoped more broadly.
- Artifact Registry Docker repository `weatherapp` in `us-central1`.
- Secret Manager secrets (above), readable (`roles/secretmanager.secretAccessor`) by the `weatherapp-runtime` service account only.
- The Cloud Run service was created by a manual first deploy (without `--no-traffic`, from an image built locally with the real `VITE_*` values). The pipeline's `--no-traffic --tag=candidate` → promote flow has been confirmed to work against the existing service.

None of this needs to change for routine development. It only needs revisiting if the GCP project, service account, or repository ownership changes. Any leftover App Engine roles on the deployer service account (`roles/appengine.*`, `roles/cloudbuild.builds.editor`, a project-wide `roles/iam.serviceAccountUser`) are no longer used and can be removed.

## Manual / emergency deploy

There's no supported manual deploy path — the pipeline is the deploy mechanism. If GitHub Actions is unavailable and a deploy is genuinely urgent, build the image locally as described at the top of [`server/Dockerfile`](server/Dockerfile) (real `VITE_*` build args), push it to Artifact Registry, and run `gcloud run deploy weatherapp` with the same flags the workflow uses. Be aware that this bypasses the smoke test, and the next successful pipeline run on `master` will supersede it anyway. Treat it as a last resort, not a routine option.

## Rollback

If a promoted revision turns out to be broken despite passing the smoke test (i.e. a failure mode the smoke test doesn't cover), traffic can be shifted back to an earlier revision without a new deploy:

```bash
gcloud run revisions list --service=weatherapp --region=us-central1 --project=<project-id>
gcloud run services update-traffic weatherapp \
  --to-revisions=<previous-revision>=100 \
  --region=us-central1 --project=<project-id>
```

A revision can only be rolled back to while its image still exists in Artifact Registry (see the image-retention note below).

## Housekeeping

- **Image retention.** Every push to `master` adds an image of about 60 MB to the `weatherapp` Artifact Registry repository, and the pipeline does not delete old ones. Set an Artifact Registry cleanup policy on the repository (for example, keep the newest 5 images) so storage stays small. Rolling back past the retained images is not possible.
- **Maps referrer list.** Make sure the Maps JS key's HTTP-referrer restriction lists only the real domains (`weather.kenharmon.net`, `wx.kenharmon.net`). Remove the temporary `run.app` entry that was added to test the map before the cutover, and any `appspot.com` entries.

## Known limitations

- **The smoke test does not verify the Google Map renders.** The real Maps JS script is intercepted and never actually loaded during the check (see `client/scripts/smoke-test.mjs`). Headless Chromium has no GPU on GitHub's runners, so the WebGL-dependent map rendering can't work there. If the map's own integration ever breaks (e.g. wrong Map ID, broken marker logic), this pipeline would not catch it — that would need to be checked manually against the promoted site after a deploy.
- **No manual approval gate.** Promotion is fully automatic once the smoke test passes — there's no human-in-the-loop review step before traffic shifts. This was a deliberate choice (see project history); adding one would mean splitting the `deploy-cloud-run` job and configuring a GitHub Environment with required reviewers.
- **GitHub Actions Node.js deprecation.** The `google-github-actions/auth` and `setup-gcloud` actions may show a Node.js 20 deprecation warning — GitHub auto-shims them to Node 24 for now, but this depends on Google shipping updated releases before Node 20 support is fully removed from Actions runners (expected fall 2026). Worth checking their release notes periodically.
