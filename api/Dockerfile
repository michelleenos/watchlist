# syntax=docker/dockerfile:1
FROM python:3.13-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

ENV UV_LINK_MODE=copy

# install project dependencies using lockfile & settings 
# this lets us cache this stuff so it doesnt have to be reinstalled on any change to app code
# RUN --mount=type=cache,id=uv,target=/root/.cache/uv \
# 	--mount=type=bind,source=uv.lock,target=uv.lock \
#     --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
#     uv sync --locked --no-install-project

# install deps first (cached layer) so changes to app code don't reinstall them
COPY uv.lock pyproject.toml ./
RUN uv sync --locked --no-install-project

# then, add the rest of the project and install it
COPY . /app 
RUN uv sync --locked
# RUN --mount=type=cache,id=uv,target=/root/.cache/uv \
#     uv sync --locked

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"	


# CMD ["fastapi", "run", "app/main.py", "--port", "80"]
CMD fastapi run app/main.py --port ${PORT:-80}