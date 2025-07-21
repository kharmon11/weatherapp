import os
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

if ENV == "production":
  origins = os.getenv("ALLOWED_ORIGINS").split(",")
  if not origins or origins == [""]:
    raise ValueError("ALLOWED_ORIGINS environment variable must be set in production")
else:
  origins = ["http://localhost:5173", "localhost:5173"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
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
