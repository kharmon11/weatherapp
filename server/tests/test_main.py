import importlib
import os

import pytest
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


def test_production_mode_parses_allowed_origins(monkeypatch, reload_main):
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


def test_production_mounts_static_files(monkeypatch, reload_main):
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://weather.kenharmon.net")

    dist_dir = os.path.join(os.path.dirname(main_module.__file__), "dist")
    created_dist = not os.path.isdir(dist_dir)
    created_index = False
    if created_dist:
        os.makedirs(dist_dir)
    index_path = os.path.join(dist_dir, "index.html")
    if not os.path.isfile(index_path):
        created_index = True
        with open(index_path, "w") as f:
            f.write("<html></html>")

    try:
        mod = reload_main()
        route_paths = [r.path for r in mod.app.routes if not isinstance(r, Mount)]
        assert "/" in route_paths
        static_mounts = [r for r in mod.app.routes if isinstance(r, Mount) and r.name == "static"]
        assert len(static_mounts) == 1
    finally:
        if created_index:
            os.remove(index_path)
        if created_dist:
            os.rmdir(dist_dir)
