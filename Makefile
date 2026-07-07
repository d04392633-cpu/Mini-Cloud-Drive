DB_URL=postgres://postgres:postgres@localhost:5432/mydrive?sslmode=disable

.PHONY: up down logs db migrate-up migrate-down migrate-force migrate-version reset

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

db:
	docker compose exec postgres psql -U postgres -d mydrive

migrate-up:
	migrate -path migrations -database "$(DB_URL)" up

migrate-down:
	migrate -path migrations -database "$(DB_URL)" down

migrate-force:
	migrate -path migrations -database "$(DB_URL)" force 1

migrate-version:
	migrate -path migrations -database "$(DB_URL)" version

migrate-up:
	docker compose exec -T postgres psql -U postgres -d mydrive -f /migrations/000001_create_users.up.sql
	docker compose exec -T postgres psql -U postgres -d mydrive -f /migrations/000002_create_files.up.sql

reset:
	docker compose down -v
	docker compose up -d postgres
	@echo "Ожидаем запуск базы данных..."
	@sleep 3
	docker compose exec -T postgres psql -U postgres -d mydrive -f /migrations/000001_create_users.up.sql
	docker compose exec -T postgres psql -U postgres -d mydrive -f /migrations/000002_create_files.up.sql