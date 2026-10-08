from app.core.cache import TTLCache


class FakeClock:
  def __init__(self):
    self.now = 1000.0

  def __call__(self):
    return self.now


def test_get_returns_stored_value_and_default_on_miss():
  cache = TTLCache(maxsize=2, ttl=60)
  cache.set("a", 1)
  assert cache.get("a") == 1
  assert cache.get("missing") is None
  assert cache.get("missing", "fallback") == "fallback"


def test_entries_expire_after_ttl():
  clock = FakeClock()
  cache = TTLCache(maxsize=2, ttl=60, clock=clock)
  cache.set("a", 1)
  clock.now += 59
  assert cache.get("a") == 1
  clock.now += 1
  assert cache.get("a") is None
  assert len(cache) == 0  # expired entry is dropped, not just hidden


def test_set_refreshes_expiry():
  clock = FakeClock()
  cache = TTLCache(maxsize=2, ttl=60, clock=clock)
  cache.set("a", 1)
  clock.now += 50
  cache.set("a", 2)
  clock.now += 50
  assert cache.get("a") == 2


def test_least_recently_used_entry_is_evicted_when_full():
  cache = TTLCache(maxsize=2, ttl=60)
  cache.set("a", 1)
  cache.set("b", 2)
  cache.get("a")  # "a" is now more recently used than "b"
  cache.set("c", 3)
  assert cache.get("b") is None
  assert cache.get("a") == 1
  assert cache.get("c") == 3
  assert len(cache) == 2


def test_get_does_not_extend_ttl():
  clock = FakeClock()
  cache = TTLCache(maxsize=2, ttl=60, clock=clock)
  cache.set("a", 1)
  clock.now += 30
  cache.get("a")
  clock.now += 30
  assert cache.get("a") is None


def test_clear_empties_the_cache():
  cache = TTLCache(maxsize=2, ttl=60)
  cache.set("a", 1)
  cache.clear()
  assert len(cache) == 0
