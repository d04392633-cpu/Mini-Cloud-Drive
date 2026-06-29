package handlers

import (
	"mydrive/internal/repository"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthHandler struct {
	Users     *repository.UserRepository
	JWTSecret string
}

func NewAuthHandler(users *repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		Users:     users,
		JWTSecret: jwtSecret,
	}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

func (h *AuthHandler) Register(c echo.Context) error {
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

	id, err := h.Users.CreateUser(req.FullName, req.Email, string(heshPassword))
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

func (h *AuthHandler) Login(c echo.Context) error {

	var req LoginRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "неверный формат JSON",
		})
	}

	id, password_hash, err := h.Users.GetUserByEmail(req.Email)
	err = bcrypt.CompareHashAndPassword([]byte(password_hash), []byte(req.Password))
	if err != nil {
		return c.JSON(401, map[string]string{"error": "Incorrect email or password"})
	}

	claims := jwt.MapClaims{
		"user_id": id,
		"email":   req.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.JWTSecret))

	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to create JWT token"})
	}

	return c.JSON(200, map[string]string{"token": tokenString})
}

func (h *AuthHandler) Me(c echo.Context) error {
	userID := int(c.Get("user_id").(float64))

	user, err := h.Users.GetInfoUserInformationByID(userID)
	if err != nil {
		return c.JSON(400, map[string]string{
			"error": "не удалось получить данные о пользователе",
		})
	}

	return c.JSON(200, user)
}
