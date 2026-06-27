# Mini Cloud Drive ☁️

> Упрощённый аналог Google Drive (backend) — учебный проект на Go с REST API.

---

## 🌐 English Summary

A simplified file storage backend built with **Go + Echo + PostgreSQL**. Supports user registration, JWT authentication, file upload/download/delete with metadata stored in PostgreSQL and files saved on disk.

**Architecture**: Standard `golang-standards/project-layout` structure.

---

## 📦 Технологический стек

| Компонент | Технология | Назначение |
|-----------|-----------|------------|
| Backend | **Go 1.22+** | Основной язык |
| HTTP Framework | **Echo v4** | REST API роутинг, middleware, валидация |
| Database Driver | **pgx (jackc/pgx/v5)** | PostgreSQL драйвер + пул соединений |
| Auth | **JWT** + **bcrypt** | Stateless аутентификация + хеширование паролей |
| БД | **PostgreSQL 16** | Хранение пользователей и метаданных файлов |
| Frontend | **React + Vite** *(планируется)* | Интерфейс пользователя |

---

## 🏗 Архитектура проекта

Проект структурирован по стандарту **[golang-standards/project-layout](https://github.com/golang-standards/project-layout)**:

```
mydrive/
├── cmd/api/
│   └── main.go              # Точка входа (только wiring + запуск)
│
├── internal/
│   ├── config/              # Загрузка .env конфигурации
│   │   └── config.go
│   ├── db/                  # Подключение к PostgreSQL + миграции
│   │   └── db.go
│   ├── handlers/            # HTTP обработчики (сло́й контроллеров)
│   │   ├── handler.go       # Health check
│   │   ├── auth.go          # Регистрация / вход
│   │   └── file.go          # Загрузка / список / скачивание / удаление
│   ├── middleware/          # JWT проверка токенов
│   │   └── auth.go
│   ├── models/              # Go-структуры (DTO / entities)
│   │   └── models.go
│   └── repository/          # Сло́й доступа к данным (SQL-запросы)
│       ├── user.go
│       └── file.go
│
├── uploads/                 # Хранилище файлов на диске (не в Git!)
├── migrations/              # SQL-файлы схемы БД (документация)
│   ├── 001_create_users_table.sql
│   └── 002_create_files_table.sql
│
├── .env                     # Переменные окружения (не в Git!)
├── .env.example             # Шаблон для новых разработчиков
├── go.mod
└── README.md                # ← Вы здесь
```

**Принцип разделения ответственности:**

- `cmd/api/main.go` — только "розетка": создаёт зависимости, соединяет, запускает.
- `handlers/` — принимает HTTP-запросы, валидирует входные данные, формирует ответы.
- `repository/` — единственное место с SQL-запросами. Независимо от HTTP.
- `middleware/` — перехватчики запросов (JWT проверка) до попадания в handlers.
- `models/` — чистые структуры данных, используются во всех слоях.

---

## 🗄 Схема базы данных

### Таблица `users`
| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `SERIAL PRIMARY KEY` | Уникальный ID |
| `email` | `VARCHAR(255) UNIQUE NOT NULL` | Email пользователя |
| `password_hash` | `VARCHAR(255) NOT NULL` | Хеш пароля (bcrypt) |
| `created_at` | `TIMESTAMP DEFAULT now()` | Дата регистрации |

### Таблица `files`
| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `SERIAL PRIMARY KEY` | Уникальный ID |
| `user_id` | `INTEGER REFERENCES users(id) ON DELETE CASCADE` | Владелец файла |
| `filename` | `VARCHAR(255) UNIQUE NOT NULL` | UUID-имя на диске |
| `original_name` | `VARCHAR(255) NOT NULL` | Оригинальное имя файла |
| `size` | `BIGINT NOT NULL` | Размер в байтах |
| `upload_path` | `VARCHAR(500) NOT NULL` | Путь на диске |
| `created_at` | `TIMESTAMP DEFAULT now()` | Дата загрузки |

**Связь:** `users` (1) → `files` (N). При удалении пользователя каскадно удаляются все его файлы.

---

## 🔌 API Endpoints

### Публичные (без авторизации)

#### `GET /health`
Проверка работоспособности сервера и подключения к БД.

**Ответ 200:**
```json
{"status": "ok", "db": "connected"}
```

**Ответ 500:**
```json
{"status": "error", "db": "unreachable"}
```

---

#### `POST /register`
Регистрация нового пользователя.

**Тело:**
```json
{"email": "user@example.com", "password": "password123"}
```

**Ответ 201 (Created):**
```json
{"id": 1, "email": "user@example.com"}
```

**Ответ 400:** неверный JSON.  
**Ответ 409:** email уже занят.

**Безопасность:** пароль хешируется через `bcrypt` с солью. Не хранится в открытом виде.

---

#### `POST /login`
Авторизация. Возвращает JWT-токен.

**Тело:**
```json
{"email": "user@example.com", "password": "password123"}
```

**Ответ 200:**
```json
{"token": "eyJhbGciOiJIUzI1NiIs..."}
```

**Ответ 401:** неверный email или пароль (единый ответ для безопасности — не палит существование email).

---

### Защищённые (требуют `Authorization: Bearer <token>`)

#### `POST /files`
Загрузка файла. `multipart/form-data`.

```bash
curl -X POST http://localhost:8080/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf"
```

**Ответ 201:**
```json
{"id": 1, "filename": "9b1c32d8-4c0f.pdf", "size": 482931}
```

**Что происходит:**
1. Генерируется UUID-имя файла (защита от перезаписи, коллизий имён).
2. Сохраняется на диск в `./uploads/`.
3. Метаданные записываются в PostgreSQL с `user_id` текущего пользователя.

---

#### `GET /files`
Список файлов текущего пользователя.

**Ответ 200:**
```json
{
  "files": [
    {
      "id": 1,
      "user_id": 1,
      "filename": "9b1c32d8-4c0f.pdf",
      "original_name": "document.pdf",
      "size": 482931,
      "created_at": "2026-06-21T15:34:18Z"
    }
  ]
}
```

Сортировка: новые сверху (`ORDER BY created_at DESC`).

---

#### `GET /files/:id/download`
Скачивание файла по ID. Возвращает `Content-Disposition: attachment` с оригинальным именем.

```bash
curl -O -J http://localhost:8080/files/1/download \
  -H "Authorization: Bearer <token>"
```

**Безопасность:** проверяется владелец файла. Чужой файл → `403 Forbidden`.

---

#### `DELETE /files/:id`
Удаление файла. Удаляет с диска и из БД.

```bash
curl -X DELETE http://localhost:8080/files/1 \
  -H "Authorization: Bearer <token>"
```

**Ответ 200:**
```json
{"message": "файл удалён"}
```

**Безопасность:** проверяется владелец. Чужой файл → `403 Forbidden`.

---

## 🔐 Аутентификация и авторизация

### JWT (JSON Web Token) — Stateless

- **Протокол:** Bearer token в заголовке `Authorization`.
- **Алгоритм:** `HS256` (HMAC + SHA256).
- **Payload:** `user_id`, `email`, `exp` (время истечения).
- **Секрет:** хранится в `.env` (`JWT_SECRET`).
- **Жизнь:** 24 часа (по умолчанию, настраивается в коде).

**Почему JWT, а не сессии в БД?**
- Сервер не хранит состояние (stateless) — масштабируемо.
- Не нужна таблица/Redis сессий.
- Минимальная нагрузка на сервер.

**Торговля:** отзыв токена невозможен без смены секретного ключа. Для MVP это приемлемо.

### Middleware: проверка токена

Каждый защищённый запрос проходит через `JWTMiddleware`:
1. Читает `Authorization` заголовок.
2. Отрезает `Bearer `.
3. Проверяет подпись через `jwt.Parse`.
4. Если валиден — кладёт `user_id` в `echo.Context` (стикер для handler).
5. Если невалиден — `401 Unauthorized`.

---

## ⚙️ Переменные окружения

Создай файл `.env` в корне проекта (копируй из `.env.example`):

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=mydrive
DB_PASSWORD=mydrive123
DB_NAME=mydrive

# Сервер
SERVER_PORT=:8080

# JWT (сменить на продакшене!)
JWT_SECRET=super-secret-key-change-me

# Хранилище файлов
UPLOAD_DIR=./uploads
```

> ⚠️ **Файл `.env` не коммитится в Git!** Добавлен в `.gitignore`.

---

## 🚀 Локальный запуск (без Docker)

### 1. Предварительные требования

- **Go** 1.22+ (`go version`)
- **PostgreSQL** 16+ (установлен локально)
- **pgAdmin / DBeaver / psql** (для управления БД)

### 2. Создание базы данных

Выполни в `psql` или DBeaver (под пользователем `postgres`):

```sql
CREATE DATABASE mydrive;
CREATE USER mydrive WITH PASSWORD 'mydrive123';
GRANT ALL PRIVILEGES ON DATABASE mydrive TO mydrive;
```

### 3. Запуск сервера

```bash
# Переход в папку проекта
cd mydrive

# Установка зависимостей
go mod tidy

# Создание .env (один раз)
cp .env.example .env
# ...отредактируй .env под свои настройки PostgreSQL

# Запуск сервера
go run cmd/api/main.go
```

Сервер стартует на `http://localhost:8080`.

### 4. Проверка

```bash
# Health check
curl http://localhost:8080/health

# Регистрация
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"password123"}'

# Вход (запомни токен)
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"password123"}'

# Загрузка файла (замени <TOKEN> на реальный токен)
curl -X POST http://localhost:8080/files \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@README.md"

# Список файлов
curl http://localhost:8080/files \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 Пайплайн запроса (как это работает)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Клиент    │────▶│    Echo     │────▶│   Middleware    │────▶│   Handler   │
│ (curl/HTTP) │     │  (роутер)   │     │ (JWT проверка)  │     │  (бизнес)   │
└─────────────┘     └─────────────┘     └─────────────────┘     └─────────────┘
                                              │                        │
                                              │                        │
                                              ▼                        ▼
                                         Верификация токена      Работа с БД
                                         (stateless)            (repository)
```

---

## 👤 Автор

**Daler Samadov** — Junior Go Backend Developer, Душанбе, Таджикистан.

---

> *"Сначала минимально рабочая версия, улучшения потом."* — наш подход к разработке.
