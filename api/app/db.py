from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from psycopg import AsyncCursor
from psycopg.rows import AsyncRowFactory, tuple_row
from psycopg_pool import AsyncConnectionPool

from app.config import settings

pool = AsyncConnectionPool(settings.database_url, open=False)


@asynccontextmanager
async def cursor(
    *, row_factory: AsyncRowFactory[Any] = tuple_row
) -> AsyncIterator[AsyncCursor[Any]]:
    """Check out a connection from the pool and yield a cursor on it.

    One `async with cursor()` block is one transaction (commit/rollback is
    handled by `pool.connection()` on exit), so multi-statement writes should
    stay inside a single block. `row_factory` defaults to plain tuples; pass
    `dict_row` for the movie reads that build models from named columns.
    """
    async with pool.connection() as conn, conn.cursor(row_factory=row_factory) as cur:
        yield cur
