import { isIncident } from '../assets/model.js';
import { HTTPError, text, pin, random, passwordHash, equal, digest } from './security.js';
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
    const { results } = await env.DB.prepare("SELECT seq,record FROM incidents WHERE seq>? AND json_extract(record,'$.deleted') IS NOT 1 ORDER BY seq LIMIT 201").bind(cursor).all();
    const rows = results.slice(0, 200);
    return json({ incidents: rows.map(r => JSON.parse(r.record)), next: results.length > 200 ? rows.at(-1).seq : null });
  }
  if (!['POST','PATCH','DELETE'].includes(method)) throw new HTTPError(405, '지원하지 않는 요청입니다.');
  await blocked(env, hash);
  await rate(env, 'incident-write:' + hash, 30, 3600);
  const data = method === 'DELETE' ? {} : await body(request);
  if (admin && method === 'POST' && path === '/incidents/bulk') {
    if(!Array.isArray(data.ids)||!data.ids.length||data.ids.length>100||!['delete','resolve','reopen'].includes(data.action))throw new HTTPError(400,'100건 이하의 기록과 처리 종류를 선택해 주세요.');
    const ids=[...new Set(data.ids.map(uuid))],time=Date.now();
    const rows=(await env.DB.prepare(`SELECT id FROM incidents WHERE id IN (${ids.map(()=>'?').join(',')}) AND json_extract(record,'$.deleted') IS NOT 1`).bind(...ids).all()).results;
    if(rows.length!==ids.length)throw new HTTPError(409,'변경되거나 삭제된 기록이 있습니다. 목록을 새로고침한 뒤 다시 선택해 주세요.');
    const statements=[];
    for(let offset=0;offset<ids.length;offset+=40) {
      const group=ids.slice(offset,offset+40),where=`id IN (${group.map(()=>'?').join(',')}) AND json_extract(record,'$.deleted') IS NOT 1`;
      statements.push(data.action==='delete'
        ?env.DB.prepare(`UPDATE incidents SET record=json_object('id',id,'deleted',json('true')),updated_at=? WHERE ${where}`).bind(time,...group)
        :env.DB.prepare(`UPDATE incidents SET record=json_set(record,'$.resolvedAt',?,'$.editorial',json('true')),updated_at=? WHERE ${where}`).bind(data.action==='resolve'?time:null,time,...group));
    }
    statements.push(env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(random(),'INCIDENT_BULK_'+data.action.toUpperCase(),JSON.stringify(ids),time));
    await env.DB.batch(statements);
    return json({ok:true,count:ids.length});
  }
  if (method === 'POST' && path === '/incidents/import' && !admin) {
    if (!Array.isArray(data.records) || !data.records.length || data.records.length > 25) throw new HTTPError(400, '이전 기록 묶음을 확인해 주세요.');
    const accepted = [], commands = [];
    for (const original of data.records) {
      const record = {};
      for (const key of ['id','manual','created','resolvedAt','x','y','type','grade','location','zone','reporter','detail','support','supportCustom','approximate','personnel','requests','occurredAt','coordinates','area','radiusMeters','areaSource'])
        if (original && Object.hasOwn(original,key)) record[key] = original[key];
      if (!isIncident(record) || JSON.stringify(record).length > 150000 || record.created > Date.now()+86400000) throw new HTTPError(400, '이전 기록 형식을 확인해 주세요.');
      const oldId = record.id, key = (await digest('sgia-legacy:'+oldId+':'+record.created)).slice(0,32);
      record.id = key.slice(0,8)+'-'+key.slice(8,12)+'-'+key.slice(12,16)+'-'+key.slice(16,20)+'-'+key.slice(20);
      record.managed = true;
      commands.push(env.DB.prepare('INSERT OR IGNORE INTO incidents(id,record,owner_hash,pin_salt,pin_hash,updated_at) VALUES (?,?,?,?,?,?)').bind(record.id,JSON.stringify(record),hash,'','',Date.now()));
      accepted.push({oldId,id:record.id});
    }
    await env.DB.batch(commands);
    return json({accepted});
  }
  if (admin && ['PATCH','DELETE'].includes(method) && path.startsWith('/incidents/')) {
    const id = uuid(path.split('/').pop());
    const row = await env.DB.prepare('SELECT record FROM incidents WHERE id=?').bind(id).first();
    if (!row || JSON.parse(row.record).deleted) throw new HTTPError(404, '기록을 찾을 수 없습니다.');
    let record = JSON.parse(row.record);
    if (method === 'DELETE') record = {id,deleted:true};
    else {
      for (const [key,min,max] of [['zone',1,80],['location',1,140],['detail',5,1500],['reporter',0,40]]) {
        if (Object.hasOwn(data,key)) record[key] = text(data[key],min,max,key);
      }
      if (Object.hasOwn(data,'grade')) { if (!['A','B','C','D'].includes(data.grade)) throw new HTTPError(400,'등급을 확인해 주세요.'); record.grade=data.grade; }
      if (Object.hasOwn(data,'resolved')) { if(typeof data.resolved !== 'boolean') throw new HTTPError(400,'처리 상태를 확인해 주세요.'); record.resolvedAt=data.resolved ? (record.resolvedAt || Date.now()) : null; }
      // Automatic records can receive editorial text without inventing a reporter/team.
      record.editorial = true;
    }
    await env.DB.batch([
      env.DB.prepare('UPDATE incidents SET record=?,updated_at=? WHERE id=?').bind(JSON.stringify(record),Date.now(),id),
      env.DB.prepare('INSERT INTO audit(id,action,target,created_at) VALUES (?,?,?,?)').bind(random(),method==='DELETE'?'INCIDENT_DELETE':'INCIDENT_EDIT',id,Date.now()),
    ]);
    return json({ok:true,incident:method==='DELETE'?null:record});
  }

  if (method === 'POST' && path === '/incidents') {
    const record = fields(data), password = pin(data.password);
    if (data.consent !== true) throw new HTTPError(400, '공개 공유 및 운영 안내에 동의해 주세요.');
    await rate(env, 'incident-create:' + hash, 6, 60);
    await captcha(data, env, ip);
    const existing = await env.DB.prepare('SELECT record,owner_hash FROM incidents WHERE id=?').bind(record.id).first();
    if (existing) {
      if (JSON.parse(existing.record).deleted) throw new HTTPError(410, '삭제된 기록입니다.');
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
    if (!row || JSON.parse(row.record).deleted) throw new HTTPError(404, '기록을 찾을 수 없습니다.');
    if (JSON.parse(row.record).managed) throw new HTTPError(403, '이전 기록은 관리자 화면에서 관리합니다.');
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
