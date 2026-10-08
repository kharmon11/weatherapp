import os
import logging
# from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .api.openweathermap import router as openweathermap_router

logging.basicConfig(
  level=logging.INFO,  # Or DEBUG for more detail
  format="%(levelname)s: %(asctime)s - %(name)s - %(message)s",
)

app = FastAPI()
ENV = os.getenv("ENV")

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
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

# Compress responses over 1 KB (the JS bundle is ~3x smaller on the wire).
# Level 5 gives nearly the size of the default 9 at a fraction of the CPU.
# Added after CORS so it wraps (is outermost to) every response.
app.add_middleware(GZipMiddleware, minimum_size=1024, compresslevel=5)

# /api/openweathermap endpoint
app.include_router(openweathermap_router, prefix="/api")
print("OpenWeatherMap router registered at /api")

class HashedAssetStaticFiles(StaticFiles):
  """Serves the Vite build; marks content-hashed /assets/* files as immutable.

  Vite fingerprints everything under assets/, so a changed file always gets a
  new URL and can be cached for a year. Only successful responses get the
  header so a missing file's 404 is never cached. index.html is served by the
  explicit no-cache route below and is not touched here.
  """

  async def get_response(self, path, scope):
    response = await super().get_response(path, scope)
    if path.startswith("assets/") and response.status_code in (200, 304):
      response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


if ENV == "production":
  frontend_path = os.path.join(os.path.dirname(__file__), "dist")  # No extra "../"

  @app.get("/", response_class=FileResponse)
  async def server_index():
    return FileResponse(
      os.path.join(frontend_path, "index.html"),
      headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
    )

  app.mount("/", HashedAssetStaticFiles(directory=frontend_path, html=True), name="static")
