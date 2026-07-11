from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.auth import authenticate_user, get_authenticated_user
from app.models import Authenticated, Unauthenticated, User

router = APIRouter()


class LoginUserBody(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login_user(creds: LoginUserBody, request: Request) -> Authenticated:
    user = authenticate_user(creds.username, creds.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    request.session["username"] = user.username
    return Authenticated(authenticated=True, user=user)


@router.post("/logout")
async def logout_user(request: Request) -> Unauthenticated:
    request.session.clear()
    return Unauthenticated(authenticated=False)


@router.get("/me")
async def get_user_me(current_user: Annotated[User, Depends(get_authenticated_user)]):
    return current_user


#     username = request.session.get("username")
#     user = get_user(username)
#     # return AuthStatus(user=)
