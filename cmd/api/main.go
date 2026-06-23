package main

import (
	"log"
	"mydrive/internal/app/handlers"
	"mydrive/internal/config"
	"mydrive/internal/pkg/db"

	"mydrive/internal/repository"

	"github.com/labstack/echo/v4"
)

func main() {
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
	e.GET("/health", health.HealthCheck)
	e.POST("/register", authHandler.Register)
	e.POST("/login", authHandler.Login)

	e.Logger.Fatal(e.Start(cfg.ServerPort))
}