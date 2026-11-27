-- Playlist catalogue: team tab, universe (SGIA before HKU), free character name for HKU, owner hide switch.
ALTER TABLE music_playlists ADD COLUMN team TEXT NOT NULL DEFAULT '';
ALTER TABLE music_playlists ADD COLUMN universe TEXT NOT NULL DEFAULT 'sgia';
ALTER TABLE music_playlists ADD COLUMN character TEXT NOT NULL DEFAULT '';
ALTER TABLE music_playlists ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
