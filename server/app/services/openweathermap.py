import httpx
from fastapi import HTTPException
from ..core.config import settings

async def get_openweathermap_data(latitude: float, longitude: float):
    base_url = "https://api.openweathermap.org/data/3.0/onecall"
    params = {
        "lat": latitude,
        "lon": longitude,
        "units": "imperial",
        "appid": settings.OPEN_WEATHERMAP_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(base_url, params=params)
        data = resp.json()
        return data
