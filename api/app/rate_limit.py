import time
from collections import defaultdict, deque

_attempts: dict[str, deque[float]] = defaultdict(deque)


# sliding window log
def check_rate_limit(
    key: str, *, max_attempts: int = 5, window: int = 60 * 5
) -> int | None:
    """Returns None if allowed, or seconds until retry if rate-limited"""
    now = time.monotonic()
    dq = _attempts[key]
    while dq and now - dq[0] > window:
        dq.popleft()
    if len(dq) >= max_attempts:
        return int(window - (now - dq[0]))
    return None


def record_failure(key: str) -> None:
    _attempts[key].append(time.monotonic())
