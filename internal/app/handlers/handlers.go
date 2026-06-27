package handlers

import (
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	DB *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{DB: db}
}

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
