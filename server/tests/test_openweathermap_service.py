import httpx
import pytest
import respx
from fastapi import HTTPException

from app.services import openweathermap as owm_module
from app.services.openweathermap import get_openweathermap_data

CURRENT_URL = "https://api.openweathermap.org/data/4.0/onecall/current"
MINUTELY_URL = "https://api.openweathermap.org/data/4.0/onecall/timeline/1min"
DAILY_URL = "https://api.openweathermap.org/data/4.0/onecall/timeline/1day"

CURRENT_PAYLOAD = {
    "lat": 40.7128,
    "lon": -74.006,
    "timezone": "America/New_York",
    "timezone_offset": -14400,
    "data": [{"dt": 1700000000, "temp": 72.5, "humidity": 50}],
}

MINUTELY_PAYLOAD = {
    "lat": 40.7128,
    "lon": -74.006,
    "timezone": "America/New_York",
    "timezone_offset": -14400,
    "data": [{"dt": 1700000000, "precipitation": 0}, {"dt": 1700000060, "precipitation": 0.1}],
}

DAILY_PAYLOAD = {
    "lat": 40.7128,
    "lon": -74.006,
    "timezone": "America/New_York",
    "timezone_offset": -14400,
    "data": [{"dt": 1700000000, "temp": {"min": 60, "max": 80}, "wind_speed": 5}],
}


@pytest.fixture(autouse=True)
def no_sleep(monkeypatch):
    async def fast_sleep(_seconds):
        return None

    monkeypatch.setattr(owm_module.asyncio, "sleep", fast_sleep)


@respx.mock
async def test_get_openweathermap_data_happy_path():
    current_route = respx.get(CURRENT_URL).mock(return_value=httpx.Response(200, json=CURRENT_PAYLOAD))
    respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD))
    respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD))

    result = await get_openweathermap_data(40.7128, -74.0060)

    sent_params = current_route.calls.last.request.url.params
    assert sent_params["lat"] == "40.7128"
    assert sent_params["lon"] == "-74.006"
    assert sent_params["units"] == "imperial"
    assert sent_params["appid"] == "test-owm-key"

    assert result == {
        "lat": 40.7128,
        "lon": -74.006,
        "timezone": "America/New_York",
        "timezone_offset": -14400,
        "current": CURRENT_PAYLOAD["data"][0],
        "daily": DAILY_PAYLOAD["data"],
        "minutely": MINUTELY_PAYLOAD["data"],
    }


@respx.mock
async def test_get_openweathermap_data_retries_then_succeeds():
    current_route = respx.get(CURRENT_URL).mock(
        side_effect=[
            httpx.ReadTimeout("timed out"),
            httpx.Response(200, json=CURRENT_PAYLOAD),
        ]
    )
    respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD))
    respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD))

    result = await get_openweathermap_data(40.7128, -74.0060, retries=3)

    assert current_route.call_count == 2
    assert result["current"] == CURRENT_PAYLOAD["data"][0]


@respx.mock
async def test_get_openweathermap_data_exhausts_retries_raises_504():
    respx.get(CURRENT_URL).mock(side_effect=httpx.ReadTimeout("timed out"))
    respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD))
    respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD))

    with pytest.raises(HTTPException) as exc_info:
        await get_openweathermap_data(40.7128, -74.0060, retries=2)

    assert exc_info.value.status_code == 504


@respx.mock
async def test_get_openweathermap_data_http_status_error_raises_502():
    respx.get(CURRENT_URL).mock(return_value=httpx.Response(500, json={"error": "boom"}))
    respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD))
    respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD))

    with pytest.raises(HTTPException) as exc_info:
        await get_openweathermap_data(40.7128, -74.0060, retries=1)

    assert exc_info.value.status_code == 502


@respx.mock
async def test_get_openweathermap_data_request_error_raises_502():
    respx.get(CURRENT_URL).mock(side_effect=httpx.ConnectError("connection failed"))
    respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD))
    respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD))

    with pytest.raises(HTTPException) as exc_info:
        await get_openweathermap_data(40.7128, -74.0060, retries=1)

    assert exc_info.value.status_code == 502
