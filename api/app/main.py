from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import pool
from app.exceptions import DuplicateMovieError, TMDBError
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


@app.exception_handler(DuplicateMovieError)
async def duplicate_movie_handler(request: Request, exc: DuplicateMovieError):
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(psycopg.OperationalError)
async def db_error_handler(request: Request, exc: psycopg.OperationalError):
    return JSONResponse(status_code=503, content={"detail": "Database unavailable"})


@app.exception_handler(Exception)
async def catchall_exception_handler(request: Request, exc: Exception):
    # if we have logging we can log str(exc) here
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred", "path": request.url.path},
    )


app.include_router(movies.router, prefix="/movies", tags=["movies"])
app.include_router(genres.router, prefix="/genres", tags=["genres"])
app.include_router(decades.router, prefix="/decades", tags=["decades"])
app.include_router(languages.router, prefix="/languages", tags=["languages"])
app.include_router(tmdb.router, prefix="/tmdb", tags=["tmdb"])


@app.get("/health")
async def health():
    return {"ok": True}


app.mount("/images", StaticFiles(directory=settings.images_dir))
