CREATE TABLE push_subscriptions (id TEXT PRIMARY KEY, endpoint TEXT NOT NULL, subscription TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE notification_events (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id), kind TEXT NOT NULL CHECK(kind IN ('post','comment')), created_at INTEGER NOT NULL);
CREATE INDEX notification_events_recent ON notification_events(created_at DESC);
