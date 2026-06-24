from fastapi import FastAPI

from app.routes import decades, genres, languages, movies

app = FastAPI()

app.include_router(movies.router, prefix="/movies", tags=["movies"])
app.include_router(genres.router, prefix="/genres", tags=["genres"])
app.include_router(decades.router, prefix="/decades", tags=["decades"])
app.include_router(languages.router, prefix="/languages", tags=["languages"])


@app.get("/health")
async def health():
    return {"ok": True}
