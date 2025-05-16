from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.openweathermap import router as openweathermap_router

app = FastAPI()

origins = [
    "http://localhost:5173",
    "localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return "Hello World"

# /api/openweathermap endpoint
app.include_router(openweathermap_router, prefix="/api")