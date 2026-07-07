CREATE TABLE files (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    filename TEXT NOT NULL,

    original_name TEXT NOT NULL,

    size BIGINT NOT NULL,

    upload_patch VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
