import httpx
import asyncio
import logging
from fastapi import HTTPException
from ..core.cache import TTLCache
from ..core.config import settings

logger = logging.getLogger("openweathermap")

CURRENT_URL = "https://api.openweathermap.org/data/4.0/onecall/current"
MINUTELY_URL = "https://api.openweathermap.org/data/4.0/onecall/timeline/1min"
DAILY_URL = "https://api.openweathermap.org/data/4.0/onecall/timeline/1day"

# OpenWeatherMap refreshes the product every ~10 minutes and documents no
# per-endpoint schedule, so each endpoint gets its own conservative TTL: the
# minutely series is anchored on "now" so it expires fastest. Cached payloads
# are shared between callers and must be treated as read-only.
_CACHE_TTLS = {CURRENT_URL: 5 * 60, MINUTELY_URL: 2 * 60, DAILY_URL: 10 * 60}
_caches = {url: TTLCache(maxsize=256, ttl=ttl) for url, ttl in _CACHE_TTLS.items()}


async def _fetch_cached(client: httpx.AsyncClient, url: str, params: dict, retries: int):
    # Key on ~110 m cells (3 decimals), matching OpenWeather's advertised
    # 100 m resolution; the request itself still uses the exact coordinates.
    key = (round(params["lat"], 3), round(params["lon"], 3))
    cache = _caches[url]
    cached = cache.get(key)
    if cached is not None:
        return cached
    data = await _fetch(client, url, params, retries)  # raises on failure: errors are never cached
    cache.set(key, data)
    return data


async def _fetch(client: httpx.AsyncClient, url: str, params: dict, retries: int):
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Requesting OpenWeatherMap data from {url}")
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except (httpx.ConnectTimeout , httpx.ReadTimeout) as e:
            logger.warning(f"Timeout fetching weather data on attempt {attempt}: {e}")
            if attempt < retries:  # no point backing off when there is no next attempt
                await asyncio.sleep(2 * attempt)
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} from OpenWeatherMap: {e.response.text}")
            raise HTTPException(status_code=502, detail="Error fetching weather data from OpenWeatherMap")
        except httpx.RequestError as e:
            logger.error(f"Request error contacting OpenWeatherMap: {e}")
            raise HTTPException(status_code=502, detail="Connection error to OpenWeatherMap")
        except ValueError:
            logger.error(f"OpenWeatherMap returned a non-JSON response from {url}")
            raise HTTPException(status_code=502, detail="Invalid response from OpenWeatherMap")

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
        tasks = [
            asyncio.create_task(_fetch_cached(client, url, params, retries))
            for url in (CURRENT_URL, MINUTELY_URL, DAILY_URL)
        ]
        try:
            current_response, minutely_response, daily_response = await asyncio.gather(*tasks)
        except BaseException:
            # gather() leaves the other calls running when one fails, and they
            # would keep retrying against a client that is about to be closed.
            for task in tasks:
                task.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)
            raise

    return {
        "lat": current_response["lat"],
        "lon": current_response["lon"],
        "timezone": current_response["timezone"],
        "timezone_offset": current_response["timezone_offset"],
        "current": current_response["data"][0],
        "daily": daily_response["data"],
        "minutely": minutely_response["data"],
    }
