-- Withdraw only the untouched seed created by 0007. Never remove authored content.
DELETE FROM members
WHERE id='joker' AND updated_at=0
AND NOT EXISTS (SELECT 1 FROM posts WHERE member_id='joker')
AND NOT EXISTS (SELECT 1 FROM comments WHERE member_id='joker')
AND NOT EXISTS (SELECT 1 FROM images WHERE member_id='joker');
