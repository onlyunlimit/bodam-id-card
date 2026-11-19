CREATE TABLE comment_images (
 id TEXT PRIMARY KEY, comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
 mime TEXT NOT NULL, data BLOB NOT NULL, created_at INTEGER NOT NULL, url TEXT
);
CREATE INDEX comment_images_owner ON comment_images(comment_id);
