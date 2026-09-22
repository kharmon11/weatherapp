import httpx
import asyncio
import logging
from fastapi import HTTPException
from ..core.config import settings

logger = logging.getLogger("openweathermap")

CURRENT_URL = "https://api.openweathermap.org/data/4.0/onecall/current"
MINUTELY_URL = "https://api.openweathermap.org/data/4.0/onecall/timeline/1min"
DAILY_URL = "https://api.openweathermap.org/data/4.0/onecall/timeline/1day"

async def _fetch(client: httpx.AsyncClient, url: str, params: dict, retries: int):
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Requesting OpenWeatherMap data from {url}")
            resp = await client.get(url, params=params)
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

    logger.error(f"Failed to fetch weather data from {url} after {retries} attempts")
    raise HTTPException(status_code=504, detail="Timeout fetching weather data from OpenWeatherMap")

async def get_openweathermap_data(latitude: float, longitude: float, retries: int = 3):
    params = {
        "lat": latitude,
        "lon": longitude,
        "units": "imperial",
        "appid": settings.OPEN_WEATHERMAP_API_KEY,
    }

    timeout = httpx.Timeout(15.0)

    limits = httpx.Limits(max_keepalive_connections=0)
    async with httpx.AsyncClient(timeout=timeout, http2=False, limits=limits) as client:
        current_response, minutely_response, daily_response = await asyncio.gather(
            _fetch(client, CURRENT_URL, params, retries),
            _fetch(client, MINUTELY_URL, params, retries),
            _fetch(client, DAILY_URL, params, retries),
        )

    return {
        "lat": current_response["lat"],
        "lon": current_response["lon"],
        "timezone": current_response["timezone"],
        "timezone_offset": current_response["timezone_offset"],
        "current": current_response["data"][0],
        "daily": daily_response["data"],
        "minutely": minutely_response["data"],
    }
