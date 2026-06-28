package repository

import (
	"context"
	"log"
	"mydrive/internal/app/entity"
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

func (r *FileRepository) GetAllFilesByUserID(user_id int) ([]entity.File, error) {
	rows, err := r.DB.Query(context.Background(), "select id, user_id, filename, original_name, size, upload_patch,created_at from files where user_id = $1 order by created_at desc", user_id)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var file []entity.File

	for rows.Next() {
		var f entity.File
		err := rows.Scan(
			&f.ID,
			&f.UserID,
			&f.FileName,
			&f.OriginalName,
			&f.Size,
			&f.UploadPath,
			&f.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		file = append(file, f)
	}

	return file, nil
}

func (r *FileRepository) GetFileById(file_ID int) (*entity.File, error) {
	var file entity.File
	err := r.DB.QueryRow(context.Background(), "select id, user_id, filename, original_name, size, upload_patch,created_at from files where id = $1 ", file_ID).Scan(
		&file.ID,
		&file.UserID,
		&file.FileName,
		&file.OriginalName,
		&file.Size,
		&file.UploadPath,
		&file.CreatedAt,
	)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return &file, nil
}

func (r *FileRepository) DeleteFileByID(file_ID int) error {
	_,err := r.DB.Exec(context.Background(), "delete from files where id = $1", file_ID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}