CREATE TABLE IF NOT EXISTS music_playlists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  member_id TEXT NOT NULL DEFAULT '',
  tracks TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
