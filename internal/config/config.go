package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config — структура настроек. Живёт в пакете config, не нужно никуда выносить.
type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
	JWTSecret  string
	UploadDir  string
}

func Load() *Config {
	// Теперь видим ошибку, если .env не найден
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env не найден:", err)
	}

	return &Config{
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		ServerPort: os.Getenv("SERVER_PORT"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
		UploadDir:  os.Getenv("UPLOAD_DIR"),
	}
}