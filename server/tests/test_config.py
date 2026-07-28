import importlib

# Settings.GOOGLEMAPS_GEOCODING_KEY / OPEN_WEATHERMAP_API_KEY are populated via
# an eager `os.getenv(...)` default evaluated at import time, using the
# GOOGLE_MAPS_GEOCODING_KEY / OPENWEATHERMAP_API_KEY env var names (not
# pydantic-settings' own auto env-binding, which would look for env vars
# matching the field names literally). This pins that behavior.


def test_settings_load_from_env(monkeypatch):
    monkeypatch.setenv("GOOGLE_MAPS_GEOCODING_KEY", "gmaps-secret")
    monkeypatch.setenv("OPENWEATHERMAP_API_KEY", "owm-secret")

    from app.core import config as config_module

    importlib.reload(config_module)

    assert config_module.settings.GOOGLEMAPS_GEOCODING_KEY == "gmaps-secret"
    assert config_module.settings.OPEN_WEATHERMAP_API_KEY == "owm-secret"

    importlib.reload(config_module)
