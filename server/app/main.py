import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api.openweathermap import router as openweathermap_router

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

if ENV == "production":
    frontend_path = os.path.join(os.path.dirname(__file__), "../client-dist")
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

@app.get("/")
async def root():
    return {"message": "Backend Running & Serving Frontend"}

# /api/openweathermap endpoint
app.include_router(openweathermap_router, prefix="/api")