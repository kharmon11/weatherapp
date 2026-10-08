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


def _mock_all_ok():
    return (
        respx.get(CURRENT_URL).mock(return_value=httpx.Response(200, json=CURRENT_PAYLOAD)),
        respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD)),
        respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD)),
    )


@respx.mock
async def test_repeat_lookup_is_served_from_cache():
    routes = _mock_all_ok()

    first = await get_openweathermap_data(40.7128, -74.0060)
    second = await get_openweathermap_data(40.7128, -74.0060)

    assert [r.call_count for r in routes] == [1, 1, 1]
    assert second == first


@respx.mock
async def test_cache_key_is_a_110m_cell_nearby_points_share_but_farther_points_do_not():
    routes = _mock_all_ok()

    await get_openweathermap_data(40.7128, -74.0060)
    await get_openweathermap_data(40.7131, -74.0058)  # ~35 m away: same 3-decimal cell
    assert [r.call_count for r in routes] == [1, 1, 1]

    await get_openweathermap_data(40.7149, -74.0060)  # ~230 m away: next cell (but the same 2-decimal cell)
    assert [r.call_count for r in routes] == [2, 2, 2]

    await get_openweathermap_data(40.7200, -74.0060)  # ~800 m away
    assert [r.call_count for r in routes] == [3, 3, 3]


@respx.mock
async def test_each_endpoint_expires_on_its_own_ttl(monkeypatch):
    clock = {"now": 1000.0}
    for cache in owm_module._caches.values():
        monkeypatch.setattr(cache, "_clock", lambda: clock["now"])
    current_route, minutely_route, daily_route = _mock_all_ok()

    await get_openweathermap_data(40.7128, -74.0060)

    clock["now"] += 3 * 60  # past minutely (2 min), within current (5) and daily (10)
    await get_openweathermap_data(40.7128, -74.0060)
    assert (current_route.call_count, minutely_route.call_count, daily_route.call_count) == (1, 2, 1)

    clock["now"] += 3 * 60  # 6 min total: current has now expired too
    await get_openweathermap_data(40.7128, -74.0060)
    assert (current_route.call_count, minutely_route.call_count, daily_route.call_count) == (2, 3, 1)

    clock["now"] += 5 * 60  # 11 min total: daily expired
    await get_openweathermap_data(40.7128, -74.0060)
    assert daily_route.call_count == 2


@respx.mock
async def test_failed_lookup_is_not_cached():
    respx.get(CURRENT_URL).mock(
        side_effect=[httpx.Response(500), httpx.Response(200, json=CURRENT_PAYLOAD)]
    )
    respx.get(MINUTELY_URL).mock(return_value=httpx.Response(200, json=MINUTELY_PAYLOAD))
    respx.get(DAILY_URL).mock(return_value=httpx.Response(200, json=DAILY_PAYLOAD))

    with pytest.raises(HTTPException):
        await get_openweathermap_data(40.7128, -74.0060)

    result = await get_openweathermap_data(40.7128, -74.0060)  # retried upstream, now succeeds
    assert result["current"] == CURRENT_PAYLOAD["data"][0]
