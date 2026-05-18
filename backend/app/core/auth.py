from dataclasses import dataclass

from fastapi import Header, Query

from app.core.errors import AppError


GENERATION_LIMITS: dict[str, int | None] = {
    "artem": None,
    "ieh": 25,
    "test1": 10,
    "test2": 10,
    "test3": 10,
}


@dataclass(frozen=True)
class CurrentUser:
    login: str
    generation_limit: int | None


async def get_current_user(
    x_aurora_user: str | None = Header(default=None),
    user: str | None = Query(default=None),
) -> CurrentUser:
    login = (x_aurora_user or user or "").strip()
    if login not in GENERATION_LIMITS:
        raise AppError("Unauthorized", 401)
    return CurrentUser(login=login, generation_limit=GENERATION_LIMITS[login])
