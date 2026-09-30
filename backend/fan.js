import { HTTPError, text, board, hmac, random } from './security.js';
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
export const postFields =
  'p.id,p.board,p.title,p.author,p.department,p.body,p.created_at,p.updated_at,p.member_id,p.pin_length,p.channel,p.tags';
export async function attachments(env, postId) {
  return (
    await env.DB.prepare('SELECT id,mime FROM images WHERE post_id=? ORDER BY created_at,id')
      .bind(postId)
      .all()
  ).results;
}
export async function enrichPosts(env, rows) {
  return Promise.all(
    rows.map(async (p) => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
      images: await attachments(env, p.id),
      member: p.member_id
        ? await env.DB.prepare('SELECT id,board,name,bio,avatar_url FROM members WHERE id=?')
            .bind(p.member_id)
            .first()
        : null,
    })),
  );
}
function decodeImage(value) {
  if (typeof value !== 'string' || value.length > 550000)
    throw new HTTPError(400, '이미지 한 장은 400KB 이하여야 합니다.');
  const m = value.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!m) throw new HTTPError(400, 'JPG, PNG, WebP 이미지만 첨부할 수 있습니다.');
  let bytes;
  try {
    bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  } catch {
    throw new HTTPError(400, '이미지 데이터가 올바르지 않습니다.');
  }
  if (bytes.length > 409600 || bytes.length < 12)
    throw new HTTPError(400, '이미지 크기를 확인해 주세요.');
  const sig = [...bytes.slice(0, 12)];
  const valid =
    m[1] === 'jpeg'
      ? sig[0] === 255 && sig[1] === 216 && sig[2] === 255
      : m[1] === 'png'
        ? sig.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
        : String.fromCharCode(...sig.slice(0, 4)) === 'RIFF' &&
          String.fromCharCode(...sig.slice(8, 12)) === 'WEBP';
  if (!valid) throw new HTTPError(400, '파일 내용과 이미지 형식이 일치하지 않습니다.');
  return { mime: 'image/' + m[1], bytes };
}
export async function imageChanges(env, postId, images) {
  if (images === undefined) return [];
  if (!Array.isArray(images) || images.length > 2)
    throw new HTTPError(400, '사진은 두 장까지 첨부할 수 있습니다.');
  const old = await attachments(env, postId),
    keep = [],
    statements = [];
  for (const value of images) {
    if (typeof value === 'object' && value && typeof value.id === 'string') {
      if (!old.some((i) => i.id === value.id) || keep.includes(value.id))
        throw new HTTPError(400, '첨부 이미지 소유권을 확인해 주세요.');
      keep.push(value.id);
    } else if (value && typeof value === 'object' && typeof value.url === 'string') {
      let url;
      try {
        url = new URL(text(value.url, 1, 2000, '이미지 URL'));
      } catch {
        throw new HTTPError(400, '올바른 HTTPS 이미지 주소를 입력해 주세요.');
      }
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new HTTPError(400, 'HTTPS 이미지 주소만 사용할 수 있습니다.');
      statements.push(
        env.DB.prepare(
          'INSERT INTO images(id,post_id,mime,data,created_at,url) VALUES (?,?,?,zeroblob(0),?,?)',
        ).bind(
          crypto.randomUUID(),
          postId,
          'text/uri-list',
          Date.now(),
          url.href,
        ),
      );
    } else {
      const { mime, bytes } = decodeImage(value),
        id = crypto.randomUUID();
      statements.push(
        env.DB.prepare(
          'INSERT INTO images(id,post_id,mime,data,created_at) VALUES (?,?,?,?,?)',
        ).bind(id, postId, mime, bytes.buffer, Date.now()),
      );
    }
  }
  for (const i of old)
    if (!keep.includes(i.id))
      statements.push(
        env.DB.prepare('DELETE FROM images WHERE id=? AND post_id=?').bind(i.id, postId),
      );
  return statements;
}
export async function parentComment(env, postId, parentId) {
  if (!parentId) return null;
  const p = await env.DB.prepare(
    'SELECT id,parent_id FROM comments WHERE id=? AND post_id=? AND hidden=0 AND deleted_at IS NULL',
  )
    .bind(text(parentId, 36, 36, '답글 대상'), postId)
    .first();
  if (!p) throw new HTTPError(404, '답글 대상이 없거나 숨김 처리되었습니다.');
  // All replies are one level below their root comment.
  if (
    p.parent_id &&
    !(await env.DB.prepare(
      'SELECT id FROM comments WHERE id=? AND post_id=? AND hidden=0 AND deleted_at IS NULL',
    )
      .bind(p.parent_id, postId)
      .first())
  )
    throw new HTTPError(404, '답글 대상이 없거나 숨김 처리되었습니다.');
  return p.parent_id || p.id;
}
export async function publicFan(request, env, { identity, rate, blocked, body }) {
  const u = new URL(request.url),
    path = u.pathname,
    method = request.method;
  if (path === '/members' && method === 'GET') {
    const b = board(u.searchParams.get('board'));
    return json({
      members: (
        await env.DB.prepare(
          'SELECT id,board,name,bio,avatar_url,updated_at FROM members WHERE board=? ORDER BY rowid',
        )
          .bind(b)
          .all()
      ).results,
    });
  }
  const media = path.match(/^\/media\/([a-f0-9-]{36})$/);
  if (media && method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT i.mime,i.data,i.url FROM images i LEFT JOIN posts p ON p.id=i.post_id WHERE i.id=? AND (i.member_id IS NOT NULL OR (p.hidden=0 AND p.deleted_at IS NULL))',
    )
      .bind(media[1])
      .first();
    if (!row) throw new HTTPError(404, '이미지를 찾을 수 없습니다.');
    if (row.url) return new Response(null, { status: 302, headers: { Location: row.url } });
    return new Response(row.data, {
      headers: {
        'Content-Type': row.mime,
        'Content-Disposition': 'inline',
        'Content-Security-Policy': "default-src 'none'",
      },
    });
  }
  if (path === '/artist-comments' && method === 'GET') {
    const { hash } = await identity(request, env);
    await rate(env, 'read:' + hash, 120, 60);
    const b = board(u.searchParams.get('board')),
      offset = Math.max(0, Math.min(100000, Number(u.searchParams.get('offset')) || 0));
    const { results } = await env.DB.prepare(
      `SELECT c.id,c.post_id,c.parent_id,c.body,c.created_at,c.member_id,m.name,m.avatar_url,p.title,(SELECT COUNT(*) FROM comment_likes l WHERE l.comment_id=c.id) AS likes FROM comments c JOIN posts p ON p.id=c.post_id JOIN members m ON m.id=c.member_id WHERE p.board=? AND p.hidden=0 AND p.deleted_at IS NULL AND c.hidden=0 AND c.deleted_at IS NULL AND (c.parent_id IS NULL OR EXISTS(SELECT 1 FROM comments root WHERE root.id=c.parent_id AND root.hidden=0 AND root.deleted_at IS NULL)) ORDER BY c.created_at DESC,c.id DESC LIMIT 21 OFFSET ?`,
    )
      .bind(b, offset)
      .all();
    return json({ comments: results.slice(0, 20), more: results.length > 20 });
  }
  const like = path.match(/^\/comments\/([a-f0-9-]{36})\/like$/);
  if (like && method === 'POST') {
    const { ip, hash } = await identity(request, env);
    await blocked(env, hash);
    await rate(env, 'like:' + hash, 30, 60);
    const data = await body(request);
    if (typeof data.liked !== 'boolean') throw new HTTPError(400, '좋아요 상태를 확인해 주세요.');
    const c = await env.DB.prepare(
      'SELECT c.id FROM comments c JOIN posts p ON p.id=c.post_id WHERE c.id=? AND c.hidden=0 AND c.deleted_at IS NULL AND p.hidden=0 AND p.deleted_at IS NULL AND (c.parent_id IS NULL OR EXISTS(SELECT 1 FROM comments root WHERE root.id=c.parent_id AND root.hidden=0 AND root.deleted_at IS NULL))',
    )
      .bind(like[1])
      .first();
    if (!c) throw new HTTPError(404, '댓글이 없습니다.');
    const voter = await hmac(env.IP_KEY, 'comment-like:' + c.id + ':' + ip);
    if (data.liked)
      await env.DB.prepare('INSERT OR IGNORE INTO comment_likes(comment_id,voter) VALUES (?,?)')
        .bind(c.id, voter)
        .run();
    else
      await env.DB.prepare('DELETE FROM comment_likes WHERE comment_id=? AND voter=?')
        .bind(c.id, voter)
        .run();
    return json({
      liked: data.liked,
      likes: (
        await env.DB.prepare('SELECT COUNT(*) n FROM comment_likes WHERE comment_id=?')
          .bind(c.id)
          .first()
      ).n,
    });
  }
  return null;
}
export async function adminFan(request, env, { body, identity, sourceLog }) {
  const url = new URL(request.url),
    path = url.pathname,
    method = request.method;
  const media = path.match(/^\/admin\/media\/([a-f0-9-]{36})$/);
  if (media && method === 'GET') {
    const row = await env.DB.prepare('SELECT mime,data,url FROM images WHERE id=?')
      .bind(media[1])
      .first();
    if (!row) throw new HTTPError(404, '이미지를 찾을 수 없습니다.');
    if (row.url) return new Response(null, { status: 302, headers: { Location: row.url } });
    return new Response(row.data, {
      headers: { 'Content-Type': row.mime, 'Content-Security-Policy': "default-src 'none'" },
    });
  }
  if (path === '/admin/members' && method === 'GET')
    return json({
      members: (await env.DB.prepare('SELECT * FROM members ORDER BY board,rowid').all()).results,
    });
  const memberPath = path.match(/^\/admin\/members\/([a-z0-9_-]+)$/);
  if (memberPath && method === 'PATCH') {
    const data = await body(request),
      id = memberPath[1];
    const m = await env.DB.prepare('SELECT id FROM members WHERE id=?').bind(id).first();
    if (!m) throw new HTTPError(404, '멤버를 찾을 수 없습니다.');
    let avatar = text(data.avatar_url || '', 0, 2000, '프로필 사진');
    if (avatar && !/^https:\/\//.test(avatar) && !/^\/media\/[a-f0-9-]{36}$/.test(avatar))
      throw new HTTPError(400, '프로필 사진은 HTTPS 이미지 주소를 사용해 주세요.');
    if (
      avatar.startsWith('/media/') &&
      !(await env.DB.prepare('SELECT id FROM images WHERE id=? AND member_id=?')
        .bind(avatar.split('/').pop(), id)
        .first())
    )
      throw new HTTPError(400, '프로필 이미지 소유권을 확인해 주세요.');
    const changes = [];
    if (data.image) {
      const image = decodeImage(data.image),
        imageId = crypto.randomUUID();
      avatar = '/media/' + imageId;
      changes.push(
        env.DB.prepare(
          'INSERT INTO images(id,member_id,mime,data,created_at) VALUES (?,?,?,?,?)',
        ).bind(imageId, id, image.mime, image.bytes.buffer, Date.now()),
      );
    }
    changes.push(
      env.DB.prepare('UPDATE members SET name=?,bio=?,avatar_url=?,updated_at=? WHERE id=?').bind(
        text(data.name, 1, 24, '멤버 이름'),
        text(data.bio || '', 0, 500, '소개'),
        avatar,
        Date.now(),
        id,
      ),
    );
    changes.push(
      env.DB.prepare('DELETE FROM images WHERE member_id=? AND id<>?').bind(
        id,
        avatar.split('/').pop() || '',
      ),
    );
    changes.push(
      env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(
        random(),
        'PROFILE_UPDATE',
        id,
        Date.now(),
      ),
    );
    await env.DB.batch(changes);
    return json({ ok: true });
  }
  if ((path === '/admin/publish' || path === '/admin/reply') && method === 'POST') {
    const data = await body(request),
      m = await env.DB.prepare('SELECT id,board,name FROM members WHERE id=?')
        .bind(text(data.member_id, 1, 80, '멤버'))
        .first();
    if (!m) throw new HTTPError(400, '멤버를 선택해 주세요.');
    const id = crypto.randomUUID(),
      time = Date.now(),
      changes = [];
    if (path === '/admin/publish') {
      changes.push(
        env.DB.prepare(
          "INSERT INTO posts(id,board,title,author,body,salt,password_hash,created_at,member_id,pin_length) VALUES (?,?,?,?,?,'','',?,?,6)",
        ).bind(
          id,
          m.board,
          text(data.title, 1, 100, '제목'),
          m.name,
          text(data.body, 1, 5000, '내용'),
          time,
          m.id,
        ),
      );
      changes.push(...(await imageChanges(env, id, data.images)));
    } else {
      const post = await env.DB.prepare(
        'SELECT id,board FROM posts WHERE id=? AND hidden=0 AND deleted_at IS NULL',
      )
        .bind(data.post_id)
        .first();
      if (!post || post.board !== m.board)
        throw new HTTPError(400, '같은 그룹의 게시물에만 답글을 남길 수 있습니다.');
      const parent = await parentComment(env, post.id, data.parent_id);
      const count = await env.DB.prepare(
        'SELECT COUNT(*) n FROM comments WHERE post_id=? AND deleted_at IS NULL',
      )
        .bind(post.id)
        .first();
      if (count.n >= 100) throw new HTTPError(409, '댓글은 100개까지 등록됩니다.');
      changes.push(
        env.DB.prepare(
          "INSERT INTO comments(id,post_id,author,body,salt,password_hash,created_at,member_id,parent_id,pin_length) VALUES (?,?,?,?,'','',?,?,?,6)",
        ).bind(id, post.id, m.name, text(data.body, 1, 1000, '내용'), time, m.id, parent),
      );
    }
    const { ip, hash } = await identity(request, env);
    changes.push(
      await sourceLog(env, id, path === '/admin/publish' ? 'post' : 'comment', ip, hash),
    );
    changes.push(
      env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(
        random(),
        'ARTIST_PUBLISH',
        id,
        time,
      ),
    );
    await env.DB.batch(changes);
    return json({ id }, 201);
  }
  const edit = path.match(/^\/admin\/(posts|comments)\/([a-f0-9-]{36})$/);
  if (edit && method === 'PATCH') {
    const data = await body(request),
      table = edit[1],
      id = edit[2],
      row = await env.DB.prepare(`SELECT id FROM ${table} WHERE id=? AND deleted_at IS NULL`)
        .bind(id)
        .first();
    if (!row) throw new HTTPError(404, '기록이 없습니다.');
    const changes = [
      table === 'posts'
        ? env.DB.prepare('UPDATE posts SET title=?,body=?,updated_at=? WHERE id=?').bind(
            text(data.title, 1, 100, '제목'),
            text(data.body, 1, 5000, '내용'),
            Date.now(),
            id,
          )
        : env.DB.prepare('UPDATE comments SET body=?,updated_at=? WHERE id=?').bind(
            text(data.body, 1, 1000, '내용'),
            Date.now(),
            id,
          ),
    ];
    if (table === 'posts') changes.push(...(await imageChanges(env, id, data.images)));
    changes.push(
      env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(
        random(),
        'ADMIN_EDIT',
        id,
        Date.now(),
      ),
    );
    await env.DB.batch(changes);
    return json({ ok: true });
  }
  return null;
}
