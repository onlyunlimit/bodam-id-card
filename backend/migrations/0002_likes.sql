CREATE TABLE post_likes (
 post_id TEXT NOT NULL REFERENCES posts(id), voter TEXT NOT NULL,
 PRIMARY KEY(post_id,voter)
);
