import httpx
import asyncio
import logging
from fastapi import HTTPException
from ..core.config import settings

logger = logging.getLogger("openweathermap")

async def get_openweathermap_data(latitude: float, longitude: float, retries: int = 3):
    base_url = "https://api.openweathermap.org/data/3.0/onecall"
    params = {
        "lat": latitude,
        "lon": longitude,
        "units": "imperial",
        "appid": settings.OPEN_WEATHERMAP_API_KEY,
    }

    timeout = httpx.Timeout(15.0)

    limits = httpx.Limits(max_keepalive_connections=0)
    async with httpx.AsyncClient(timeout=timeout, http2=False, limits=limits) as client:
        for attempt in range(1, retries + 1):
            try:
                logger.info(f"Requesting OpenWeatherMap data for {latitude}, {longitude}")
                resp = await client.get(base_url, params=params)
                resp.raise_for_status()
                return resp.json()
            except (httpx.ConnectTimeout , httpx.ReadTimeout) as e:
                logger.warning(f"Timeout fetching weather data on attempt {attempt}: {e}")
                await asyncio.sleep(2 * attempt)
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error {e.response.status_code} from OpenWeatherMap: {e.response.text}")
                raise HTTPException(status_code=502, detail="Error fetching weather data from OpenWeatherMap")
            except httpx.RequestError as e:
                logger.error(f"Request error contacting OpenWeatherMap: {e}")
                raise HTTPException(status_code=502, detail="Connection error to OpenWeatherMap")

    logger.error(f"Failed to fetch weather data after {retries} attempts")
    raise HTTPException(status_code=504, detail="Timeout fetching weather data from OpenWeatherMap")