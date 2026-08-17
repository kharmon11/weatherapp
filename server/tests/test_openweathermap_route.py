from unittest.mock import AsyncMock

from fastapi import HTTPException

import app.api.openweathermap as route_module


def test_happy_path_assembles_response_shape(client, monkeypatch):
    geocode_mock = AsyncMock(
        return_value={
            "location_text": "New York, NY, US",
            "lat": 40.7128,
            "lon": -74.0060,
            "lat_string": "40.71 °N",
            "lon_string": "-74.01 °E",
        }
    )
    weather_mock = AsyncMock(return_value={"current": {"temp": 72}})
    monkeypatch.setattr(route_module, "geocode", geocode_mock)
    monkeypatch.setattr(route_module, "get_openweathermap_data", weather_mock)

    response = client.get("/api/openweathermap", params={"location": "New York, NY"})

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "data": {"current": {"temp": 72}},
        "location_text": "New York, NY, US",
        "lat_string": "40.71 °N",
        "lon_string": "-74.01 °E",
    }
    geocode_mock.assert_awaited_once_with("New York, NY")
    weather_mock.assert_awaited_once_with(40.7128, -74.0060)


def test_geocode_string_input_passed_through_unchanged(client, monkeypatch):
    # is_coordinates() is defined but never invoked by the route - geocode()
    # always receives the raw location string, coordinate-shaped or not.
    geocode_mock = AsyncMock(
        return_value={
            "location_text": "40.71 °N, -74.01 °E",
            "lat": 40.7128,
            "lon": -74.0060,
            "lat_string": "40.71 °N",
            "lon_string": "-74.01 °E",
        }
    )
    weather_mock = AsyncMock(return_value={"current": {"temp": 72}})
    monkeypatch.setattr(route_module, "geocode", geocode_mock)
    monkeypatch.setattr(route_module, "get_openweathermap_data", weather_mock)

    response = client.get(
        "/api/openweathermap", params={"location": "40.7128,-74.0060"}
    )

    assert response.status_code == 200
    geocode_mock.assert_awaited_once_with("40.7128,-74.0060")


def test_geocode_error_propagates(client, monkeypatch):
    geocode_mock = AsyncMock(
        side_effect=HTTPException(
            status_code=404,
            detail={"error_type": "geocoding", "message": "No results for that location"},
        )
    )
    monkeypatch.setattr(route_module, "geocode", geocode_mock)

    response = client.get("/api/openweathermap", params={"location": "nowhere"})

    assert response.status_code == 404
    assert response.json()["detail"]["error_type"] == "geocoding"


def test_weather_error_propagates(client, monkeypatch):
    geocode_mock = AsyncMock(
        return_value={
            "location_text": "New York, NY, US",
            "lat": 40.7128,
            "lon": -74.0060,
            "lat_string": "40.71 °N",
            "lon_string": "-74.01 °E",
        }
    )
    weather_mock = AsyncMock(
        side_effect=HTTPException(
            status_code=504, detail="Timeout fetching weather data from OpenWeatherMap"
        )
    )
    monkeypatch.setattr(route_module, "geocode", geocode_mock)
    monkeypatch.setattr(route_module, "get_openweathermap_data", weather_mock)

    response = client.get("/api/openweathermap", params={"location": "New York, NY"})

    assert response.status_code == 504
