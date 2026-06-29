from psycopg_pool import AsyncConnectionPool

from app.config import settings

pool = AsyncConnectionPool(settings.database_url, open=False)
