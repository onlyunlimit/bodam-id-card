ALTER TABLE posts ADD COLUMN channel TEXT NOT NULL DEFAULT 'free' CHECK(channel IN ('free','soliloquy'));
ALTER TABLE posts ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
CREATE INDEX posts_staff_channel ON posts(board,channel,created_at DESC);
CREATE TABLE geocode_cache (key TEXT PRIMARY KEY, data TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE geocode_lock (id INTEGER PRIMARY KEY CHECK(id=1), next_at INTEGER NOT NULL DEFAULT 0);
INSERT INTO geocode_lock(id,next_at) VALUES(1,0);
