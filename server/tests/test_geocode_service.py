import logging

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

PARTIAL_COMPONENTS_MISSING_COUNTRY = [
    {"types": ["locality"], "short_name": "New York"},
    {"types": ["administrative_area_level_1"], "short_name": "NY"},
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
async def test_geocode_falls_back_to_lat_lon_when_any_single_component_is_missing():
    # location_text is built as f"{city}, {state}, {country}" - missing ANY ONE
    # of the three raises UnboundLocalError for the whole f-string, discarding
    # whatever components WERE found rather than showing partial info. Pinning
    # this as current, intentionally-unchanged behavior (not fixing it): city
    # and state were found here but the result still falls all the way back to
    # raw coordinates instead of showing "New York, NY".
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json=_ok_response(PARTIAL_COMPONENTS_MISSING_COUNTRY))
    )

    result = await geocode("New York, NY")

    assert result["location_text"] == f"{result['lat_string']}, {result['lon_string']}"
    assert "New York" not in result["location_text"]


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


@pytest.mark.parametrize(
    "lat, lng, expected_lat, expected_lon",
    [
        (42.3601, -71.0589, "42.36 °N", "71.06 °W"),  # Boston: N / W
        (-33.8688, 151.2093, "33.87 °S", "151.21 °E"),  # Sydney: S / E
        (-34.6037, -58.3816, "34.6 °S", "58.38 °W"),  # Buenos Aires: S / W
        (51.5074, -0.1278, "51.51 °N", "0.13 °W"),  # London: N / W
        (0.0, 0.0, "0.0 °N", "0.0 °E"),  # origin
    ],
)
@respx.mock
async def test_geocode_coordinate_strings_use_each_axis_own_hemisphere(
    lat, lng, expected_lat, expected_lon
):
    body = _ok_response(FULL_COMPONENTS)
    body["results"][0]["geometry"]["location"] = {"lat": lat, "lng": lng}
    respx.get(GEOCODE_URL).mock(return_value=httpx.Response(200, json=body))

    result = await geocode("anywhere")

    assert result["lat_string"] == expected_lat
    assert result["lon_string"] == expected_lon


@respx.mock
async def test_geocode_repeat_address_is_served_from_cache():
    route = respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json=_ok_response(FULL_COMPONENTS))
    )

    first = await geocode("New York, NY")
    second = await geocode("  new   YORK, ny ")  # same address, different spacing/case

    assert route.call_count == 1
    assert second == first


@respx.mock
async def test_geocode_different_addresses_are_cached_separately():
    route = respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json=_ok_response(FULL_COMPONENTS))
    )

    await geocode("New York, NY")
    await geocode("Boston, MA")

    assert route.call_count == 2


@respx.mock
async def test_geocode_coordinate_pairs_bypass_the_cache():
    route = respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(200, json=_ok_response(FULL_COMPONENTS))
    )

    await geocode("42.360123,-71.058912")
    await geocode("42.360123,-71.058912")
    await geocode(" -33.8688 , 151.2093 ")

    assert route.call_count == 3


@respx.mock
async def test_geocode_errors_are_not_cached():
    route = respx.get(GEOCODE_URL).mock(
        side_effect=[
            httpx.Response(200, json={"status": "ZERO_RESULTS"}),
            httpx.Response(200, json=_ok_response(FULL_COMPONENTS)),
        ]
    )

    with pytest.raises(HTTPException):
        await geocode("Nowhereville")
    result = await geocode("Nowhereville")  # second attempt must hit upstream again

    assert route.call_count == 2
    assert result["location_text"] == "New York, NY, US"


@pytest.mark.parametrize("failure", [httpx.ConnectError("boom"), httpx.ReadTimeout("slow")])
@respx.mock
async def test_geocode_network_failure_returns_502_with_error_shape(failure):
    respx.get(GEOCODE_URL).mock(side_effect=failure)

    with pytest.raises(HTTPException) as exc_info:
        await geocode("New York, NY")

    assert exc_info.value.status_code == 502
    assert exc_info.value.detail["error_type"] == "geocoding"
    assert "message" in exc_info.value.detail


@respx.mock
async def test_geocode_non_json_response_returns_502_with_error_shape():
    respx.get(GEOCODE_URL).mock(return_value=httpx.Response(502, text="<html>Bad Gateway</html>"))

    with pytest.raises(HTTPException) as exc_info:
        await geocode("New York, NY")

    assert exc_info.value.status_code == 502
    assert exc_info.value.detail["error_type"] == "geocoding"


@respx.mock
async def test_geocode_api_error_log_omits_full_response_body(caplog):
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(
            200,
            json={"status": "REQUEST_DENIED", "error_message": "The provided API key is invalid.",
                  "results": [{"huge": "payload"}]},
        )
    )

    with pytest.raises(HTTPException):
        await geocode("New York, NY")

    assert "REQUEST_DENIED" in caplog.text
    assert "The provided API key is invalid." in caplog.text
    assert "huge" not in caplog.text


@respx.mock
async def test_httpx_request_urls_with_api_keys_are_not_logged(caplog):
    # httpx logs "HTTP Request: GET <full url>" at INFO, and the url carries the key.
    caplog.set_level(logging.INFO)
    respx.get(GEOCODE_URL).mock(return_value=httpx.Response(200, json=_ok_response(FULL_COMPONENTS)))

    await geocode("New York, NY")

    assert "test-google-key" not in caplog.text
    assert "HTTP Request" not in caplog.text
