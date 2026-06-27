package models

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

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

type Handler struct {
	DB *pgxpool.Pool
}

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"create_at"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type File struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	FileName     string    `json:"filename"`
	OriginalName string    `json:"original_name"`
	Size         int64     `json:"size"`
	UploadPath   string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}
