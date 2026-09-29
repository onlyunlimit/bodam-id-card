CREATE TABLE members (
 id TEXT PRIMARY KEY, board TEXT NOT NULL CHECK(board IN ('lucky','obsidus')),
 name TEXT NOT NULL, bio TEXT NOT NULL DEFAULT '', avatar_url TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL
);
ALTER TABLE posts ADD COLUMN member_id TEXT REFERENCES members(id);
ALTER TABLE posts ADD COLUMN pin_length INTEGER NOT NULL DEFAULT 4;
ALTER TABLE comments ADD COLUMN member_id TEXT REFERENCES members(id);
ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id);
ALTER TABLE comments ADD COLUMN pin_length INTEGER NOT NULL DEFAULT 4;
CREATE INDEX posts_member_created ON posts(board,member_id,created_at DESC);
CREATE INDEX comments_member_created ON comments(member_id,created_at DESC);
CREATE INDEX comments_parent ON comments(parent_id);
CREATE TABLE comment_likes (
 comment_id TEXT NOT NULL REFERENCES comments(id), voter TEXT NOT NULL,
 PRIMARY KEY(comment_id,voter)
);
CREATE TABLE images (
 id TEXT PRIMARY KEY, post_id TEXT REFERENCES posts(id), member_id TEXT REFERENCES members(id),
 mime TEXT NOT NULL, data BLOB NOT NULL, created_at INTEGER NOT NULL,
 CHECK ((post_id IS NOT NULL) != (member_id IS NOT NULL))
);
CREATE INDEX images_post ON images(post_id);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('jaein','lucky','재인','팀장 / 원거리 딜러','https://cdn.caveduck.io/cdn-cgi/image/anim=true,dpr=2,f=auto,w=500/charim-1920x/b22dfb0d-817b-407e-9f90-18b4532a06fe?v=60dc4f',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('danjo','lucky','단조','근접 서포터 / 탱커','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/aaf6bab9-c6c8-4dd6-8736-8834b6b3b7d1?v=98f74b',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('unsae','lucky','운새','브루저 / 스트라이커','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/c29b6008-b93d-42cd-b2c6-2a0395682436?v=2235f6',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('yujin','lucky','유진','서브 딜러 / 특수 기술','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/eb6ed7f9-0547-473f-b3d3-ebff85e0fa12?v=153d89',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('chabin','obsidus','차빈','팀장 / 근접 딜러','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/aa0bfb68-ba52-41c4-a30e-4d1fa89b1a6d?v=de06e9',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('hanho','obsidus','한호','원거리 서포터 / 정보조작','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/73a7c2d2-11d7-45c9-bc87-cac25dbea410?v=fd93d0',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('mohyun','obsidus','모현','메인 탱커','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/958a0f49-5695-4b23-bfd9-5ea2e427957e?v=f02e09',0);
INSERT INTO members(id,board,name,bio,avatar_url,updated_at) VALUES ('yuhwan','obsidus','유환','공격 / 수리','https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/23d57970-1056-49d8-a845-c696c94cbb9d?v=c7a772',0);
