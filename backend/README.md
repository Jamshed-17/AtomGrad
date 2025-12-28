# АтомГрад - Backend API

Backend часть веб-приложения для управления информацией о деятелях атомных городов.

## 🛠️ Технологический стек

- **FastAPI** — современный веб-фреймворк для Python
- **SQLAlchemy 2.0** — ORM для работы с БД
- **PostgreSQL 16** — реляционная база данных
- **Pydantic** — валидация данных и схемы
- **python-jose** — JWT токены для аутентификации
- **bcrypt** — хеширование паролей
- **Uvicorn** — ASGI сервер
- **psycopg2-binary** — драйвер PostgreSQL

## 📁 Структура проекта

```
backend/
├── api/                    # API роутеры (эндпоинты)
│   ├── __init__.py
│   ├── auth.py            # Аутентификация (login, logout)
│   ├── persons.py         # Публичные эндпоинты для деятелей
│   ├── admins.py          # CRUD для деятелей (требует auth)
│   └── superadmin.py      # Управление администраторами (требует superadmin)
│
├── DB/                     # Работа с базой данных
│   ├── __init__.py
│   ├── models.py          # SQLAlchemy модели (Persons, Admins)
│   ├── schemas.py         # Pydantic схемы для валидации
│   ├── crud.py            # CRUD операции для работы с БД
│   ├── db.py              # Подключение к БД и сессии
│   ├── init_db.py         # Инициализация БД (создание таблиц, superadmin)
│   ├── create_tables.py   # Создание таблиц
│   └── seeding.py         # Заполнение БД из JSON файлов
│
├── core/                   # Конфигурация приложения
│   └── config.py          # Настройки (settings) из переменных окружения
│
├── static/                # Статические файлы
│   └── img/               # Изображения деятелей
│
├── main.py                # Точка входа FastAPI приложения
├── requirements.txt       # Python зависимости
└── Dockerfile            # Docker образ для backend
```

## 🚀 Установка и запуск

### Предварительные требования

- **Python 3.10+**
- **PostgreSQL 16** (или Docker с PostgreSQL)
- **pip** — менеджер пакетов Python

### Локальная разработка

1. **Создайте виртуальное окружение:**
```bash
python -m venv venv

# Активация (Windows)
venv\Scripts\activate

# Активация (Linux/Mac)
source venv/bin/activate
```

2. **Установите зависимости:**
```bash
pip install -r requirements.txt
```

3. **Настройте переменные окружения:**

Создайте файл `.env` в корне `backend/` или установите переменные окружения:

```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/atomgrad_db

# JWT настройки
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS настройки
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000

# Путь к данным для seeding (опционально)
PATH_OF_DATA=./data
```

4. **Убедитесь, что PostgreSQL запущен и база данных создана:**
```sql
CREATE DATABASE atomgrad_db;
```

5. **Запустите сервер:**
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

6. **Проверьте работу:**
   - API: http://localhost:8000
   - Документация: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Запуск через Docker

См. основной `README.md` для инструкций по Docker Compose.

## 📊 Модели данных

### Persons (Деятели)

```python
class Persons(Base):
    id: int                    # PK, автоинкремент
    name: str                  # Имя деятеля (max 100 символов)
    about: str                 # Краткая информация/должность (max 150 символов)
    text: List[str]            # Биография (JSONB массив абзацев)
    photo: str                 # Путь к фотографии (max 255 символов)
    sourses: List[str]         # Источники (JSONB массив)
    autor: Optional[str]       # Составитель (nullable, max 150 символов)
```

### Admins (Администраторы)

```python
class Admins(Base):
    id: int                    # PK, автоинкремент
    name: str                  # Имя администратора (max 100 символов)
    login: str                 # Логин для входа (max 120 символов, уникальный)
    hashed_password: str       # Хешированный пароль (bcrypt)
    is_superadmin: bool       # Флаг супер-админа
    
    # Методы:
    set_password(password)    # Установить пароль (хеширование)
    verify_password(password)  # Проверить пароль
```

## 🔌 API Эндпоинты

### Аутентификация (`/auth`)

#### POST `/auth/login`
Вход в систему. Устанавливает JWT токен в HTTP-only cookie.

**Request:**
```json
{
  "login": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Logged in"
}
```

**Cookie:** `access_token` (HTTP-only, SameSite=Lax)

#### POST `/auth/logout`
Выход из системы. Удаляет cookie с токеном.

**Response:**
```json
{
  "message": "Logged out"
}
```

### Публичные эндпоинты (`/persons`)

#### GET `/persons/`
Получить список всех деятелей.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Иванов Иван Иванович",
    "about": "Физик-ядерщик",
    "text": ["Параграф 1", "Параграф 2"],
    "photo": "/img/person1.jpg",
    "sourses": ["Источник 1"],
    "autor": "Составитель"
  }
]
```

#### GET `/persons/{person_id}`
Получить деятеля по ID.

**Response:** `PersonRead` объект

#### GET `/persons/id/{name}`
Получить деятеля по имени.

**Response:** `PersonRead` объект

### Административные эндпоинты (`/admin/persons`)

Все эндпоинты требуют аутентификации (JWT токен в cookie).

#### POST `/admin/persons/`
Создать нового деятеля.

**Request:**
```json
{
  "name": "Новый деятель",
  "about": "Должность",
  "text": ["Параграф 1"],
  "photo": "/img/new_person.jpg",
  "sourses": ["Источник"],
  "autor": "Составитель"
}
```

**Response:** `PersonRead` объект

#### PUT `/admin/persons/{person_id}`
Обновить деятеля по ID.

**Request:** `PersonCreate` объект

**Response:** `PersonRead` объект

#### DELETE `/admin/persons/{person_id}`
Удалить деятеля по ID.

**Response:** `204 No Content`

### Управление администраторами (`/admin/admins`)

Все эндпоинты требуют прав супер-админа.

#### GET `/admin/admins/`
Получить список всех администраторов.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Админ",
    "login": "admin",
    "is_superadmin": true
  }
]
```

#### POST `/admin/admins/`
Создать нового администратора.

**Request:**
```json
{
  "name": "Новый админ",
  "login": "newadmin",
  "password": "securepassword",
  "is_superadmin": false
}
```

**Response:** `AdminRead` объект

#### DELETE `/admin/admins/{admin_id}`
Удалить администратора по ID.

**Response:** `204 No Content`

## 🔐 Аутентификация и авторизация

### JWT Токены

- **Алгоритм:** HS256
- **Срок жизни:** настраивается через `ACCESS_TOKEN_EXPIRE_MINUTES` (по умолчанию 1440 минут = 24 часа)
- **Хранение:** HTTP-only cookie (`access_token`)
- **Payload:** `{"sub": admin_id, "exp": timestamp}`

### Зависимости (Dependencies)

#### `get_current_admin`
Проверяет JWT токен из cookie и возвращает ID администратора.

**Использование:**
```python
@router.get("/protected")
def protected_endpoint(admin_id: int = Depends(get_current_admin)):
    return {"admin_id": admin_id}
```

#### `get_current_admin_obj`
Получает полный объект `Admins` из БД.

**Использование:**
```python
@router.get("/protected")
def protected_endpoint(admin: models.Admins = Depends(get_current_admin_obj)):
    return {"admin_name": admin.name}
```

### Проверка прав супер-админа

```python
@router.delete("/admin/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    current_admin: models.Admins = Depends(get_current_admin_obj)
):
    if not current_admin.is_superadmin:
        raise HTTPException(status_code=403, detail="Only superadmin can delete admins")
    # ...
```

## 🗄️ Работа с базой данных

### Инициализация БД

При первом запуске автоматически выполняется:

1. **Создание таблиц** (`create_db_and_tables()`)
   - Создает все таблицы через SQLAlchemy metadata
   - Ожидает готовности PostgreSQL (retry логика)

2. **Создание супер-админа** (`create_superadmin()`)
   - Проверяет наличие супер-админа
   - Создает, если не существует
   - Логин/пароль из переменных окружения или по умолчанию

3. **Seeding** (`run_db_seeding()`)
   - Заполняет БД из JSON файлов
   - Путь к файлам: `PATH_OF_DATA`
   - Пропускает уже существующие записи (по `name`)

### CRUD операции

Все CRUD операции находятся в `backend/DB/crud.py`:

**Persons:**
- `all_persons(db)` — получить всех деятелей
- `one_person(db, person_id)` — получить деятеля по ID
- `person_id(db, name)` — получить ID по имени
- `new_person(db, person)` — создать деятеля
- `edit_person(db, person_id, person)` — обновить деятеля
- `delete_person(db, person_id)` — удалить деятеля

**Admins:**
- `get_admin_by_login(db, login)` — получить админа по логину
- `create_admin(db, admin)` — создать админа
- `get_all_admins(db)` — получить всех админов
- `delete_admin(db, admin_id)` — удалить админа

### Сессии БД

Используется dependency injection через FastAPI:

```python
def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Использование:**
```python
@router.get("/")
def endpoint(db: Session = Depends(get_db)):
    # Работа с БД
    pass
```

## ⚙️ Конфигурация

### Переменные окружения

Все настройки загружаются из переменных окружения через `pydantic-settings`.

| Переменная | Описание | Пример | Обязательно |
|-----------|----------|--------|-------------|
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgresql://user:pass@localhost:5432/db` | ✅ |
| `SECRET_KEY` | Секретный ключ для JWT | `your-secret-key` | ✅ |
| `ALGORITHM` | Алгоритм шифрования JWT | `HS256` | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (минуты) | `1440` | ❌ |
| `FRONTEND_ORIGINS` | Разрешенные origins для CORS | `http://localhost:5173` | ✅ |
| `PATH_OF_DATA` | Путь к JSON файлам для seeding | `./data` | ❌ |

### CORS настройки

CORS middleware настроен в `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 Pydantic схемы

Схемы определены в `backend/DB/schemas.py`:

### PersonCreate / PersonRead
```python
class PersonBase(BaseModel):
    name: str
    about: str
    text: List[str]
    photo: str
    sourses: List[str]
    autor: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonRead(PersonBase):
    id: int
```

### AdminLogin / AdminCreate / AdminRead
```python
class AdminLogin(BaseModel):
    login: str
    password: str

class AdminCreate(BaseModel):
    name: str
    login: str
    password: str
    is_superadmin: bool = False

class AdminRead(BaseModel):
    id: int
    name: str
    login: str
    is_superadmin: bool
```

## 📁 Статические файлы

Изображения обслуживаются через FastAPI StaticFiles:

```python
app.mount("/img", StaticFiles(directory="backend/static/img"), name="images")
```

**Доступ:** `http://localhost:8000/img/person1.jpg`

## 🧪 Разработка

### Структура кода

Проект следует принципам:
- **Разделение на слои:** API → CRUD → DB
- **Dependency Injection:** через FastAPI Depends
- **Валидация данных:** Pydantic схемы
- **Типизация:** type hints везде

### Добавление нового эндпоинта

1. Создайте функцию в соответствующем роутере (`api/*.py`)
2. Добавьте декоратор `@router.get/post/put/delete(...)`
3. Используйте зависимости для аутентификации при необходимости
4. Используйте Pydantic схемы для валидации

**Пример:**
```python
@router.get("/example", response_model=schemas.ExampleRead)
def get_example(
    example_id: int,
    db: Session = Depends(db.get_db),
    admin_id: int = Depends(get_current_admin)
):
    # Логика
    return result
```

### Добавление новой модели

1. Создайте модель в `DB/models.py`
2. Создайте Pydantic схемы в `DB/schemas.py`
3. Добавьте CRUD операции в `DB/crud.py`
4. Обновите `init_db.py` для создания таблицы

## 🐛 Решение проблем

### Проблемы с подключением к БД

1. **Проверьте DATABASE_URL:**
   - Формат: `postgresql://user:password@host:port/database`
   - Убедитесь, что PostgreSQL запущен

2. **Проверьте логи:**
   - Backend автоматически пытается подключиться с retry логикой
   - Смотрите логи в консоли или `docker-compose logs api`

### Проблемы с аутентификацией

1. **Проверьте SECRET_KEY:**
   - Должен быть одинаковым на всех серверах
   - Используйте надежный случайный ключ

2. **Проверьте время жизни токена:**
   - Убедитесь, что `ACCESS_TOKEN_EXPIRE_MINUTES` правильно настроен

### Проблемы с CORS

1. **Проверьте FRONTEND_ORIGINS:**
   - Должен содержать точный origin frontend приложения
   - Формат: `http://localhost:5173,https://atomgrad.site`

## 📦 Зависимости

Основные зависимости (см. `requirements.txt`):

- `fastapi` (0.121.2) — веб-фреймворк
- `uvicorn` (0.38.0) — ASGI сервер
- `sqlalchemy` (2.0.44) — ORM
- `psycopg2-binary` (2.9.11) — драйвер PostgreSQL
- `pydantic` (2.12.4) — валидация данных
- `python-jose` (3.5.0) — JWT
- `bcrypt` (4.3.0) — хеширование паролей
- `passlib` (1.7.4) — утилиты для паролей

## 🐳 Docker

Backend запускается в Docker контейнере с:
- Python 3.10-slim базовый образ
- Uvicorn для запуска FastAPI
- Автоматическая инициализация БД при старте

См. основной `README.md` для инструкций по Docker Compose.

---

**Версия**: 1.0.0  
**Последнее обновление**: 2025

