package repository

import (
	"context"
	"log"
	"mydrive/internal/app/entity"
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

func (r *UserRepository) CreateUser(full_name, email, passwordHash,role string) (int, error) {
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
		`INSERT INTO users (email, password_hash, created_at, full_name)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id`,
		email,
		passwordHash,
		currentTime,
		full_name,
	).Scan(&id)

	if id == 1 {
		_,err:= r.DB.Exec(context.Background(), `UPDATE users SET role = 'admin' WHERE id = $1`, id)
		if err != nil {
			return 0,err
		}
	}

	return id, err
}

func (r *UserRepository) GetUserByEmail(email string) (int, string, string, error) {

	var id int
	var passwordHash string
	var role string

	err := r.DB.QueryRow(context.Background(), `SELECT id, password_hash, role FROM users WHERE email = $1`, email).Scan(&id, &passwordHash, &role)

	return id, passwordHash, role, err
}

func (r *UserRepository) GetInfoUserInformationByID(user_id int) (*entity.User, error) {
	var u entity.User
	err := r.DB.QueryRow(context.Background(), "select id, email, created_at, full_name, role from users where id = $1 ", user_id).Scan(
		&u.ID,
		&u.Email,
		&u.CreatedAt,
		&u.Full_name,
		&u.Role,
	)

	if err != nil {
		log.Printf("error in GetInfoUserInformationByID:%v", err)
		return nil, err
	}

	return &u, nil
}
