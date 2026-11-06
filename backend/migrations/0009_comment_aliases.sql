-- Per-post IP HMAC only; aliases survive comment deletion and timestamp edits.
CREATE TABLE comment_aliases (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter TEXT NOT NULL,
  ordinal INTEGER NOT NULL CHECK (ordinal > 0),
  PRIMARY KEY (post_id, voter),
  UNIQUE (post_id, ordinal)
);
