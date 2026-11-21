import { isIncident } from '../assets/model.js';
import { HTTPError, text, pin, random, passwordHash, equal } from './security.js';
const json = data => Response.json(data);
const uuid = value => {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) throw new HTTPError(400, '접수 식별자를 확인해 주세요.');
  return value;
};
function fields(data) {
  const r = data.record || {};
  const record = {
    id: uuid(r.id), manual: true, created: Date.now(), resolvedAt: null, x: 50, y: 50,
    type: text(r.type, 1, 20, '유형'), grade: text(r.grade, 1, 1, '등급'),
    location: text(r.location, 1, 140, '발생 위치'), zone: text(r.zone, 1, 80, '구역'),
    reporter: text(r.reporter, 1, 40, '신고자'), detail: text(r.detail, 5, 1500, '상황 설명'),
    support: text(r.support, 1, 80, '지원 팀'), supportCustom: r.supportCustom === true, approximate: r.approximate === true,
    personnel: r.personnel, requests: text(r.requests || '', 0, 500, '추가 요청'), occurredAt: r.occurredAt,
    coordinates: r.coordinates,
  };
  for (const key of ['area','radiusMeters']) if (r[key] !== undefined) record[key] = r[key];
  if (['osm','manual','estimated','point'].includes(r.areaSource)) record.areaSource = r.areaSource;
  if (!Array.isArray(record.coordinates) || !Number.isSafeInteger(record.personnel) || record.personnel < 1 || !Number.isFinite(record.occurredAt) || !isIncident(record) || JSON.stringify(record).length > 150000)
    throw new HTTPError(400, '신고 내용과 좌표를 확인해 주세요.');
  return record;
}
export async function incidentAPI(request, env, helpers, admin = false) {
  const url = new URL(request.url), path = url.pathname.replace(/^\/admin/, ''), method = request.method;
  if (!/^\/incidents(?:\/[^/]+)?$/.test(path)) return null;
  const { identity, rate, blocked, body, captcha, sourceLog } = helpers;
  const { ip, hash } = await identity(request, env);
  await rate(env, 'incident-read:' + hash, 120, 60);
  if (method === 'GET' && path === '/incidents') {
    const cursor = Number(url.searchParams.get('after') || 0);
    if (!Number.isSafeInteger(cursor) || cursor < 0) throw new HTTPError(400, '조회 위치를 확인해 주세요.');
    const { results } = await env.DB.prepare('SELECT seq,record FROM incidents WHERE seq>? ORDER BY seq LIMIT 201').bind(cursor).all();
    const rows = results.slice(0, 200);
    return json({ incidents: rows.map(r => JSON.parse(r.record)), next: results.length > 200 ? rows.at(-1).seq : null });
  }
  if (!['POST','PATCH'].includes(method)) throw new HTTPError(405, '지원하지 않는 요청입니다.');
  await blocked(env, hash);
  await rate(env, 'incident-write:' + hash, 30, 3600);
  const data = await body(request);
  if (method === 'POST' && path === '/incidents') {
    const record = fields(data), password = pin(data.password);
    if (data.consent !== true) throw new HTTPError(400, '공개 공유 및 운영 안내에 동의해 주세요.');
    await rate(env, 'incident-create:' + hash, 6, 60);
    await captcha(data, env, ip);
    const existing = await env.DB.prepare('SELECT record,owner_hash FROM incidents WHERE id=?').bind(record.id).first();
    if (existing) {
      if (existing.owner_hash !== hash) throw new HTTPError(409, '접수 식별자가 중복되었습니다.');
      return json({ incident: JSON.parse(existing.record) });
    }
    const salt = random(), secret = await passwordHash(password, salt, env.PASSWORD_PEPPER);
    await env.DB.batch([
      env.DB.prepare('INSERT INTO incidents(id,record,owner_hash,pin_salt,pin_hash,updated_at) VALUES (?,?,?,?,?,?)').bind(record.id,JSON.stringify(record),hash,salt,secret,Date.now()),
      await sourceLog(env,record.id,'incident',ip,hash),
    ]);
    return json({ incident: record });
  }
  if (method === 'PATCH' && path.startsWith('/incidents/')) {
    const id = uuid(path.split('/').pop());
    await rate(env,'incident-pin-ip:' + hash,10,900);
    await rate(env,'incident-pin:' + id,5,900);
    const row = await env.DB.prepare('SELECT record,pin_salt,pin_hash FROM incidents WHERE id=?').bind(id).first();
    if (!row) throw new HTTPError(404, '기록을 찾을 수 없습니다.');
    if (!admin && !equal(await passwordHash(pin(data.password),row.pin_salt,env.PASSWORD_PEPPER),row.pin_hash))
      throw new HTTPError(403, '작성 비밀번호가 일치하지 않습니다.');
    if (typeof data.resolved !== 'boolean') throw new HTTPError(400, '처리 상태를 확인해 주세요.');
    const record = JSON.parse(row.record);
    record.resolvedAt = data.resolved ? Date.now() : null;
    await env.DB.prepare('UPDATE incidents SET record=?,updated_at=? WHERE id=?').bind(JSON.stringify(record),Date.now(),id).run();
    return json({ incident: record });
  }
  throw new HTTPError(404, '기록 경로가 없습니다.');
}
