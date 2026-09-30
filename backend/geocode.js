import { HTTPError, text } from './security.js';
import { isArea } from '../assets/geo-model.js';
export async function geocode(request, env, { identity, rate }) {
  const url = new URL(request.url);
  if (url.pathname !== '/geocode' || request.method !== 'GET') return null;
  const { hash } = await identity(request, env);
  await rate(env, 'geocode:' + hash, 20, 60);
  const q = url.searchParams.get('q');
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    polygon_geojson: '1',
    polygon_threshold: '0.001',
    'accept-language': 'ko,en',
  });
  let route;
  if (q) {
    params.set('q', text(q, 2, 140, '주소'));
    params.set('limit', '5');
    route = 'search';
  } else {
    const lat = Number(url.searchParams.get('lat')),
      lon = Number(url.searchParams.get('lon'));
    if (
      !url.searchParams.has('lat') ||
      !url.searchParams.has('lon') ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    )
      throw new HTTPError(400, '좌표를 확인해 주세요.');
    params.set('lat', lat.toFixed(5));
    params.set('lon', lon.toFixed(5));
    params.set('zoom', url.searchParams.get('area') === '1' ? '14' : '18');
    route = 'reverse';
  }
  const key = route + '?' + params.toString(),
    now = Date.now();
  const cache = await env.DB.prepare('SELECT data FROM geocode_cache WHERE key=? AND expires>?')
    .bind(key, now)
    .first();
  if (cache) return new Response(cache.data, { headers: { 'Content-Type': 'application/json' } });
  const locked = await env.DB.prepare(
    'UPDATE geocode_lock SET next_at=? WHERE id=1 AND next_at<=? RETURNING id',
  )
    .bind(now + 1200, now)
    .first();
  if (!locked) throw new HTTPError(429, '주소 조회 중입니다. 잠시 후 다시 검색해 주세요.');
  let response;
  try {
    response = await fetch('https://nominatim.openstreetmap.org/' + key, {
      headers: {
        'User-Agent': 'SGIA/1.0 (+https://onlyunlimit.github.io/)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new HTTPError(503, '주소 검색 연결이 지연됩니다. 지도를 직접 지정할 수 있습니다.');
  }
  if (!response.ok)
    throw new HTTPError(503, '주소 검색을 사용할 수 없습니다. 좌표를 직접 지정해 주세요.');
  const raw = await response.json(),
    rows = Array.isArray(raw) ? raw : raw.error ? [] : [raw];
  const results = rows
    .filter((r) => Number.isFinite(+r.lat) && Number.isFinite(+r.lon))
    .slice(0, 5)
    .map((r) => ({
      name: String(r.display_name || r.name || '').slice(0, 140),
      lat: +r.lat,
      lon: +r.lon,
      area: isArea(r.geojson) ? r.geojson : null,
      zone: String(
        r.address?.suburb || r.address?.city || r.address?.county || r.address?.country || '',
      ).slice(0, 80),
    }));
  const data = JSON.stringify({ results, attribution: '© OpenStreetMap contributors' });
  await env.DB.prepare(
    'INSERT INTO geocode_cache(key,data,expires) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,expires=excluded.expires',
  )
    .bind(key, data, now + 7 * 86400000)
    .run();
  return new Response(data, { headers: { 'Content-Type': 'application/json' } });
}
