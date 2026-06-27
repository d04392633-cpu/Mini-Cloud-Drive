package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	DB *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) userExists(email string) (bool, error) {
	var exists bool

	err := r.DB.QueryRow(
		context.Background(),
		`SELECT EXISTS(
			SELECT 1
			FROM users
			WHERE email = $1
		)`,
		email,
	).Scan(&exists)

	return exists, err
}

func (r *UserRepository) CreateUser(email, passwordHash string) (int, error) {
	var id int

	exists, err := r.userExists(email)
	if err != nil {
		return 0, err
	}

	if exists {
		return 0, nil
	}

	currentTime := time.Now()

	err = r.DB.QueryRow(
		context.Background(),
		`INSERT INTO users (email, password_hash, created_at)
		 VALUES ($1, $2, $3)
		 RETURNING id`,
		email,
		passwordHash,
		currentTime,
	).Scan(&id)

	return id, err
}

func (r *UserRepository) GetUserByEmail(email string) (int, string, error) {

	var id int
	var passwordHash string

	err := r.DB.QueryRow(context.Background(), "SELECT id, password_hash FROM users WHERE email = $1", email).Scan(&id, &passwordHash)

	return id, passwordHash, err
}
