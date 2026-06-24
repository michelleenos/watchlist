from fastapi import FastAPI

from app.routes import movies

app = FastAPI()

app.include_router(movies.router, prefix="/movies", tags=["movies"])


@app.get("/")
async def root():
    return {"message": "hello world"}
