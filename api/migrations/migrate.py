from pathlib import Path

import psycopg

from app.config import settings

migration_paths = sorted(Path("migrations").glob("*.sql"))


def main():
    with psycopg.connect(settings.database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations(
                    id	 		TEXT PRIMARY KEY,
                    applied_at 	TIMESTAMPTZ NOT NULL DEFAULT now()
                );
                """
            )

            for path in migration_paths:
                migration_id = path.stem
                cur.execute(
                    "SELECT 1 from schema_migrations WHERE id = %s", (migration_id,)
                )
                if cur.fetchone() is None:
                    sql = path.read_text()
                    cur.execute(sql)  # pyright: ignore[reportArgumentType, reportCallIssue]
                    cur.execute(
                        "INSERT INTO schema_migrations (id) VALUES (%s)",
                        (migration_id,),
                    )
                    print(f"applied {migration_id}")


if __name__ == "__main__":
    main()
