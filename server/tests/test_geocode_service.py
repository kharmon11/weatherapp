import httpx
import pytest
import respx
from fastapi import HTTPException

from app.services.geocode import geocode

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


def _ok_response(address_components):
    return {
        "status": "OK",
        "results": [
            {
                "geometry": {"location": {"lat": 40.7128, "lng": -74.0060}},
                "address_components": address_components,
            }
        ],
    }


FULL_COMPONENTS = [
    {"types": ["locality"], "short_name": "New York"},
    {"types": ["administrative_area_level_1"], "short_name": "NY"},
    {"types": ["country"], "short_name": "US"},
]


@respx.mock
async def test_geocode_happy_path():
    route = respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json=_ok_response(FULL_COMPONENTS))
    )

    result = await geocode("New York, NY")

    assert route.called
    sent_params = route.calls.last.request.url.params
    assert sent_params["address"] == "New York, NY"
    assert sent_params["key"] == "test-google-key"

    assert result["lat"] == 40.7128
    assert result["lon"] == -74.0060
    assert result["location_text"] == "New York, NY, US"


@respx.mock
async def test_geocode_falls_back_to_lat_lon_when_components_missing():
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json=_ok_response([]))
    )

    result = await geocode("somewhere obscure")

    assert result["location_text"] == f"{result['lat_string']}, {result['lon_string']}"


@respx.mock
async def test_geocode_zero_results_raises_404():
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json={"status": "ZERO_RESULTS", "results": []})
    )

    with pytest.raises(HTTPException) as exc_info:
        await geocode("nonexistent place")

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail["error_type"] == "geocoding"


@respx.mock
async def test_geocode_other_error_status_raises_500():
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(
            200, json={"status": "REQUEST_DENIED", "results": []}
        )
    )

    with pytest.raises(HTTPException) as exc_info:
        await geocode("New York, NY")

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail["error_type"] == "geocoding"
