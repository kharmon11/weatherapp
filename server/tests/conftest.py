import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture(autouse=True)
def dummy_api_keys(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLEMAPS_GEOCODING_KEY", "test-google-key")
    monkeypatch.setattr(settings, "OPEN_WEATHERMAP_API_KEY", "test-owm-key")


@pytest.fixture
def client():
    return TestClient(app)
