import { evidenceIndex, mountEvidenceIndex } from './evidence.js';
import { registerCopy } from './i18n.js';
[
  ['현장 위치', 'Incident locations', '現場位置', '现场位置'],
  ['위도', 'Latitude', '緯度', '纬度'],
  ['경도', 'Longitude', '経度', '经度'],
  ['좌표 적용', 'Apply coordinates', '座標を適用', '应用坐标'],
  [
    '지도를 눌러 발생 위치를 지정하세요.',
    'Click the map to mark the incident location.',
    '地図を押して発生位置を指定してください。',
    '点击地图标记发生位置。',
  ],
].forEach((row) => registerCopy(...row));
import { sealedArchive, mountReceiver, interceptTerminal } from './hardware.js';
import { openTransmission, requestTransmission } from './transmissions.js';
import { emergencyAlert, openIncident } from './incident-ui.js';
import { listen, every, delay, onDispose, routeSignal } from './lifecycle.js';
import { $, $$, state, esc, heading, modal, login, toast, read, save } from './runtime.js';
import { generateIncident, isIncident, tally, koreaTime, incidentTypes } from './model.js';
import { units, statusMarkup, status, renderCards } from './units.js';
import { characters } from './characters.js';
const previous =
  read('incidents', null) ||
  (() => {
    try {
      return JSON.parse(localStorage.getItem('onlyunlimit.sgia.incidents.v1'));
    } catch {
      return null;
    }
  })();
export let incidents =
  Array.isArray(previous) && previous.length <= 100 && previous.every(isIncident)
    ? previous
    : Array.from({ length: 15 }, (_, i) =>
        generateIncident(i, Math.random, Date.now() - (15 - i) * 180000),
      );
const locations = {
  '성수동 폐공장': [37.5445, 127.0557],
  '강남 지하 연결로': [37.498, 127.0276],
  '용산 철도 구역': [37.5298, 126.9648],
  '마포 한강변': [37.545, 126.935],
  '종로 상업 지구': [37.572, 126.986],
  '서초 연구 시설': [37.483, 127.013],
  '송파 물류 구역': [37.505, 127.115],
  '은평 산림 경계': [37.623, 126.929],
};
export function createMap(element, signals = incidents) {
  if (!window.L) {
    element.textContent = '지도 모듈 연결 대기';
    return null;
  }
  const map = L.map(element, {
    scrollWheelZoom: false,
    zoomAnimation: false,
    fadeAnimation: state.motion,
    zoomControl: true,
    attributionControl: true,
  }).setView([37.553, 127.005], 11);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    minZoom: 10,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);
  let failed = 0;
  tiles.on('tileerror', () => {
    if (++failed === 3) toast('지도 배경 연결 대기 중입니다. 관측 신호는 계속 표시됩니다.');
  });
  const layer = L.layerGroup().addTo(map);
  map.syncSignals = (items) => {
    layer.clearLayers();
    for (const s of items.filter((x) => !x.resolvedAt)) {
      const pos = s.coordinates || locations[s.location] || [37.55, 127.0];
      const risk = {
        A: ['#c93d4e', 1700],
        B: ['#d99b64', 1050],
        C: ['#c8b97a', 600],
        D: ['#56d3dc', 280],
      }[s.grade];
      L.circle(pos, { radius: risk[1], color: risk[0], weight: 1, fillOpacity: 0.12 }).addTo(layer);
      const marker = L.marker(pos, {
        icon: L.divIcon({
          className: 'incident-pin',
          html: `<span style="--pin-color:${risk[0]}" data-map-incident="${esc(s.id)}"><i></i><b>${esc(s.grade)}</b></span>`,
          iconSize: [30, 38],
          iconAnchor: [15, 34],
        }),
      }).addTo(layer);
      marker.bindPopup(
        `<div class="map-detection"><small>TARGET VERIFIED / ${esc(s.id)}</small><b>${esc(s.type)} · ${esc(s.grade)}</b><span>${esc(s.location)}</span><p>${esc(s.detail)}</p><code>${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}</code></div>`,
      );
    }
  };
  map.syncSignals(signals);
  let released = false;
  const release = () => {
    if (!released) {
      released = true;
      map.remove();
    }
  };
  map.refreshSize = () => {
    if (!released && element.isConnected) map.invalidateSize();
  };
  const unregister = onDispose(release);
  map.release = () => {
    unregister();
    release();
  };
  return map;
}
function gauge(value, max, label) {
  return `<div class="ring-gauge" style="--value:${max ? (value / max) * 100 : 0}"><span><strong>${String(value).padStart(2, '0')}</strong><small>${label}</small></span></div>`;
}
export function renderOverview() {
  const t = tally(incidents),
    active = units.filter((x) => status(x.id).active).length;
  $('#main').innerHTML =
    heading(
      'CENTRAL OPERATIONS / SEOUL',
      '통합 관제 현황',
      '국가 각성자 통합관리청 · 서울권 운영 정보',
    ) +
    `<section class="control-grid"><div class="map-panel panel"><div class="section-title"><div><span class="eyebrow">SEOUL SURVEILLANCE</span><h2>게이트 관측망</h2></div><span class="badge">LIVE SIGNAL</span></div><div class="map-wrap"><div id="seoul-map" class="seoul-map" aria-label="서울권 위험 분포"></div><div class="map-target" id="map-target"><i></i><span>CURSOR TRACK</span></div><div class="map-coordinate">SEOUL / <span id="cursor-coordinate">37.5530, 127.0050</span></div></div><div class="map-legend"><span><i class="legend-dot" style="background:#ec4f64"></i>A / CRITICAL</span><span><i class="legend-dot" style="background:#eea455"></i>B / HIGH</span><span><i class="legend-dot" style="background:#d3bc62"></i>C / WATCH</span><span><i class="legend-dot green"></i>D / LOW</span><button id="map-reset" class="subtle">서울권 재정렬 ↻</button></div></div><aside class="control-sidebar"><section class="readout panel"><div class="readout-label"><h2>관측 중인 게이트</h2><a href="records.html">기록 ↗</a></div><div class="readout-body">${gauge(t.gates, Math.max(t.open, 1), 'GATES')}<div class="grade-chart">${[
      'A',
      'B',
      'C',
      'D',
    ]
      .map((g) => {
        const n = incidents.filter(
          (i) => i.type === '게이트' && !i.resolvedAt && i.grade === g,
        ).length;
        return `<div><span>${g}</span><i style="--bar:${Math.max(0, (n / Math.max(t.gates, 1)) * 100)}%"></i><b>${n}</b></div>`;
      })
      .join(
        '',
      )}</div></div><small>등급별 미해결 게이트 분포</small></section><section class="readout panel"><div class="readout-label"><h2>부서 운용 현황</h2><span class="count-readout" id="active-count">${active}<small> / 3</small></span></div><div class="unit-lights">${units.map((u) => `<a href="${u.id}.html"><b>${u.en}</b>${statusMarkup(u.id)}</a>`).join('')}</div></section></aside></section><div class="environment-grid"><section class="weather-panel panel"><div class="section-title"><div><span class="eyebrow">SEOUL METEOROLOGICAL SERVICE</span><h2>서울 기상 관측</h2></div><span id="weather-status" class="muted">기상 수신 중</span></div><div class="weather-reading"><svg viewBox="0 0 100 80" class="weather-illustration" aria-hidden="true"><circle cx="35" cy="30" r="18" fill="#efc37d"/><path d="M20 65C0 60 12 40 27 44C32 17 69 21 74 44C96 37 106 69 80 68H25" fill="#a7c0df"/><path d="M22 75h52" stroke="#799bcc" stroke-width="2"/></svg><strong id="weather-temp">—<small>°C</small></strong><div><b id="weather-condition">기상 연결 대기</b><p id="weather-extra">서울 / 현재 관측</p></div></div><div id="weather-chart" class="weather-chart"><span>시간별 기온 자료 수신 대기</span></div><a class="credit" href="https://open-meteo.com/" target="_blank" rel="noopener">Weather by Open-Meteo ↗</a></section><section class="clock-panel panel"><div><span class="eyebrow">HEADQUARTERS STANDARD TIME</span><h2>본부 표준 시각</h2><time id="hq-clock"></time><p id="hq-date"></p><small>SEOUL, KR / UTC +09:00</small></div><div class="analog-clock"><span class="hour-hand"></span><span class="minute-hand"></span><span class="second-hand"></span><i></i><b>SGIA</b></div></section></div><section class="panel bulletin-panel"><div class="section-title"><div><p class="eyebrow">INCOMING / AGENCY BULLETIN</p><h2>관제 브리핑</h2></div><button class="subtle" id="brief-refresh">새 연락 수신 ↻</button></div><div id="brief-feed" class="brief-feed" aria-live="polite"></div></section><div class="service-links" id="resources"><a href="sgia.html"><span>PERSONNEL REGISTRATION</span><b>각성자 등록증 ↗</b></a><a href="monster.html"><span>ENTITY RECORD</span><b>괴물 관리 기록 ↗</b></a><a href="team.html"><span>UNIT REGISTRATION</span><b>팀 프로필 ↗</b></a></div>`;
  const map = createMap($('#seoul-map'));
  $('#map-reset').onclick = () => map?.setView([37.553, 127.005], 11, { animate: state.motion });
  listen(document, 'sgia:cursor', (e) => {
    const { x, y } = e.detail,
      t = $('#map-target');
    t.style.left = `${x * 100}%`;
    t.style.top = `${y * 100}%`;
    if (map) {
      const size = map.getSize(),
        p = map.containerPointToLatLng([x * size.x, y * size.y]);
      $('#cursor-coordinate').textContent = p.lat.toFixed(4) + ', ' + p.lng.toFixed(4);
    }
  });
  const clock = () => {
    const k = koreaTime(),
      [h, m, s] = k.clock.split(':').map(Number);
    $('#hq-clock').textContent = k.clock;
    $('#hq-date').textContent = k.date;
    $('.hour-hand').style.rotate = `${(h % 12) * 30 + m / 2}deg`;
    $('.minute-hand').style.rotate = `${m * 6 + s / 10}deg`;
    $('.second-hand').style.rotate = `${s * 6}deg`;
  };
  clock();
  listen(document, 'sgia:clock', clock);
  weather();
  const bulletins = [
    ['중앙 통제 본부', '한강권 잔류 파장 관측을 유지합니다. 통제선 내 접근 제한을 확인하십시오.'],
    ['민원·등록실', '미각성자 정기 검사는 매년 6월 시행됩니다. 등록 안내서를 확인하십시오.'],
    [
      '비콘 상황실',
      '미등록 각성자 접촉 전 신원 대조를 완료하십시오. 민원 기록은 별도 제출 바랍니다.',
    ],
    ['실드 상황실', '보호 개체의 사회 적응 교육 결과를 갱신했습니다. 담당 요원 열람 바랍니다.'],
    [
      '게이트 연구소',
      '현장 장비에서 수집된 잔류 파장 분석 중입니다. 이상 신호는 별도 분류하십시오.',
    ],
  ];
  let seq = 0;
  const receive = () => {
    const b = bulletins[seq++ % bulletins.length],
      el = document.createElement('button');
    el.className = 'bulletin incoming';
    el.innerHTML = `<span class="transmission-icon">↘</span><div><small>${b[0]} <time>${koreaTime().clock}</time></small><p>${b[1]}</p></div><span class="badge">수신</span>`;
    el.type = 'button';
    el.onclick = () => openTransmission(b[0], b[1], el);
    $('#brief-feed').prepend(el);
    while ($('#brief-feed').children.length > 3) $('#brief-feed').lastChild.remove();
  };
  receive();
  receive();
  $('#brief-refresh').onclick = () => requestTransmission($('#brief-refresh'), receive);
  every(() => {
    if (state.motion && !document.hidden) receive();
  }, 22000);
}
async function weather() {
  const signal = routeSignal();
  try {
    const r = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m&forecast_days=1&timezone=Asia%2FSeoul',
      { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) },
    );
    if (!r.ok) throw Error();
    const data = await r.json();
    if (signal.aborted) return;
    const c = data.current;
    if (
      !Number.isFinite(c?.temperature_2m) ||
      Math.abs(Date.now() - new Date(c.time + '+09:00')) > 7200000
    )
      throw Error();
    $('#weather-temp').innerHTML = Math.round(c.temperature_2m) + '<small>°C</small>';
    $('#weather-condition').textContent =
      c.weather_code === 0
        ? '맑음'
        : c.weather_code <= 3
          ? '구름'
          : c.weather_code <= 48
            ? '안개'
            : c.weather_code >= 95
              ? '뇌우'
              : c.weather_code >= 71 && c.weather_code <= 77
                ? '눈'
                : '비';
    $('#weather-status').textContent = c.time.slice(11, 16) + ' KST 기준';
    $('#weather-extra').textContent =
      `습도 ${c.relative_humidity_2m}% · 바람 ${c.wind_speed_10m} km/h`;
    const vals = data.hourly.temperature_2m;
    if (!Array.isArray(vals) || vals.some((v) => !Number.isFinite(v))) return;
    const lo = Math.min(...vals) - 2,
      hi = Math.max(...vals) + 2;
    $('#weather-chart').innerHTML =
      `<svg viewBox="0 0 500 75" role="img" aria-label="서울 오늘 시간별 기온, 최저 ${Math.round(lo + 2)}도 최고 ${Math.round(hi - 2)}도"><defs><linearGradient id="wx" x2="0" y2="1"><stop stop-color="#90b9ed" stop-opacity=".45"/><stop offset="1" stop-color="#90b9ed" stop-opacity="0"/></linearGradient></defs><path d="M0 75 ${vals.map((v, i) => `L${(i / (vals.length - 1)) * 500} ${65 - ((v - lo) / (hi - lo)) * 55}`).join(' ')} L500 75Z" fill="url(#wx)"/><polyline points="${vals.map((v, i) => `${(i / (vals.length - 1)) * 500},${65 - ((v - lo) / (hi - lo)) * 55}`).join(' ')}" fill="none" stroke="#87b1e8" stroke-width="2"/></svg><div><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>`;
  } catch {
    if (signal.aborted) return;
    $('#weather-status').textContent = '기상 연결 대기 · 재시도';
    $('#weather-status').tabIndex = 0;
    $('#weather-status').onclick = weather;
    $('#weather-status').onkeydown = (e) => {
      if (e.key === 'Enter') weather();
    };
  }
}
export function renderRecords() {
  let page = 0;
  $('#main').innerHTML =
    heading('INCIDENT ARCHIVE / RESPONSE', '사건 기록실', '신고 접수 · 현장 대응 · 종결 기록') +
    `<div class="access-lock" id="records-lock"><img src="assets/art/silver-emblem.webp" alt=""><h2>직원 열람 채널</h2><p>신고 기록과 처리 업무는 직원 채널에서 열람할 수 있습니다.</p><button class="primary" id="records-login">직원 로그인</button></div><section id="records-workspace" hidden><div class="receiver panel"><div><p class="eyebrow">INCIDENT RECEIVER / CH. 04</p><h2>신고 수신 채널</h2></div><svg class="wave" viewBox="0 0 180 40" aria-hidden="true"><path d="M0 20H25L30 8L35 35L40 17H60L65 2L70 38L75 20H110L115 10L120 32L125 20H180" fill="none" stroke="currentColor"/></svg><label>수신 주파수 <output id="frequency-label">98.6 Hz</output><input id="frequency" type="range" min="80" max="120" step="0.1" value="98.6"></label><span id="signal-quality">수신 양호</span><button id="radio-sound" aria-pressed="false">수신음 OFF</button></div><div class="records-toolbar"><label>유형 <select id="incident-type"><option value="all">전체</option>${incidentTypes.map((t) => `<option>${t}</option>`).join('')}</select></label><label>처리 <select id="incident-status"><option value="all">전체</option><option value="open" selected>처리 대기</option><option value="resolved">종결</option></select></label><button id="refresh-incidents">수신 갱신 ↻</button><button class="primary" id="new-incident">신고서 작성 ＋</button></div><div id="incident-summary" class="incident-summary"></div><div id="incident-list"></div><div class="pagination"><button id="incident-prev">← 이전</button><span id="incident-page-info"></span><button id="incident-next">다음 →</button></div><p class="muted">단말 기록은 현재 브라우저에 보관됩니다.</p></section>`;
  const rack = document.createElement('aside');
  rack.className = 'records-rack';
  const receiver = $('.receiver');
  receiver.replaceWith(rack);
  rack.append(receiver);
  rack.insertAdjacentHTML(
    'beforeend',
    '<section class="records-location-panel panel"><div class="section-title"><h2>현장 위치</h2><span class="eyebrow">LIVE / OPEN CASES</span></div><div id="records-map" class="seoul-map"></div></section>',
  );
  const recordMap = createMap($('#records-map'));
  const update = () => {
    recordMap?.syncSignals(incidents);
    if (state.staff) delay(() => recordMap?.refreshSize(), 60);
    $('#records-lock').hidden = state.staff;
    $('#records-workspace').hidden = !state.staff;
    if (!state.staff) {
      $('#incident-list').replaceChildren();
      return;
    }
    const type = $('#incident-type').value,
      filter = $('#incident-status').value,
      list = incidents
        .filter(
          (i) =>
            (type === 'all' || i.type === type) &&
            (filter === 'all' || (filter === 'open' ? !i.resolvedAt : i.resolvedAt)),
        )
        .toReversed();
    page = Math.max(0, Math.min(page, Math.ceil(list.length / 6) - 1));
    const t = tally(incidents);
    $('#incident-summary').innerHTML =
      `<span>접수 <b>${t.total}</b></span><span>미해결 <b>${t.open}</b></span><span>종결 <b>${t.resolved}</b></span>`;
    $('#incident-page-info').textContent =
      `${page + 1} / ${Math.max(1, Math.ceil(list.length / 6))} · ${list.length}건`;
    $('#incident-prev').disabled = page === 0;
    $('#incident-next').disabled = (page + 1) * 6 >= list.length;
    $('#incident-list').innerHTML =
      list
        .slice(page * 6, page * 6 + 6)
        .map(
          (i) =>
            `<article class="case-file ${i.resolvedAt ? 'closed' : ''}" data-incident="${esc(i.id)}" tabindex="0" aria-label="${esc(i.location)} 기록 열람"><div class="case-tab"><b>${i.grade}</b><span>${i.type}</span></div><div class="case-content"><small class="mono">${esc(i.id)}</small><h3>${esc(i.location)}</h3><p>${esc(i.detail)}</p><time>접수 ${koreaTime(new Date(i.created)).date} ${koreaTime(new Date(i.created)).clock}</time></div><div class="case-action">${i.resolvedAt ? `<span class="stamp">RESOLVED<small>SGIA · CASE CLOSED</small></span><button data-reopen="${i.id}" class="subtle">다시 열기</button>` : `<button data-resolve="${i.id}">종결 승인 ↗</button>`}</div></article>`,
        )
        .join('') || '<p class="empty-state">해당 기록이 없습니다.</p>';
  };
  $('#records-login').onclick = () => login();
  listen(document, 'sgia:viewer', update);
  $('#incident-type').onchange = $('#incident-status').onchange = () => {
    page = 0;
    update();
  };
  $('#incident-prev').onclick = () => {
    page--;
    update();
  };
  $('#incident-next').onclick = () => {
    page++;
    update();
  };
  $('#refresh-incidents').onclick = () => {
    if (!state.staff) return;
    if (incidents.length >= 100) return toast('기록함에 최대 100건을 보관합니다.');
    const item = generateIncident(incidents.length);
    incidents.push(item);
    save('incidents', incidents);
    page = 0;
    update();
    emergencyAlert(item);
  };
  $('#new-incident').onclick = () => {
    if (!state.staff) return login();
    if (incidents.length >= 100) return toast('기록함에 최대 100건을 보관합니다.');
    const reportDialog = modal(
      '신고서 작성',
      `<form id="incident-form" class="board-form"><div class="form-row"><label>신고자<input name="reporter" maxlength="40" required></label><label>발생 시각<input name="occurred" type="datetime-local" value="${koreaTime().date.replaceAll('.', '-')}T${koreaTime().clock.slice(0, 5)}" required></label></div><div class="form-row"><label>발생 위치<input name="location" maxlength="140" value="성수동 폐공장" required></label><label>구역<input name="zone" maxlength="80" required></label></div><div class="report-map-field"><p>지도를 눌러 발생 위치를 지정하세요.</p><div id="report-map" class="seoul-map" aria-label="신고 위치 선택 지도"></div><div class="coordinate-inputs"><label>위도<input name="latitude" type="number" step="any" min="-90" max="90" value="37.5445" required></label><label>경도<input name="longitude" type="number" step="any" min="-180" max="180" value="127.0557" required></label><button type="button" id="apply-coordinate">좌표 적용</button></div></div><div class="form-row"><label>유형<select name="type">${incidentTypes.map((t) => `<option value="${t}">${t}</option>`).join('')}</select></label><label>위험 등급<select name="grade"><option>D</option><option>C</option><option>B</option><option>A</option></select></label></div><div class="form-row"><label>지원 요청 팀<select name="support"><option value="비콘">비콘</option><option value="실드">실드</option><option value="오리진">오리진</option></select></label><label>필요 인원<input name="personnel" type="number" min="1" max="30" value="2" required></label></div><label>상황 설명<textarea name="detail" minlength="5" maxlength="1500" required></textarea></label><label>추가 요청사항<textarea name="requests" maxlength="500"></textarea></label><button class="primary">신고 접수</button></form>`,
    );
    const picker = createMap($('#report-map'), []);
    let selected = [37.5445, 127.0557],
      pin;
    if (picker) {
      picker.setView(selected, 13);
      pin = L.marker(selected, { draggable: true }).addTo(picker);
    }
    const setPoint = (lat, lng) => {
      selected = [lat, lng];
      pin?.setLatLng(selected);
      $('[name=latitude]').value = lat.toFixed(6);
      $('[name=longitude]').value = lng.toFixed(6);
    };
    picker?.on('click', (e) => setPoint(e.latlng.lat, e.latlng.lng));
    pin?.on('dragend', () => {
      const p = pin.getLatLng();
      setPoint(p.lat, p.lng);
    });
    $('#apply-coordinate').onclick = () => {
      const lat = $('[name=latitude]'),
        lng = $('[name=longitude]');
      if (!lat.reportValidity() || !lng.reportValidity()) return;
      setPoint(+lat.value, +lng.value);
      picker?.setView(selected, 13);
    };
    delay(() => {
      if (reportDialog.open) picker?.refreshSize();
    }, 200);
    reportDialog.addEventListener('close', () => picker?.release(), { once: true });
    $('#incident-form').onsubmit = (e) => {
      e.preventDefault();
      if (!state.staff) return;
      const data = Object.fromEntries(new FormData(e.target));
      const item = {
        ...generateIncident(incidents.length),
        ...data,
        personnel: Number(data.personnel),
        occurredAt: new Date(data.occurred + '+09:00').getTime(),
        manual: true,
        coordinates: [Number(data.latitude), Number(data.longitude)],
      };
      if (!isIncident(item)) return toast('신고 내용을 확인해 주세요.');
      incidents.push(item);
      save('incidents', incidents);
      $('#document-dialog').close();
      page = 0;
      $('#incident-type').value = 'all';
      $('#incident-status').value = 'open';
      update();
      emergencyAlert(item);
    };
  };
  $('#incident-list').onkeydown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-incident]')) {
      e.preventDefault();
      e.target.click();
    }
  };
  $('#incident-list').onclick = (e) => {
    const b = e.target.closest('[data-resolve],[data-reopen]');
    if (!state.staff) return;
    if (!b) {
      const card = e.target.closest('[data-incident]');
      if (card) {
        const record = incidents.find((i) => i.id === card.dataset.incident);
        const d = openIncident(record);
        $('.record-dossier', d).insertAdjacentHTML(
          'beforeend',
          '<div id="case-location-map" class="seoul-map"></div>',
        );
        const m = createMap($('#case-location-map'), [{ ...record, resolvedAt: null }]);
        m?.setView(record.coordinates || locations[record.location] || [37.55, 127], 14);
        delay(() => {
          if (d.open) m?.refreshSize();
        }, 200);
        d.addEventListener('close', () => m?.release(), { once: true });
      }
      return;
    }
    const record = incidents.find((i) => i.id === (b.dataset.resolve || b.dataset.reopen));
    record.resolvedAt = b.dataset.resolve ? Date.now() : null;
    save('incidents', incidents);
    update();
    toast(record.resolvedAt ? 'CASE CLOSED · 종결 승인' : '사건을 다시 열었습니다.');
  };
  let context, osc, gain;
  onDispose(() => context?.close());
  const sound = () => {
    if (context) {
      context.close();
      context = null;
      $('#radio-sound').textContent = '수신음 OFF';
      $('#radio-sound').setAttribute('aria-pressed', 'false');
      return;
    }
    if (!state.staff) return;
    try {
      context = new AudioContext();
      osc = context.createOscillator();
      gain = context.createGain();
      gain.gain.value = 0.018;
      osc.frequency.value = Number($('#frequency').value);
      osc.connect(gain).connect(context.destination);
      osc.start();
      $('#radio-sound').textContent = '수신음 ON';
      $('#radio-sound').setAttribute('aria-pressed', 'true');
    } catch {
      toast('수신음을 재생할 수 없습니다.');
    }
  };
  $('#radio-sound').onclick = sound;
  $('#frequency').oninput = (e) => {
    const f = Number(e.target.value);
    $('#frequency-label').textContent = f.toFixed(1) + ' Hz';
    $('#signal-quality').textContent = Math.abs(f - 98.6) < 1 ? '수신 양호' : '신호 불안정';
    $('#records-workspace').style.setProperty('--noise', Math.min(0.3, Math.abs(f - 98.6) / 60));
    if (osc && context) osc.frequency.setTargetAtTime(f, context.currentTime, 0.05);
  };
  listen(document, 'sgia:viewer', () => {
    if (!state.staff && context) sound();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden && context) sound();
  });

  mountReceiver();
  update();
}
export function renderOrpe(target = $('#main')) {
  sealedArchive(target, () => renderOrpeContent(target));
}
function renderOrpeContent(target) {
  const az = characters.find((c) => c.team === 'orpe');
  target.innerHTML =
    heading(
      'COUNTERINTELLIGENCE / ORPÉ',
      '외부 위협 정보',
      '비인가 조직 · 관측 자료의 외부 반출을 금합니다.',
    ) +
    `<section class="classified-board"><div class="classified-header"><span>TOP SECRET / ORPÉ PRIVATE FILE</span><span class="status-dot"></span></div><div class="threat-layout"><div><div id="az-profile" class="character-grid single"></div></div><div class="threat-intelligence"><span class="eyebrow">SUBJECT 001 / UNREGISTERED</span><h2>AZ<span>에이지</span></h2><p>극단주의 범죄 집단 ORPÉ 소속 미등록 각성자.<br>증언의 일치가 정보의 진실성을 보증하지 않습니다.</p><div class="threat-class"><span>THREAT ASSESSMENT</span><strong>UNMEASURABLE</strong><div class="threat-meter"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><dl class="facts"><div><dt>발화 동기화</dt><dd>추정 영향 반경 약 2km</dd></div><div><dt>주요 위험</dt><dd>거짓 증언 · 수치심 환산</dd></div><div><dt>대응 원칙</dt><dd>단독 접촉 금지 · 교차 검증</dd></div></dl><button class="danger-button" id="threat-log">감청·침입 로그 열람 ↗</button><div id="intrusion-log" class="terminal-log" aria-live="polite"></div></div></div>${evidenceIndex()}<div class="tracking-section"><div class="section-title"><h2>동선 추적</h2><span class="badge danger">RESTRICTED INTELLIGENCE</span><button id="tracking-pause" aria-pressed="false">추적 일시정지</button><button id="track-az">신호 재탐색 ↻</button></div><div class="tracking-layout"><div id="tracking-map" class="seoul-map"></div><ol id="sighting-log"></ol></div></div></section>`;
  $('.classified-board', target).insertAdjacentHTML(
    'afterbegin',
    '<div class="case-breadcrumb"><span>COUNTERINTELLIGENCE BUREAU</span><b>CASE / OR—001</b><span>EVIDENCE REVIEW</span></div>',
  );
  renderCards([az], $('#az-profile'));
  $('#az-profile').insertAdjacentHTML(
    'afterend',
    `<div class="identity-terminal"><span>FACIAL RECONSTRUCTION / 01</span><pre aria-hidden="true">       .:+####+:.
    .+#@@@@@@@@#+.
   :##@@@####@@@##:
   ##@@#:.  .:#@@##
   #@@: .+  +. :@@#
   :@#    /\    #@:
    +#   ----   #+
     :#:.    .:#:
       :+####+:
   [ IDENTITY UNVERIFIED ]</pre><b>TRACE_USER / AZ</b></div>`,
  );
  mountEvidenceIndex();
  const map = createMap($('#tracking-map'), []);
  delay(() => map?.refreshSize(), 400);
  let points = [],
    markers = [],
    step = 0,
    paused = false;
  const events = [
    '감청 채널에서 동일 발화가 중복 수신됨.',
    '비인가 장비 거래 정황. 목격자 진술 대조 중.',
    'CCTV 시각과 출입 기록 불일치. 흔적 복원 중.',
    '대상 파장 소실. 2km 반경 접촉을 제한함.',
  ];
  function track() {
    const options = Object.entries(locations).filter(([n]) => n !== points.at(-1)?.name),
      [name, pos] = options[Math.floor(Math.random() * options.length)];
    points.push({ name, pos });
    if (points.length > 5) points.shift();
    markers.forEach((m) => m.remove());
    markers = [];
    if (map) {
      markers.push(
        L.polyline(
          points.map((p) => p.pos),
          { color: '#cd5f72', dashArray: '5 8', weight: 2 },
        ).addTo(map),
      );
      points.forEach((p, i) => {
        markers.push(
          L.marker(p.pos, {
            icon: L.divIcon({
              className: 'footprint-marker',
              html: `<span>${i + 1}</span><img src="assets/art/footprints.webp" alt="">`,
              iconSize: [34, 34],
            }),
          })
            .addTo(map)
            .bindPopup(esc(p.name) + ' · 최종 발견 위치'),
        );
      });
    }
    const li = document.createElement('li');
    li.className = 'incoming';
    li.innerHTML = `<time>${koreaTime().clock}</time><strong>${name}</strong><p>${events[step++ % events.length]}</p>`;
    $('#sighting-log').prepend(li);
    while ($('#sighting-log').children.length > 4) $('#sighting-log').lastChild.remove();
    $('#intrusion-log').textContent =
      `[${koreaTime().clock}] TRACE ${String(step).padStart(3, '0')}\nINTEGRITY WARNING / 신호 교차 검증 중\nENCRYPTED CHANNEL / ORPÉ-${1000 + step}`;
  }
  $('#track-az').onclick = track;
  $('#tracking-pause').onclick = (e) => {
    paused = !paused;
    e.target.textContent = paused ? '추적 재개' : '추적 일시정지';
    e.target.setAttribute('aria-pressed', String(paused));
  };
  $('#threat-log').onclick = () => {
    if (!state.staff) return login(() => $('#threat-log').click());
    interceptTerminal($('#intrusion-log').textContent);
  };
  track();
  every(() => {
    if (!paused && state.motion && !document.hidden) track();
  }, 18000);
  listen(document, 'sgia:viewer', () => renderCards([az], $('#az-profile')));
}
