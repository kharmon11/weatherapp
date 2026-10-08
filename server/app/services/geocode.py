import httpx
import logging
from fastapi import HTTPException
from ..core.config import settings

logger = logging.getLogger(__name__)


def _format_coordinate(value: float, positive: str, negative: str) -> str:
    """Format a coordinate as an unsigned magnitude plus hemisphere, e.g. '71.06 \u00B0W'."""
    return f"{abs(round(value, 2))} \u00B0{positive if value >= 0 else negative}"


async def geocode(address: str) -> dict:
    base_url = "https://maps.googleapis.com/maps/api/geocode/json?"
    params = {
        "address": address,
        "key": settings.GOOGLEMAPS_GEOCODING_KEY
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(base_url, params=params)
        data = resp.json()

        status = data.get("status")

        if status == "OK":
            # Get latitude and longitude values
            lat = data["results"][0]["geometry"]["location"]["lat"]
            lat_string = _format_coordinate(lat, "N", "S")
            lon = data["results"][0]["geometry"]["location"]["lng"]
            lon_string = _format_coordinate(lon, "E", "W")

            # Build location_text with form: city, state, country
            for component in data["results"][0]["address_components"]:
                if "locality" in component["types"]:
                    city = component["short_name"]
                elif "administrative_area_level_1" in component["types"]:
                    state = component["short_name"]
                elif "country" in component["types"]:
                    country = component["short_name"]
            try:
                location_text = f"{city}, {state}, {country}"
            except UnboundLocalError as err:
                location_text = f"{lat_string}, {lon_string}"

            return {"location_text": location_text, "lat": lat, "lat_string": lat_string, "lon_string": lon_string,
                    "lon": lon}
        elif status == "ZERO_RESULTS":
            logger.warning(f"Geocoding Error: ZERO_RESULTS for '{address}'")
            raise HTTPException(status_code=404, detail={"error_type": "geocoding", "message": "No results for that location"})
        else:
            logger.error(f"Geocoding API error for location '{address}': status={status}, response={data}")
            raise HTTPException(status_code=500, detail={"error_type": "geocoding", "message": "Internal server error"})
