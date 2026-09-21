import importlib
import os

import pytest
from fastapi.testclient import TestClient
from starlette.routing import Mount

import app.main as main_module

# main.py resolves ENV/origins/CORS/static-mount once at import time, so
# exercising both dev and production branches requires reloading the module
# after setting env vars, then reloading back to a clean state afterward.


@pytest.fixture
def reload_main(monkeypatch):
    def _reload():
        importlib.reload(main_module)
        return main_module

    yield _reload

    monkeypatch.delenv("ENV", raising=False)
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    importlib.reload(main_module)


def test_dev_mode_uses_localhost_origins(monkeypatch, reload_main):
    monkeypatch.delenv("ENV", raising=False)
    mod = reload_main()
    assert mod.origins == ["http://localhost:5173", "localhost:5173"]


def test_dev_mode_does_not_mount_static(monkeypatch, reload_main):
    monkeypatch.delenv("ENV", raising=False)
    mod = reload_main()
    static_mounts = [r for r in mod.app.routes if isinstance(r, Mount) and r.name == "static"]
    assert static_mounts == []


@pytest.fixture
def dist_dir():
    dist_path = os.path.join(os.path.dirname(main_module.__file__), "dist")
    created_dist = not os.path.isdir(dist_path)
    created_index = False
    if created_dist:
        os.makedirs(dist_path)
    index_path = os.path.join(dist_path, "index.html")
    if not os.path.isfile(index_path):
        created_index = True
        with open(index_path, "w") as f:
            f.write("<html></html>")

    yield dist_path

    if created_index:
        os.remove(index_path)
    if created_dist:
        os.rmdir(dist_path)


def test_production_mode_parses_allowed_origins(monkeypatch, reload_main, dist_dir):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv(
        "ALLOWED_ORIGINS", "https://weather.kenharmon.net,https://wx.kenharmon.net"
    )
    mod = reload_main()
    assert mod.origins == [
        "https://weather.kenharmon.net",
        "https://wx.kenharmon.net",
    ]


def test_production_mode_missing_allowed_origins_raises(monkeypatch):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)

    with pytest.raises(ValueError, match="ALLOWED_ORIGINS"):
        importlib.reload(main_module)

    monkeypatch.delenv("ENV", raising=False)
    importlib.reload(main_module)


def test_production_mounts_static_files(monkeypatch, reload_main, dist_dir):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")

    mod = reload_main()
    route_paths = [r.path for r in mod.app.routes if not isinstance(r, Mount)]
    assert "/" in route_paths
    static_mounts = [r for r in mod.app.routes if isinstance(r, Mount) and r.name == "static"]
    assert len(static_mounts) == 1


# Non-promoted candidate deploys (version id "sha-<7 hex chars>", per ci-cd.yml's
# `version=sha-${GITHUB_SHA:0:7}`) are only reachable at their own per-version
# appspot.com URL, which isn't in ALLOWED_ORIGINS. The frontend's API base URL is
# fixed at build time to the production domain regardless of which version it's
# served from, so the deployed candidate's own origin must be allowed via a
# separate regex or every deploy fails when the smoke test submits a real search.
def _preflight(client, origin):
    return client.options(
        "/api/openweathermap",
        headers={"Origin": origin, "Access-Control-Request-Method": "GET"},
    )


def test_production_allows_candidate_deploy_origin(monkeypatch, reload_main, dist_dir):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")
    mod = reload_main()
    client = TestClient(mod.app)

    candidate_origin = "https://sha-9b07f2a-dot-weatherapp-149500.uc.r.appspot.com"
    resp = _preflight(client, candidate_origin)
    assert resp.headers.get("access-control-allow-origin") == candidate_origin


@pytest.mark.parametrize(
    "disallowed_origin",
    [
        "https://sha-9b07f2a-dot-weatherapp-149500.uc.r.appspot.com.evil.com",  # suffix spoof
        "https://sha-9b07f2a-dot-someotherproject.uc.r.appspot.com",  # different GCP project
        "https://sha-notsevenhex-dot-weatherapp-149500.uc.r.appspot.com",  # malformed version id
    ],
)
def test_production_rejects_lookalike_candidate_origins(
    monkeypatch, reload_main, dist_dir, disallowed_origin
):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")
    mod = reload_main()
    client = TestClient(mod.app)

    resp = _preflight(client, disallowed_origin)
    assert resp.headers.get("access-control-allow-origin") is None


def test_production_still_allows_exact_listed_origins(monkeypatch, reload_main, dist_dir):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")
    mod = reload_main()
    client = TestClient(mod.app)

    resp = _preflight(client, "https://weather.kenharmon.net")
    assert resp.headers.get("access-control-allow-origin") == "https://weather.kenharmon.net"


def test_dev_mode_has_no_candidate_origin_regex(monkeypatch, reload_main):
    monkeypatch.delenv("ENV", raising=False)
    mod = reload_main()
    cors_middleware = next(
        m for m in mod.app.user_middleware if m.cls.__name__ == "CORSMiddleware"
    )
    assert cors_middleware.kwargs.get("allow_origin_regex") is None
