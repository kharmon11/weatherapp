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


def _preflight(client, origin):
    return client.options(
        "/api/openweathermap",
        headers={"Origin": origin, "Access-Control-Request-Method": "GET"},
    )


def test_production_still_allows_exact_listed_origins(monkeypatch, reload_main, dist_dir):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")
    mod = reload_main()
    client = TestClient(mod.app)

    resp = _preflight(client, "https://weather.kenharmon.net")
    assert resp.headers.get("access-control-allow-origin") == "https://weather.kenharmon.net"


@pytest.fixture
def prod_client(monkeypatch, reload_main, dist_dir):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")
    mod = reload_main()
    assets_dir = os.path.join(dist_dir, "assets")
    asset_path = os.path.join(assets_dir, "index-test123.js")
    created_assets_dir = not os.path.isdir(assets_dir)
    os.makedirs(assets_dir, exist_ok=True)
    body = "console.log('hello');\n" * 500
    with open(asset_path, "w") as f:
        f.write(body)

    yield TestClient(mod.app), body

    os.remove(asset_path)
    if created_assets_dir:
        os.rmdir(assets_dir)


def test_large_response_is_gzipped_when_client_accepts_it(prod_client):
    client, body = prod_client
    resp = client.get("/assets/index-test123.js", headers={"Accept-Encoding": "gzip"})
    assert resp.status_code == 200
    assert resp.headers["content-encoding"] == "gzip"
    assert int(resp.headers["content-length"]) < len(body)
    assert resp.text == body  # client transparently decompresses


def test_response_is_not_gzipped_without_accept_encoding(prod_client):
    client, body = prod_client
    resp = client.get("/assets/index-test123.js", headers={"Accept-Encoding": "identity"})
    assert "content-encoding" not in resp.headers
    assert resp.text == body


def test_hashed_assets_are_cached_immutably(prod_client):
    client, _ = prod_client
    resp = client.get("/assets/index-test123.js")
    assert resp.headers["cache-control"] == "public, max-age=31536000, immutable"


def test_missing_asset_404_is_not_cached(prod_client):
    client, _ = prod_client
    resp = client.get("/assets/does-not-exist.js")
    assert resp.status_code == 404
    assert "immutable" not in resp.headers.get("cache-control", "")


def test_index_html_stays_no_store(prod_client):
    client, _ = prod_client
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.headers["cache-control"] == "no-cache, no-store, must-revalidate"


def test_non_asset_static_files_are_not_marked_immutable(prod_client, dist_dir):
    client, _ = prod_client
    favicon = os.path.join(dist_dir, "favicon-test.svg")
    with open(favicon, "w") as f:
        f.write("<svg/>")
    try:
        resp = client.get("/favicon-test.svg")
        assert resp.status_code == 200
        assert "immutable" not in resp.headers.get("cache-control", "")
    finally:
        os.remove(favicon)


def test_custom_404_page_for_a_missing_asset_is_not_cached_immutably(prod_client, dist_dir):
    # With html=True, a 404.html in the build is returned as a normal response
    # with status 404 (instead of Starlette raising), which is the case the
    # status check in HashedAssetStaticFiles exists for.
    client, _ = prod_client
    not_found_page = os.path.join(dist_dir, "404.html")
    with open(not_found_page, "w") as f:
        f.write("<html>missing</html>")
    try:
        resp = client.get("/assets/does-not-exist.js")
        assert resp.status_code == 404
        assert "missing" in resp.text
        assert "immutable" not in resp.headers.get("cache-control", "")
    finally:
        os.remove(not_found_page)
