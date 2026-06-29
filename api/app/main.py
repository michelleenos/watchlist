from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import pool
from app.exceptions import TMDBError
from app.routes import decades, genres, languages, movies, tmdb


@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    await pool.wait()  # optional: block until first connections are ready
    yield
    await pool.close()


# in repositories:
# async with pool.connection() as conn:

app = FastAPI(lifespan=lifespan)


@app.exception_handler(TMDBError)
async def tmdb_error_handler(request: Request, exc: TMDBError):
    status = 404 if exc.status_code == 404 else 502
    return JSONResponse(status_code=status, content={"detail": str(exc)})


app.include_router(movies.router, prefix="/movies", tags=["movies"])
app.include_router(genres.router, prefix="/genres", tags=["genres"])
app.include_router(decades.router, prefix="/decades", tags=["decades"])
app.include_router(languages.router, prefix="/languages", tags=["languages"])
app.include_router(tmdb.router, prefix="/tmdb", tags=["tmdb"])


@app.get("/health")
async def health():
    return {"ok": True}


app.mount("/images", StaticFiles(directory=settings.images_dir))
