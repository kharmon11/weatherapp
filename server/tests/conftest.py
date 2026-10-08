import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services import geocode as geocode_module
from app.services import openweathermap as owm_module


@pytest.fixture(autouse=True)
def clear_caches():
    # Module-level caches would otherwise leak results between tests.
    geocode_module._cache.clear()
    for cache in owm_module._caches.values():
        cache.clear()
    yield


@pytest.fixture(autouse=True)
def dummy_api_keys(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLEMAPS_GEOCODING_KEY", "test-google-key")
    monkeypatch.setattr(settings, "OPEN_WEATHERMAP_API_KEY", "test-owm-key")


@pytest.fixture
def client():
    return TestClient(app)
