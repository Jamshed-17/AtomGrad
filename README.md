# АтомГрад

Веб-приложение для отображения и управления информацией о деятелях атомных городов России.

## 📋 Описание проекта

**АтомГрад** — это полнофункциональное веб-приложение, которое предоставляет:

- **Публичный раздел**: просмотр информации о деятелях атомных городов с поиском, фильтрацией и детальными страницами
- **Административный раздел**: управление контентом (CRUD операции для деятелей и администраторов)

Проект построен на современном стеке технологий с разделением на frontend и backend части.

## 🏗️ Архитектура

Проект использует микросервисную архитектуру:

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Material-UI
│   (Nginx)       │  Порт: 3000
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   Backend API   │  FastAPI + Python
│   (Uvicorn)     │  Порт: 8000
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │  База данных
│   (Docker)      │  Порт: 5432
└─────────────────┘
```

## 🛠️ Технологический стек

### Frontend

- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик и dev-сервер
- **Material-UI (MUI) v7** — компоненты UI
- **React Router v7** — маршрутизация
- **Axios** — HTTP-клиент
- **React Hook Form** — управление формами
- **Nginx** — веб-сервер для продакшена

### Backend

- **FastAPI** — современный веб-фреймворк для Python
- **SQLAlchemy 2.0** — ORM для работы с БД
- **PostgreSQL** — реляционная база данных
- **Pydantic** — валидация данных
- **python-jose** — JWT токены
- **bcrypt** — хеширование паролей
- **Uvicorn** — ASGI сервер

### DevOps

- **Docker** — контейнеризация
- **Docker Compose** — оркестрация контейнеров

## 📁 Структура проекта

```
AtomGrad/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── api/             # API клиент и методы
│   │   │   ├── client.ts    # Настройка Axios
│   │   │   ├── auth.ts     # Аутентификация
│   │   │   ├── persons.ts  # API для деятелей
│   │   │   └── admins.ts   # API для админов
│   │   ├── components/     # Переиспользуемые компоненты
│   │   │   ├── Header.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── TelegramButton.tsx
│   │   │   └── ThemeToggleButton.tsx
│   │   ├── contexts/       # React контексты
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── ThemeContextValue.tsx
│   │   ├── hooks/          # Кастомные хуки
│   │   │   └── useThemeMode.ts
│   │   ├── pages/          # Страницы приложения
│   │   │   ├── HomePage.tsx
│   │   │   ├── PersonDetailPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AdminPersonsPage.tsx
│   │   │   ├── AdminDeletePersonPage.tsx
│   │   │   └── AdminManagementPage.tsx
│   │   ├── theme/          # Тема MUI
│   │   │   └── theme.ts
│   │   ├── App.tsx         # Главный компонент
│   │   └── main.tsx        # Точка входа
│   ├── public/             # Статические файлы
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
│
├── backend/                 # FastAPI приложение
│   ├── api/                # API роутеры
│   │   ├── auth.py        # Аутентификация
│   │   ├── persons.py     # Публичные эндпоинты
│   │   ├── admins.py      # CRUD для деятелей (админ)
│   │   └── superadmin.py  # Управление админами
│   ├── DB/                # Работа с базой данных
│   │   ├── models.py      # SQLAlchemy модели
│   │   ├── schemas.py     # Pydantic схемы
│   │   ├── crud.py        # CRUD операции
│   │   ├── db.py          # Подключение к БД
│   │   ├── init_db.py     # Инициализация БД
│   │   ├── create_tables.py
│   │   └── seeding.py    # Заполнение БД
│   ├── core/              # Конфигурация
│   │   └── config.py      # Настройки приложения
│   ├── static/            # Статические файлы (изображения)
│   ├── main.py            # Точка входа FastAPI
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml      # Конфигурация Docker Compose
└── README.md              # Этот файл
```

## 🚀 Быстрый старт

### Предварительные требования

- **Docker** и **Docker Compose** установлены
- **Node.js 20+** (для локальной разработки frontend)
- **Python 3.10+** (для локальной разработки backend)
- **PostgreSQL 16** (если запускаете БД локально)

### Запуск через Docker Compose (рекомендуется)

1. **Клонируйте репозиторий:**

```bash
git clone <repository-url>
cd AtomGrad
```

2. **Создайте файл `.env` в корне проекта:**

```env
# База данных
POSTGRES_USER=atomgrad
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=atomgrad_db

# Backend настройки
DATABASE_URL=postgresql://atomgrad:your_secure_password@db:5432/atomgrad_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend origins (CORS)
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173,https://atomgrad.site

# Путь к данным для seeding (опционально)
PATH_OF_DATA=/app/backend/data
```

3. **Запустите все сервисы:**

```bash
docker-compose up -d
```

4. **Проверьте статус:**

```bash
docker-compose ps
```

5. **Откройте в браузере:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API документация: http://localhost:8000/docs

### Локальная разработка

#### Backend

1. **Перейдите в директорию backend:**

```bash
cd backend
```

2. **Создайте виртуальное окружение:**

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **Установите зависимости:**

```bash
pip install -r requirements.txt
```

4. **Настройте переменные окружения:**
   Создайте файл `.env` в `backend/` или установите переменные окружения:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/atomgrad_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_ORIGINS=http://localhost:5173
PATH_OF_DATA=./data
```

5. **Запустите сервер:**

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

1. **Перейдите в директорию frontend:**

```bash
cd frontend
```

2. **Установите зависимости:**

```bash
npm install
```

3. **Создайте файл `.env` в `frontend/`:**

```env
VITE_API_URL=http://localhost:8000
```

4. **Запустите dev-сервер:**

```bash
npm run dev
```

5. **Откройте в браузере:** http://localhost:5173

## 📚 API Документация

### Базовый URL

- **Production**: `https://atomgrad.site`
- **Development**: `http://localhost:8000`

### Аутентификация

Все защищенные эндпоинты требуют JWT токен, который передается через HTTP-only cookie.

#### Вход в систему

```http
POST /auth/login
Content-Type: application/json

{
  "login": "admin",
  "password": "password"
}
```

**Ответ:**

```json
{
  "message": "Logged in"
}
```

Токен устанавливается в cookie `access_token`.

#### Выход из системы

```http
POST /auth/logout
```

### Публичные эндпоинты

#### Получить всех деятелей

```http
GET /persons/
```

**Ответ:**

```json
[
  {
    "id": 1,
    "name": "Иванов Иван Иванович",
    "about": "Физик-ядерщик",
    "text": ["Параграф 1", "Параграф 2"],
    "photo": "/img/person1.jpg",
    "sourses": ["Источник 1", "Источник 2"],
    "autor": "Составитель"
  }
]
```

#### Получить деятеля по ID

```http
GET /persons/{person_id}
```

#### Получить деятеля по имени

```http
GET /persons/id/{name}
```

### Административные эндпоинты

Все административные эндпоинты требуют аутентификации.

#### Создать деятеля

```http
POST /admin/persons/
Content-Type: application/json

{
  "name": "Новый деятель",
  "about": "Должность",
  "text": ["Параграф 1", "Параграф 2"],
  "photo": "/img/new_person.jpg",
  "sourses": ["Источник"],
  "autor": "Составитель"
}
```

#### Обновить деятеля

```http
PUT /admin/persons/{person_id}
Content-Type: application/json

{
  "name": "Обновленное имя",
  ...
}
```

#### Удалить деятеля

```http
DELETE /admin/persons/{person_id}
```

### Управление администраторами (только супер-админ)

#### Получить всех админов

```http
GET /admin/admins/
```

#### Создать админа

```http
POST /admin/admins/
Content-Type: application/json

{
  "name": "Новый админ",
  "login": "newadmin",
  "password": "securepassword",
  "is_superadmin": false
}
```

#### Удалить админа

```http
DELETE /admin/admins/{admin_id}
```

### Интерактивная документация

FastAPI автоматически генерирует интерактивную документацию:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎨 Функциональность

### Публичный раздел

- ✅ **Главная страница** со списком деятелей в адаптивной сетке (3 колонки → 2 → 1)
- ✅ **Поиск по имени** с фильтрацией в реальном времени
- ✅ **Фильтрация по алфавиту** (русский алфавит)
- ✅ **Детальная страница деятеля** с полной информацией
- ✅ **Пагинация** списка деятелей
- ✅ **Отображение фотографий** через статические файлы
- ✅ **Темная/светлая тема** с сохранением в localStorage
- ✅ **Адаптивный дизайн** для мобильных устройств

### Административный раздел

- ✅ **Аутентификация** через JWT с HTTP-only cookies
- ✅ **Создание нового деятеля** с валидацией полей
- ✅ **Редактирование деятеля** с предзаполненными данными
- ✅ **Удаление деятеля** с подтверждением
- ✅ **Управление массивами** (text, sources) через динамические поля
- ✅ **Управление администраторами** (только для супер-админов)
  - Создание новых админов
  - Удаление админов
  - Назначение прав супер-админа
- ✅ **Защищенные роуты** с автоматическим редиректом на `/login`
- ✅ **Обработка ошибок** с понятными сообщениями

### Особенности безопасности

- ✅ **HTTP-only cookies** для защиты от XSS атак
- ✅ **Хеширование паролей** с использованием bcrypt
- ✅ **JWT токены** с настраиваемым временем жизни
- ✅ **CORS настройки** для защиты от несанкционированных запросов
- ✅ **Валидация данных** на уровне API (Pydantic)
- ✅ **Разделение прав** (админ / супер-админ)

## 🔧 Конфигурация

### Переменные окружения

#### Backend (.env)

| Переменная                    | Описание                       | Пример                                        |
| ----------------------------- | ------------------------------ | --------------------------------------------- |
| `DATABASE_URL`                | URL подключения к PostgreSQL   | `postgresql://user:pass@localhost:5432/db`    |
| `SECRET_KEY`                  | Секретный ключ для JWT         | `your-secret-key`                             |
| `ALGORITHM`                   | Алгоритм шифрования JWT        | `HS256`                                       |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (минуты)    | `1440`                                        |
| `FRONTEND_ORIGINS`            | Разрешенные origins для CORS   | `http://localhost:5173,https://atomgrad.site` |
| `PATH_OF_DATA`                | Путь к JSON файлам для seeding | `/app/backend/data`                           |

#### Frontend (.env)

| Переменная     | Описание       | Пример                             |
| -------------- | -------------- | ---------------------------------- |
| `VITE_API_URL` | URL бэкенд API | `http://localhost:8000` или `/api` |

### База данных

При первом запуске автоматически:

1. Создаются все таблицы
2. Создается супер-админ (если не существует)
3. Запускается seeding из JSON файлов (если указан `PATH_OF_DATA`)

#### Модели данных

**Persons (Деятели):**

- `id` (int, PK) — уникальный идентификатор
- `name` (string, 100) — имя деятеля
- `about` (string, 150) — краткая информация (должность)
- `text` (JSONB) — массив абзацев биографии
- `photo` (string, 255) — путь к фотографии
- `sourses` (JSONB) — массив источников
- `autor` (string, 150, nullable) — составитель

**Admins (Администраторы):**

- `id` (int, PK) — уникальный идентификатор
- `name` (string, 100) — имя администратора
- `login` (string, 120) — логин для входа
- `hashed_password` (string, 255) — хешированный пароль
- `is_superadmin` (bool) — флаг супер-админа

## 🐳 Docker

### Сборка образов

```bash
# Сборка всех сервисов
docker-compose build

# Сборка конкретного сервиса
docker-compose build frontend
docker-compose build api
```

### Управление контейнерами

```bash
# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

### Доступ к контейнерам

```bash
# Backend
docker-compose exec api bash

# Frontend
docker-compose exec frontend sh

# База данных
docker-compose exec db psql -U atomgrad -d atomgrad_db
```

## 🧪 Разработка

### Структура кода

Проект следует принципам:

- **SOLID** — разделение ответственности
- **KISS** — простота решений
- **DRY** — избежание дублирования кода

### Frontend

- **Компоненты**: функциональные компоненты с хуками
- **Типизация**: строгая типизация TypeScript
- **Стилизация**: Material-UI с кастомной темой
- **Состояние**: React Context для глобального состояния
- **Маршрутизация**: React Router с защищенными роутами

### Backend

- **Архитектура**: разделение на слои (API → CRUD → DB)
- **Валидация**: Pydantic схемы для входных/выходных данных
- **Безопасность**: JWT аутентификация, хеширование паролей
- **База данных**: SQLAlchemy ORM с миграциями через metadata

### Проверка кода

```bash
# Frontend
cd frontend
npm run lint

# Backend (рекомендуется использовать black, flake8, mypy)
black backend/
flake8 backend/
mypy backend/
```

## 📦 Сборка для продакшена

### Frontend

```bash
cd frontend
npm run build
```

Собранные файлы будут в `frontend/dist/`. Nginx автоматически обслуживает их в Docker.

### Backend

Backend запускается через Uvicorn в production режиме:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Для продакшена рекомендуется использовать:

- **Gunicorn** с Uvicorn workers
- **Nginx** как reverse proxy
- **HTTPS** через Let's Encrypt
- **Environment variables** из безопасного хранилища

## 🚨 Решение проблем

### Проблемы с подключением к БД

1. Проверьте, что PostgreSQL запущен:

```bash
docker-compose ps db
```

2. Проверьте переменные окружения в `.env`

3. Проверьте логи:

```bash
docker-compose logs db
docker-compose logs api
```

### CORS ошибки

Убедитесь, что `FRONTEND_ORIGINS` в `.env` содержит правильный origin frontend приложения.

### Проблемы с аутентификацией

1. Проверьте, что токен устанавливается в cookie (откройте DevTools → Application → Cookies)
2. Убедитесь, что `SECRET_KEY` одинаковый на всех серверах
3. Проверьте время жизни токена (`ACCESS_TOKEN_EXPIRE_MINUTES`)

### Проблемы с загрузкой изображений

1. Убедитесь, что папка `backend/static/img/` существует
2. Проверьте права доступа к файлам
3. Проверьте конфигурацию FastAPI StaticFiles в `main.py`

## 📝 Лицензия

[Укажите лицензию проекта]

## 👥 Авторы

[Укажите авторов проекта]

## 🔗 Полезные ссылки

- [FastAPI документация](https://fastapi.tiangolo.com/)
- [React документация](https://react.dev/)
- [Material-UI документация](https://mui.com/)
- [PostgreSQL документация](https://www.postgresql.org/docs/)

---

**Версия документации**: 1.0.0  
**Последнее обновление**: 2025
