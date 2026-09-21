from fastapi import APIRouter
from ..services.geocode import geocode
from ..services.openweathermap import get_openweathermap_data

router = APIRouter()


@router.get("/openweathermap")
async def openweathermap(location: str):
  geocode_data = await geocode(location)
  weather_data = await get_openweathermap_data(geocode_data["lat"], geocode_data["lon"])
  return {"data": weather_data, "location_text": geocode_data["location_text"],
          "lat_string": geocode_data["lat_string"], "lon_string": geocode_data["lon_string"]}
