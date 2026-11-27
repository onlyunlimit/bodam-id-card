-- Guestbook notes: per-note text size and owner moderation (read, hide, edit).
ALTER TABLE member_guestbook ADD COLUMN size REAL NOT NULL DEFAULT 14;
ALTER TABLE member_guestbook ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE member_guestbook ADD COLUMN read_at INTEGER;
ALTER TABLE member_guestbook ADD COLUMN updated_at TEXT;
CREATE INDEX IF NOT EXISTS idx_member_guestbook_inbox ON member_guestbook(read_at, created_at);
