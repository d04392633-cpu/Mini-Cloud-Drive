package modules

import (
	"log"
	"mydrive/internal/app/handlers"
	"mydrive/internal/config"
	"mydrive/internal/middleware"
	"mydrive/internal/pkg/db"
	"mydrive/internal/repository"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func Run(){
	cfg := config.Load()

	dbPool, err := db.New(cfg)
	if err != nil {
		log.Fatal("не удалось подключиться к БД:", err)
	}
	defer dbPool.Close()

	userRepo := repository.NewUserRepository(dbPool)
	authHandler := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)

	health := handlers.NewHandler(dbPool)

	e := echo.New()
	e.Use(echoMiddleware.CORS())
	e.GET("/health", health.HealthCheck)
	e.POST("/register", authHandler.Register)
	e.POST("/login", authHandler.Login)
	e.GET("/me", func(c echo.Context) error {
		userID := c.Get("user_id")
		return c.JSON(200, map[string]interface{}{
			"message": "ты авторизован",
			"user_id": userID,
		})
	}, middleware.JWTMiddleware(cfg.JWTSecret))

	fileRepo := repository.NewFileRepository(dbPool)
	fileHandler := handlers.NewFileHendler(fileRepo)

	e.POST("/AddFiles", fileHandler.Upload, middleware.JWTMiddleware(cfg.JWTSecret))
	e.GET("/MyFiles", fileHandler.FileList, middleware.JWTMiddleware(cfg.JWTSecret))
	e.GET("/files/:id/download", fileHandler.Download, middleware.JWTMiddleware(cfg.JWTSecret))
	e.DELETE("/delete/:id", fileHandler.DeleteFile, middleware.JWTMiddleware(cfg.JWTSecret))

	e.Logger.Fatal(e.Start(cfg.ServerPort))
}