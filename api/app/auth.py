from fastapi import HTTPException, Request
from pwdlib import PasswordHash

from app.config import settings
from app.models import User, UserWithHashedPw

password_hash = PasswordHash.recommended()

DUMMY_HASH = password_hash.hash("dummypassword")


def parse_auth_users(raw: str) -> dict[str, UserWithHashedPw]:
    users: dict[str, UserWithHashedPw] = {}
    for entry in raw.split(";"):
        username, hash_ = entry.split(":", 1)
        users[username] = UserWithHashedPw(username=username, hashed_password=hash_)
    return users


users = parse_auth_users(settings.auth_users)


def get_authenticated_user(request: Request) -> User:
    username = request.session.get("username")
    if username is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = get_user(username)
    if user is None:
        # this would only happen if cookie names a user that no longer exists
        raise HTTPException(status_code=401, detail="Not authenticated")
    return User.model_validate(user.model_dump())


def get_user(username: str):
    if username in users:
        return users[username]


def authenticate_user(username: str, password: str) -> User | None:
    user = get_user(username)
    if not user:
        # verify against dummy hash here so auth requests take roughly the same ms whether or not user exists
        # (security best practice - resists user-enumeration via response timing)
        password_hash.verify(password, DUMMY_HASH)
        return None
    if not password_hash.verify(password, user.hashed_password):
        return None
    # return user model without the pw hash
    return User.model_validate(user.model_dump())
