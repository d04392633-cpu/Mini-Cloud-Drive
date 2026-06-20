package handlers

import (
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

// Handler — хранит зависимости (сейчас только БД).
// Начинается с большой буквы, чтобы был доступен из других пакетов (main).
type Handler struct {
	DB *pgxpool.Pool
}

// NewHandler создаёт Handler и передаёт ему подключение к БД.
func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{DB: db}
}

// HealthCheck проверяет, отвечает ли PostgreSQL.
func (h *Handler) HealthCheck(c echo.Context) error {
	err := h.DB.Ping(context.Background())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"status": "error",
			"db":     "unreachable",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "ok",
		"db":     "connected",
	})
}