import os
import re
import logging
# from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .api.openweathermap import router as openweathermap_router

logging.basicConfig(
  level=logging.INFO,  # Or DEBUG for more detail
  format="%(levelname)s: %(asctime)s - %(name)s - %(message)s",
)

app = FastAPI()
ENV = os.getenv("ENV")

# Non-promoted candidate deploys (version id "sha-<7 hex chars>", see
# ci-cd.yml's `version=sha-${GITHUB_SHA:0:7}`) are only reachable at their own
# per-version appspot.com URL, which isn't in ALLOWED_ORIGINS. The frontend's
# API base URL is fixed at build time to the production domain regardless of
# which version it's served from, so the smoke test's own candidate origin
# must be allowed here or every deploy fails at the smoke-test step.
CANDIDATE_HOSTNAME_PATTERN = re.compile(
  r"sha-[0-9a-f]{7}-dot-weatherapp-149500\.[a-z0-9-]+\.r\.appspot\.com"
)
CANDIDATE_ORIGIN_REGEX = rf"^https://{CANDIDATE_HOSTNAME_PATTERN.pattern}$"

if ENV == "production":
  allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
  if not allowed_origins_env:
    raise ValueError("ALLOWED_ORIGINS environment variable must be set in production")
  origins = allowed_origins_env.split(",")
else:
  origins = ["http://localhost:5173", "localhost:5173"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_origin_regex=CANDIDATE_ORIGIN_REGEX if ENV == "production" else None,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

# /api/openweathermap endpoint
app.include_router(openweathermap_router, prefix="/api")
print("OpenWeatherMap router registered at /api")

if ENV == "production":
  frontend_path = os.path.join(os.path.dirname(__file__), "dist")  # No extra "../"

  @app.get("/", response_class=FileResponse)
  async def server_index():
    return FileResponse(
      os.path.join(frontend_path, "index.html"),
      headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
    )

  app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
