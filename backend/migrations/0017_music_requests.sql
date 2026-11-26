CREATE TABLE IF NOT EXISTS music_requests (
 id TEXT PRIMARY KEY,
 character TEXT NOT NULL,
 title TEXT NOT NULL,
 artist TEXT NOT NULL,
 youtube_url TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL,
 read_at INTEGER
);
CREATE INDEX IF NOT EXISTS music_requests_inbox ON music_requests(read_at,created_at DESC);
