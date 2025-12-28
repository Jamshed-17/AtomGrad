from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, JSON, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from passlib.context import CryptContext
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Base(DeclarativeBase):
    pass


class Persons(Base):
    __tablename__ = "persons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True) #ID
    name: Mapped[str] = mapped_column(String(100)) # Имя
    about: Mapped[str] = mapped_column(String(150), nullable=False) # Информация (должность)
    text: Mapped[JSONB] = mapped_column(JSON, nullable=False) # Текст о деятеле, записанный в JSON, абзац = элемент
    photo: Mapped[str] = mapped_column(String(255), nullable=False) # Фотография деятеля, в виде ссылки на файл
    sourses: Mapped[JSONB] = mapped_column(JSON, nullable=False) # Источники в виде JSON, один источник = один элемент 
    autor: Mapped[Optional[str]] = mapped_column(String(150), nullable=True) # Составитель, если есть
    
    
class Admins(Base):
    __tablename__ = "admins"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True) # ID
    name: Mapped[str] = mapped_column(String(100)) # Имя администратора
    login: Mapped[str] = mapped_column(String(120)) # Логин администратора
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False) # Хэшированный пароль
    is_superadmin: Mapped[bool] = mapped_column(Boolean)

    # метод для установки пароля
    def set_password(self, password: str):
        truncated_password = password.encode('utf-8')[:72]
        self.hashed_password = pwd_context.hash(truncated_password)

    # метод для проверки пароля
    def verify_password(self, password: str) -> bool:
        truncated_password = password.encode('utf-8')[:72]
        return pwd_context.verify(truncated_password, self.hashed_password)
    