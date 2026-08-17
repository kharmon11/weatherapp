import httpx
import pytest
import respx
from fastapi import HTTPException

from app.services import openweathermap as owm_module
from app.services.openweathermap import get_openweathermap_data

OWM_URL = "https://api.openweathermap.org/data/3.0/onecall"


@pytest.fixture(autouse=True)
def no_sleep(monkeypatch):
    async def fast_sleep(_seconds):
        return None

    monkeypatch.setattr(owm_module.asyncio, "sleep", fast_sleep)


@respx.mock
async def test_get_openweathermap_data_happy_path():
    route = respx.get(OWM_URL).mock(
        return_value=httpx.Response(200, json={"current": {"temp": 72}})
    )

    result = await get_openweathermap_data(40.7128, -74.0060)

    assert route.called
    sent_params = route.calls.last.request.url.params
    assert sent_params["lat"] == "40.7128"
    assert sent_params["lon"] == "-74.006"
    assert sent_params["units"] == "imperial"
    assert sent_params["appid"] == "test-owm-key"
    assert result == {"current": {"temp": 72}}


@respx.mock
async def test_get_openweathermap_data_retries_then_succeeds():
    route = respx.get(OWM_URL).mock(
        side_effect=[
            httpx.ReadTimeout("timed out"),
            httpx.Response(200, json={"current": {"temp": 72}}),
        ]
    )

    result = await get_openweathermap_data(40.7128, -74.0060, retries=3)

    assert route.call_count == 2
    assert result == {"current": {"temp": 72}}


@respx.mock
async def test_get_openweathermap_data_exhausts_retries_raises_504():
    respx.get(OWM_URL).mock(side_effect=httpx.ReadTimeout("timed out"))

    with pytest.raises(HTTPException) as exc_info:
        await get_openweathermap_data(40.7128, -74.0060, retries=2)

    assert exc_info.value.status_code == 504


@respx.mock
async def test_get_openweathermap_data_http_status_error_raises_502():
    respx.get(OWM_URL).mock(return_value=httpx.Response(500, json={"error": "boom"}))

    with pytest.raises(HTTPException) as exc_info:
        await get_openweathermap_data(40.7128, -74.0060, retries=1)

    assert exc_info.value.status_code == 502


@respx.mock
async def test_get_openweathermap_data_request_error_raises_502():
    respx.get(OWM_URL).mock(side_effect=httpx.ConnectError("connection failed"))

    with pytest.raises(HTTPException) as exc_info:
        await get_openweathermap_data(40.7128, -74.0060, retries=1)

    assert exc_info.value.status_code == 502
