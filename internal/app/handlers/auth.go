package handlers

import (
	"mydrive/internal/repository"
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Users *repository.UserRepository
}

func NewAuthHandler(user *repository.UserRepository) *AuthHandler {
	return &AuthHandler{Users: user}
}

type RegisterRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req RegisterRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "неверный формат JSON",
		})
	}

	heshPassword, err := bcrypt.GenerateFromPassword([]byte (req.Password),bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "password hashing error"})
	}

	id, err := h.Users.CreateUser(req.Email, string(heshPassword))
	if err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error":"email is already taken"})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"id":id,
		"email": req.Email,
	})
}	       