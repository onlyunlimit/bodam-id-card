CREATE TABLE posts (
 id TEXT PRIMARY KEY, board TEXT NOT NULL CHECK(board IN ('lucky','obsidus','staff')),
 title TEXT NOT NULL, author TEXT NOT NULL, department TEXT NOT NULL DEFAULT '', body TEXT NOT NULL,
 salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER,
 deleted_at INTEGER, hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX posts_board_created ON posts(board,created_at DESC);
CREATE TABLE comments (
 id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id), author TEXT NOT NULL, body TEXT NOT NULL,
 salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER,
 deleted_at INTEGER, hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX comments_post_created ON comments(post_id,created_at);
CREATE TABLE access_logs (id TEXT PRIMARY KEY, kind TEXT NOT NULL, ip_cipher TEXT, ip_hash TEXT, created_at INTEGER NOT NULL);
CREATE INDEX access_logs_created ON access_logs(created_at);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX rate_limits_expiry ON rate_limits(expires);
CREATE TABLE sessions (hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE audit (id TEXT PRIMARY KEY, action TEXT NOT NULL, target TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE blocks (ip_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE visitor_keys (key TEXT PRIMARY KEY, day TEXT NOT NULL);
CREATE INDEX visitor_keys_day ON visitor_keys(day);
CREATE TABLE visitor_totals (day TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0);
INSERT INTO counters(name,value) VALUES ('visitors',0);
