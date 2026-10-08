import time
from collections import OrderedDict


class TTLCache:
  """Small in-memory cache with per-entry expiry and least-recently-used eviction.

  Per-process only (each gunicorn worker has its own copy, and it starts empty
  on a cold start). Not thread-safe, which is fine: it is only used from
  asyncio code, where get/set never yield between steps.

  Stored values are shared with every caller that gets them, so callers must
  treat them as read-only.
  """

  def __init__(self, maxsize: int, ttl: float, clock=time.monotonic):
    self._maxsize = maxsize
    self._ttl = ttl
    self._clock = clock
    self._items: OrderedDict = OrderedDict()  # key -> (expires_at, value)

  def get(self, key, default=None):
    entry = self._items.get(key)
    if entry is None:
      return default
    expires_at, value = entry
    if self._clock() >= expires_at:
      del self._items[key]
      return default
    self._items.move_to_end(key)  # mark as recently used
    return value

  def set(self, key, value) -> None:
    self._items[key] = (self._clock() + self._ttl, value)
    self._items.move_to_end(key)
    while len(self._items) > self._maxsize:
      self._items.popitem(last=False)  # evict least recently used

  def clear(self) -> None:
    self._items.clear()

  def __len__(self) -> int:
    return len(self._items)
