from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.core.config import settings
from typing import Iterator

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Iterator[Session]:
    """
    Dependency, которая предоставляет сессию БД
    и гарантирует ее закрытие.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()