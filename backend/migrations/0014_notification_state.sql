ALTER TABLE notification_events ADD COLUMN read_at INTEGER;
CREATE INDEX notification_events_unread ON notification_events(read_at,created_at DESC);
ALTER TABLE push_subscriptions ADD COLUMN last_attempt_at INTEGER;
ALTER TABLE push_subscriptions ADD COLUMN last_status INTEGER;
ALTER TABLE push_subscriptions ADD COLUMN last_error TEXT;
