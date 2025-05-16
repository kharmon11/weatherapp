import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    GOOGLEMAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY")
    OPEN_WEATHERMAP_API_KEY: str = os.getenv("OPENWEATHERMAP_API_KEY")

settings = Settings()