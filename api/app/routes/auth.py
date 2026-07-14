from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.auth import authenticate_user, get_user
from app.models import Authenticated, AuthStatus, Unauthenticated, User
from app.rate_limit import check_rate_limit, record_failure

router = APIRouter()


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-real-ip")
    if forwarded:
        return forwarded
    return request.client.host if request.client else "unknown"


class LoginUserBody(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login_user(creds: LoginUserBody, request: Request) -> Authenticated:
    client_ip = get_client_ip(request)
    retry = check_rate_limit(client_ip)
    if retry is not None:
        raise HTTPException(
            429, "Too many attempts", headers={"Retry-After": str(retry)}
        )
    user = authenticate_user(creds.username, creds.password)
    if not user:
        record_failure(client_ip)
        raise HTTPException(status_code=401, detail="Invalid username or password")
    request.session["username"] = user.username
    return Authenticated(authenticated=True, user=user)


@router.post("/logout")
async def logout_user(request: Request) -> Unauthenticated:
    request.session.clear()
    return Unauthenticated(authenticated=False)


@router.get("/me")
async def get_user_me(request: Request) -> AuthStatus:
    username = request.session.get("username")
    user = get_user(username) if username else None
    if user is None:
        return Unauthenticated(authenticated=False)
    return Authenticated(
        authenticated=True, user=User.model_validate(user.model_dump())
    )
