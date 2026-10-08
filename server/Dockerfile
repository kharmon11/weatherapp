# Container image for the Cloud Run deployment. Build from the REPO ROOT so both
# client/ and server/ are in the build context:
#   docker build -f server/Dockerfile \
#     --build-arg VITE_GOOGLE_MAPS_JAVASCRIPT_KEY=... \
#     --build-arg VITE_GOOGLE_MAPS_MAP_ID=... \
#     --build-arg VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID=... \
#     -t weatherapp:local .

# Stage 1: build the frontend
FROM node:22-slim AS frontend-build
RUN npm install -g pnpm@11
WORKDIR /app/client
COPY client/package.json client/pnpm-lock.yaml client/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY client/ ./
# VITE_* values are baked into the bundle at build time (see validateEnv.ts).
# VITE_API_BASE_URL is deliberately left unset: the frontend calls its own origin.
ARG VITE_GOOGLE_MAPS_JAVASCRIPT_KEY
ARG VITE_GOOGLE_MAPS_MAP_ID
ARG VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID
ENV VITE_GOOGLE_MAPS_JAVASCRIPT_KEY=$VITE_GOOGLE_MAPS_JAVASCRIPT_KEY \
    VITE_GOOGLE_MAPS_MAP_ID=$VITE_GOOGLE_MAPS_MAP_ID \
    VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID=$VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID
# `pnpm run build` ends with copy-dist, which writes to ../server/app/dist;
# that directory's parent just has to exist in this stage. The real copy into
# the runtime image happens in stage 2.
RUN mkdir -p /app/server/app && pnpm run build

# Stage 2: runtime
FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV=production
WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY server/app ./app
COPY --from=frontend-build /app/client/dist ./app/dist
RUN useradd --system --no-create-home appuser
USER appuser
# Cloud Run injects $PORT (8080 by default). Worker count is kept low for the
# default 512 MiB / 1 vCPU instance; raise it together with the memory limit.
# --worker-tmp-dir /dev/shm is gunicorn's recommended setting on container
# platforms (its heartbeat files otherwise land on a disk-backed /tmp).
CMD exec gunicorn -w 2 -k uvicorn.workers.UvicornWorker --worker-tmp-dir /dev/shm -b :${PORT:-8080} app.main:app
