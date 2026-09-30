-- Store external image references without downloading third-party content on the server.
ALTER TABLE images ADD COLUMN url TEXT;
