from pydantic import BaseModel
from fastapi import HTTPException, FastAPI, Response, Depends
from uuid import UUID, uuid4

from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.session_verifier import SessionVerifier
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters


class SessionData(BaseModel):
    username: str


cookie_params = CookieParameters()

# Конфигурация куки
cookie = SessionCookie(
    cookie_name="session_cookie",
    identifier="general_verifier",
    auto_error=True,
    secret_key="DONOTUSE_SECRET_KEY_CHANGE_IN_PROD",  # В продакшене используйте надёжный ключ
    cookie_params=cookie_params,
)

# Бэкенд для хранения сессий в памяти
backend = InMemoryBackend[UUID, SessionData]()


class BasicVerifier(SessionVerifier[UUID, SessionData]):
    def __init__(
        self,
        *,
        identifier: str,
        auto_error: bool,
        backend: InMemoryBackend[UUID, SessionData],
        auth_http_exception: HTTPException,
    ):
        self._identifier = identifier
        self._auto_error = auto_error
        self._backend = backend
        self._auth_http_exception = auth_http_exception

    @property
    def identifier(self):
        return self._identifier

    @property
    def backend(self):
        return self._backend

    @property
    def auto_error(self):
        return self._auto_error

    @property
    def auth_http_exception(self):
        return self._auth_http_exception

    def verify_session(self, model: SessionData) -> bool:
        """Если сессия существует, она считается валидной"""
        return True


verifier = BasicVerifier(
    identifier="general_verifier",
    auto_error=True,
    backend=backend,
    auth_http_exception=HTTPException(status_code=403, detail="invalid session"),
)

app = FastAPI()


@app.post("/create_session/{name}")
async def create_session(name: str, response: Response):
    session_id = uuid4()
    session_data = SessionData(username=name)

    await backend.create(session_id, session_data)
    cookie.attach_to_response(response, session_id)

    return {"message": f"created session for {name}", "session_id": str(session_id)}


@app.get("/whoami")
async def whoami(session_data: SessionData = Depends(verifier)):
    return {"username": session_data.username}


@app.post("/delete_session")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    await backend.delete(session_id)
    cookie.delete_from_response(response)
    return {"message": "session deleted"}
