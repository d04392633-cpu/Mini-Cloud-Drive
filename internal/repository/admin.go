package repository

import (
	"context"
	"mydrive/internal/app/entity"
)

func (r *FileRepository) GetUsersFilesStats() ([]entity.UserFilesStat, error) {
	rows, err := r.DB.Query(context.Background(), `
		SELECT
			u.id,
			u.email,
			COUNT(f.id) AS files_count,
			COALESCE(SUM(f.size), 0) AS total_size
		FROM users u
		LEFT JOIN files f
			ON u.id = f.user_id
		GROUP BY u.id, u.email
		ORDER BY u.id;
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []entity.UserFilesStat

	for rows.Next() {
		var stat entity.UserFilesStat

		err := rows.Scan(
			&stat.UserID,
			&stat.Email,
			&stat.FilesCount,
			&stat.TotalSize,
		)
		if err != nil {
			return nil, err
		}

		stats = append(stats, stat)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return stats, nil
}