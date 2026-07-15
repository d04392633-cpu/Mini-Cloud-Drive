# ☁️ Mini Cloud Drive

> REST API облачного хранилища файлов, разработанное на Go с использованием PostgreSQL, JWT, Docker и принципов Clean Architecture.

![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?logo=go)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Echo](https://img.shields.io/badge/Echo-v4-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 О проекте

**Mini Cloud Drive** — это backend-приложение для хранения файлов, вдохновлённое облачными сервисами вроде Google Drive.

Проект предоставляет REST API для:

- регистрации пользователей;
- авторизации через JWT;
- загрузки файлов;
- скачивания файлов;
- удаления файлов;
- работы с избранными файлами;
- административных функций;
- безопасного хранения данных пользователей.

Главная цель проекта — изучение разработки backend-приложений на Go, работы с PostgreSQL, Docker, JWT-аутентификацией и организацией кода по принципам Clean Architecture.

---

# ✨ Возможности

## 👤 Пользователи

- Регистрация новых пользователей
- Авторизация пользователей
- JWT Authentication
- bcrypt Hashing
- Роли пользователей

---

## 📂 Работа с файлами

- Загрузка файлов
- Скачивание файлов
- Получение списка файлов
- Удаление файлов
- Хранение файлов на диске
- Хранение метаданных в PostgreSQL

---

## ⭐ Избранные файлы

- Добавление файла в избранное
- Получение списка избранных файлов

---

## 🔒 Безопасность

- JWT Middleware
- Admin Middleware
- Проверка владельца файла
- bcrypt для хранения паролей

---

## 🐳 Инфраструктура

- Docker
- Docker Compose
- PostgreSQL
- SQL Migrations
- Makefile
- Environment Variables

---

# 🛠 Технологический стек

| Компонент | Технология |
|------------|------------|
| Язык программирования | Go |
| HTTP Framework | Echo v4 |
| Database | PostgreSQL |
| Driver | pgx |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Containerization | Docker |
| Orchestration | Docker Compose |
| Migrations | golang-migrate |
| Automation | Makefile |

---

# 🏗 Архитектура проекта

Проект построен с использованием принципов **Clean Architecture**.

```text
Mini-Cloud-Drive
│
├── cmd
│   └── api
│       └── main.go
│
├── internal
│   ├── app
│   │   ├── entity
│   │   │   └── user.go
│   │   │
│   │   ├── handlers
│   │   │   ├── admin.go
│   │   │   ├── auth.go
│   │   │   ├── file.go
│   │   │   └── handlers.go
│   │   │
│   │   └── modules
│   │       └── modules.go
│   │
│   ├── config
│   │   └── config.go
│   │
│   ├── middleware
│   │   └── auth.go
│   │
│   ├── repository
│   │   ├── admin.go
│   │   ├── file.go
│   │   └── user.go
│   │
│   └── pkg
│       └── db
│           └── db.go
│
├── migrations
│
├── uploads
│
├── Dockerfile
├── docker-compose.yml
├── .env
├── .env.example
├── go.mod
├── go.sum
└── README.md
```

---

# 📂 Структура проекта

## cmd/api

Точка входа приложения.

Отвечает за:

- запуск сервера;
- подключение конфигурации;
- подключение базы данных;
- регистрацию маршрутов;
- запуск Echo.

---

## internal/app/entity

Слой моделей приложения.

Содержит структуры данных, используемые во всех слоях проекта.

Примеры:

- User
- File
- Favorite

---

## internal/app/handlers

Слой обработки HTTP-запросов.

Задачи:

- обработка запросов;
- получение данных пользователя;
- работа с JSON;
- работа с FormData;
- возврат ответов клиенту.

### auth.go

Маршруты:

- регистрация;
- авторизация.

### file.go

Маршруты:

- загрузка файлов;
- получение файлов;
- удаление файлов;
- скачивание файлов;
- избранные файлы.

### admin.go

Административные маршруты.

### handlers.go

Регистрация всех обработчиков приложения.

---

## internal/app/modules

Инициализация зависимостей приложения.

Создаёт:

- Repository;
- Middleware;
- Handlers.

---

## internal/config

Загрузка конфигурации из `.env`.

Используется для хранения:

- порта приложения;
- подключения к PostgreSQL;
- JWT Secret;
- других настроек.

---

## internal/middleware

Промежуточный слой обработки запросов.

Используется для:

- проверки JWT;
- проверки роли пользователя;
- защиты маршрутов.

---

## internal/repository

Слой доступа к данным.

Содержит все SQL-запросы приложения.

### user.go

Работа с пользователями.

### file.go

Работа с файлами.

### admin.go

Работа с административными функциями.

---

## internal/pkg/db

Пакет подключения к PostgreSQL.

Отвечает за:

- подключение к базе;
- проверку соединения;
- создание пула соединений.

---

## migrations

SQL-миграции проекта.

Позволяют:

- создавать таблицы;
- изменять структуру базы данных;
- откатывать изменения.

---

## uploads

Локальное хранилище файлов.

Все загружаемые пользователями файлы сохраняются в эту директорию.

---

# 🔄 Как работает приложение

```text
Client
   │
   ▼
Echo Router
   │
   ▼
Middleware
   │
   ▼
Handler
   │
   ▼
Repository
   │
   ▼
PostgreSQL
```

---

### Работа с файлами

```text
User
 │
 ▼
Upload Request
 │
 ▼
Handler
 │
 ├──► uploads/
 │
 └──► PostgreSQL
```

Файл сохраняется на диск.

Информация о файле сохраняется в PostgreSQL.

---

# 🗄 База данных

## Таблица users

| Поле | Описание |
|--------|----------|
| id | ID пользователя |
| email | Email |
| password | Хеш пароля |
| role | Роль пользователя |
| created_at | Дата регистрации |

---

## Таблица files

| Поле | Описание |
|--------|----------|
| id | ID файла |
| user_id | Владелец |
| original_name | Исходное имя |
| filename | Имя на диске |
| upload_path | Путь хранения |
| size | Размер файла |
| created_at | Дата загрузки |

---

## Связи

```text
users
  │
  └───────► files
             (1:N)
```

Один пользователь может иметь множество файлов.

---

# 🔐 Аутентификация

Для аутентификации используется JWT.

После успешного входа пользователь получает токен.

Пример:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Токен необходимо передавать в заголовке:

```http
Authorization: Bearer <TOKEN>
```

---

# 🔒 Middleware

## JWT Middleware

Проверяет:

- наличие токена;
- валидность подписи;
- срок действия.

Если токен неверный:

```json
{
  "error": "unauthorized"
}
```

Статус:

```http
401 Unauthorized
```

---

## Admin Middleware

Проверяет наличие роли администратора.

Если пользователь не является администратором:

```http
403 Forbidden
```

---

# 🔌 API Endpoints

## Authentication

### Register

```http
POST /register
```

Пример запроса:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Login

```http
POST /login
```

Пример запроса:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Ответ:

```json
{
  "token": "jwt-token"
}
```

---

# 📂 Files

## Upload File

```http
POST /files
```

Тип:

```text
multipart/form-data
```

---

## Get Files

```http
GET /files
```

---

## Download File

```http
GET /files/:id
```

---

## Delete File

```http
DELETE /files/:id
```

---

# ⭐ Favorite Files

## Add Favorite

```http
POST /favorites/:id
```

---

## Get Favorites

```http
GET /favorites
```

---

## Remove Favorite

```http
DELETE /favorites/:id
```

---

# 👮 Admin

Административные маршруты доступны только пользователям с ролью Admin.

---

# ⚙️ Переменные окружения

Пример файла `.env`:

```env
SERVER_PORT=:8080

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mydrive

JWT_SECRET=super-secret-key

UPLOAD_DIR=./uploads
```

---

# 🐳 Docker

Сборка контейнеров:

```bash
docker compose build
```

Запуск:

```bash
docker compose up
```

Запуск в фоне:

```bash
docker compose up -d
```

Остановка:

```bash
docker compose down
```

---

# 📄 Миграции

Применить миграции:

```bash
make migrate-up
```

Откатить миграции:

```bash
make migrate-down
```

---

# ⚡ Makefile

Основные команды:

```bash
make run
```

Запуск приложения.

```bash
make build
```

Сборка приложения.

```bash
make migrate-up
```

Применение миграций.

```bash
make migrate-down
```

Откат миграций.

```bash
make docker
```

Запуск Docker.

---

# 🚀 Быстрый старт

### Клонирование проекта

```bash
git clone https://github.com/d04392633-cpu/Mini-Cloud-Drive.git

cd Mini-Cloud-Drive
```

---

### Настройка окружения

```bash
cp .env.example .env
```

---

### Запуск через Docker

```bash
docker compose up --build
```

---

### Локальный запуск

Установить зависимости:

```bash
go mod tidy
```

Запустить приложение:

```bash
go run cmd/api/main.go
```

---

# 🧪 Тестирование через Postman

Рекомендуемый порядок проверки API:

1. Register
2. Login
3. Скопировать JWT Token
4. Добавить Authorization Header
5. Upload File
6. Get Files
7. Add Favorite
8. Get Favorites
9. Download File
10. Delete File

---

# 📈 Планы развития

- MinIO
- Amazon S3
- Redis
- Email Verification
- Password Recovery
- Swagger Documentation
- Unit Tests
- Logging
- Monitoring
- React Frontend

---

# 👨‍💻 Автор

**Daler Samadov**

Backend Developer (Go)

GitHub:
https://github.com/d04392633-cpu

---

⭐ Если проект оказался полезным или интересным — поставьте звезду на GitHub.