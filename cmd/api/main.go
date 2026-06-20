package main

import (
	"log"
	"mydrive/internal/app/handlers"
	"mydrive/internal/config"
	"mydrive/internal/pkg/db"

	"github.com/labstack/echo/v4"
)

func main() {
	cfg := config.Load()

	dbPool, err := db.New(cfg)
	if err != nil {
		log.Fatal("не удалось подключиться к БД:", err)
	}
	defer dbPool.Close()

	h := handlers.NewHandler(dbPool)

	e := echo.New()
	e.GET("/health", h.HealthCheck)

	e.Start(cfg.ServerPort)
}