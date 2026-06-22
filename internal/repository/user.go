package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
    DB *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return  &UserRepository{DB: db}
}

func (r *UserRepository) CreateUser(email, passwordHash string) (int, error){
	var id int

	err := r.DB.QueryRow(context.Background(),"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
        email,
        passwordHash,).Scan(&id)

		return id, err
}

func (r *UserRepository) GetUserByEmail(email string) ( int,  string, error) {

	var id int
	var passwordHash string


	err :=  r.DB.QueryRow(context.Background(), "SELECT id, password_hash FROM users WHERE email = $1", email).Scan(&id, &passwordHash)

	return id, passwordHash, err
}