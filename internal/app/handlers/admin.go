package handlers

import (
	"mydrive/internal/repository"
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)


type AdminHandler struct {
	Users     *repository.UserRepository
	JWTSecret string
	Files *repository.FileRepository
}

func NewAdminHandler(files *repository.FileRepository, users *repository.UserRepository) *AdminHandler {
	return &AdminHandler{
		Files: files,
		Users: users,
	}
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

func (h *AdminHandler) RegisterAdmin(c echo.Context) error {
var req RegisterRequest				

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "неверный формат JSON",
		})
	}

	heshPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "password hashing error"})
	}

	id, err := h.Users.CreateUser(req.FullName, req.Email, string(heshPassword),"admin")
	if id == 0 {
		return c.JSON(http.StatusConflict, map[string]string{"error": "registered email"})
	}
	if err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "email is already taken"})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"id":        id,
		"email":     req.Email,
		"full_name": req.FullName,
	})


}