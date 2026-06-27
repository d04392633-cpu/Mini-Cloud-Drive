package repository

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type FileRepository struct {
	DB *pgxpool.Pool
}

func NewFileRepository(db *pgxpool.Pool) *FileRepository {
	return &FileRepository{DB: db}
}

func (r *FileRepository) CreateFile(userID int, diskName, originalName string, size int64, path string) (int, error) {
	var id int

	err := r.DB.QueryRow(
		context.Background(),
		`INSERT INTO files (user_id, filename, original_name, size, upload_patch, created_at) 
		 VALUES ($1, $2, $3, $4, $5, $6) 
		 RETURNING id`,
		userID, diskName, originalName, size, path, time.Now(),
	).Scan(&id)

	if err != nil {
		log.Println("DB error (CreateFile):", err)
	}

	return id, err
}
