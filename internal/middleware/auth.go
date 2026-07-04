package middleware

import (
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
)

func JWTMiddleware(secret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			auth := c.Request().Header.Get("Authorization")
			if auth == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "no token",
				})
			}
			tokenString := strings.TrimPrefix(auth, "Bearer ")

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, nil
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "Invalid token",
				})
			}
			claims := token.Claims.(jwt.MapClaims)

			c.Set("user_id", claims["user_id"])
			c.Set("user_role", claims["role"])
			return next(c)
		}
	}
}

func AdminMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Достаём роль с груди (которую положил JWTMiddleware)
			role, ok := c.Get("user_role").(string)
			if !ok || role != "admin" {
				return c.JSON(http.StatusForbidden, map[string]string{
					"error": "доступ запрещён: требуется роль admin",
				})
			}
			// Роль подходит — пускаем дальше
			return next(c)
		}
	}
}
