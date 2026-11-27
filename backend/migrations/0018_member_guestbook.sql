CREATE TABLE IF NOT EXISTS member_guestbook (
  id TEXT PRIMARY KEY,
  character TEXT NOT NULL,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  font TEXT NOT NULL,
  color TEXT NOT NULL,
  x REAL NOT NULL DEFAULT 0.5,
  y REAL NOT NULL DEFAULT 0.5,
  created_at TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_member_guestbook_character ON member_guestbook(character, created_at);
