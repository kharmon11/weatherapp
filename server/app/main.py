import os
import logging
# from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api.openweathermap import router as openweathermap_router

logging.basicConfig(
    level=logging.INFO,  # Or DEBUG for more detail
    format="%(levelname)s: %(asctime)s - %(name)s - %(message)s",
)

app = FastAPI()
ENV = os.getenv("ENV")
if ENV == "production":
    origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
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
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")


