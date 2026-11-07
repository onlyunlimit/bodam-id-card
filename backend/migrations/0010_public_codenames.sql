-- Keep public identities to codenames; preserve unrelated custom names and content.
UPDATE members SET name=substr(name,1,instr(name,' · ')-1)
WHERE id IN ('ibex','slun','bug','poker') AND instr(name,' · ')>0;
UPDATE posts SET author=substr(author,1,instr(author,' · ')-1)
WHERE member_id IN ('ibex','slun','bug','poker') AND instr(author,' · ')>0;
UPDATE comments SET author=substr(author,1,instr(author,' · ')-1)
WHERE member_id IN ('ibex','slun','bug','poker') AND instr(author,' · ')>0;
