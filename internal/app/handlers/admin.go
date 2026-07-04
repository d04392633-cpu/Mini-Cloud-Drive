package handlers

import (
	"net/http"
	"mydrive/internal/repository"

	"github.com/labstack/echo/v4"
)

type AdminHandler struct {
	Files *repository.FileRepository
}

func NewAdminHandler(files *repository.FileRepository) *AdminHandler {
	return &AdminHandler{Files: files}
}

func (h *AdminHandler) Stats(c echo.Context) error {
	stats, err := h.Files.GetUsersFilesStats()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "не удалось получить статистику",
		})
	}

	return c.JSON(http.StatusOK, stats)
}