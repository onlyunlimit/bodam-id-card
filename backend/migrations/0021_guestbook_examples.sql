-- The three example notes on Zion's personnel file used to live in the page code.
-- They become ordinary guestbook rows so the owner can edit, hide or delete them.
-- Already read (no notification); no writer IP. Ink colours replace the old chalk colours.
INSERT OR IGNORE INTO member_guestbook (id,character,author,message,font,color,x,y,size,created_at,ip_hash,read_at) VALUES
 ('5f0c2b0e-1a51-4c3e-9a10-6a2d00000001','jion','실드 팀원 A','오늘도 훈련장 벽 한 면 다 부숴먹고 시치미 떼는 중... 수리비 청구서 또 올라옵니다.','hand','#1F2430',0.08,0.1,14,'2026-11-27T00:00:01.000Z','',1764201601000),
 ('5f0c2b0e-1a51-4c3e-9a10-6a2d00000002','jion','전담 가이드','가이딩 받을 때 귀 끝까지 빨개지면서 괜히 화내는 거 다 티 나요, 지온 씨.','serif','#9E1B24',0.42,0.42,14,'2026-11-27T00:00:02.000Z','',1764201602000),
 ('5f0c2b0e-1a51-4c3e-9a10-6a2d00000003','jion','SGIA 기록관','LEVEL A+ ARCHIVE ACCESS VERIFIED. 현장 복귀 전 셔츠 단추 정돈 요망.','mono','#1E3A8A',0.12,0.78,14,'2026-11-27T00:00:03.000Z','',1764201603000);
