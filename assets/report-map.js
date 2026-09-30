import { registerCopy } from './i18n.js';
[
  [
    "주소 검색 ↗",
    "Search address ↗",
    "住所検索 ↗",
    "搜索地址 ↗"
  ],
  [
    "세계 지도",
    "World map",
    "世界地図",
    "世界地图"
  ],
  [
    "주소를 입력하고 검색하거나 지도에 핀을 찍으세요.",
    "Search an address or place a pin on the map.",
    "住所を検索するか、地図にピンを置いてください。",
    "搜索地址或在地图上标记。"
  ],
  [
    "범위 표시",
    "Area display",
    "範囲表示",
    "范围显示"
  ],
  [
    "지점",
    "Point",
    "地点",
    "地点"
  ],
  [
    "검색된 지형·행정 경계",
    "Mapped geographic / administrative boundary",
    "検索された地形・行政境界",
    "搜索到的地理或行政边界"
  ],
  [
    "직접 구역 그리기",
    "Draw an area",
    "区域を描く",
    "绘制区域"
  ],
  [
    "추정 반경(m) · 선택",
    "Estimated radius (m) · optional",
    "推定半径(m)・任意",
    "估计半径(m) · 选填"
  ],
  [
    "경계 모드는 검색된 구역 전체를 표시합니다. 직접 그리기는 지도에 꼭짓점을 3개 이상 지정하세요. 추정 반경은 현장 정보로 기록됩니다.",
    "Boundary mode shows the entire mapped area. To draw, mark at least 3 corners. The estimated radius is saved as incident information.",
    "境界モードでは検索区域全体を表示します。描画には頂点を3個以上指定してください。推定半径は現場情報として保存します。",
    "边界模式显示整个搜索区域。绘制区域需至少3个顶点。估计半径作为现场信息保存。"
  ],
  [
    "꼭짓점 되돌리기",
    "Undo corner",
    "頂点を戻す",
    "撤销顶点"
  ],
  [
    "구역 지우기",
    "Clear area",
    "区域を消去",
    "清除区域"
  ],
  [
    "주소·지도 경계를 확인했습니다.",
    "Address and mapped boundary found.",
    "住所と地図境界を確認しました。",
    "已找到地址和地图边界。"
  ],
  [
    "위치를 확인했습니다. 제공되는 경계가 없으면 직접 구역을 그릴 수 있습니다.",
    "Location found. You can draw an area if no boundary is available.",
    "位置を確認しました。境界がない場合は区域を描けます。",
    "已找到位置。没有边界时可手动绘制区域。"
  ],
  [
    "주소를 찾고 있습니다…",
    "Searching for an address…",
    "住所を検索中…",
    "正在搜索地址…"
  ],
  [
    "발생 위치에 맞는 검색 결과를 선택해 주세요.",
    "Select the result matching the incident location.",
    "現場に合う検索結果を選んでください。",
    "请选择符合发生位置的结果。"
  ],
  [
    "검색 결과가 없습니다. 지도 핀이나 좌표로 지정해 주세요.",
    "No results. Use a map pin or coordinates.",
    "結果がありません。ピンか座標で指定してください。",
    "没有结果。请使用地图标记或坐标。"
  ],
  [
    "선택한 위치의 주소를 확인하고 있습니다…",
    "Looking up the selected location…",
    "選んだ位置の住所を確認中…",
    "正在查询所选位置…"
  ],
  [
    "지도에서 구역의 꼭짓점을 순서대로 누르세요.",
    "Click the area corners in order.",
    "区域の頂点を順に押してください。",
    "请依次点击区域顶点。"
  ],
  [
    "이 지점의 주소가 없어 좌표로 기록합니다.",
    "No address here; coordinates will be saved.",
    "住所がないため座標で記録します。",
    "此处没有地址，将保存坐标。"
  ],
  [
    "구역 지우기",
    "Clear area",
    "区域を消去",
    "清除区域"
  ]
].forEach((row) => registerCopy(...row));
import { serviceConfig } from './service-config.js';
import { onDispose } from './lifecycle.js';
import { isArea, wrapLongitude } from './geo-model.js';
export const reportMapControls = `<div class="address-tools"><button type="button" id="search-address">주소 검색 ↗</button><button type="button" id="world-view">세계 지도</button></div><p id="address-status" role="status">주소를 입력하고 검색하거나 지도에 핀을 찍으세요.</p><div id="address-results"></div><div class="area-controls"><label>범위 표시<select name="areaMode"><option value="point">지점</option><option value="boundary">검색된 지형·행정 경계</option><option value="draw">직접 구역 그리기</option></select></label><label>추정 반경(m) · 선택<input name="radiusMeters" type="number" min="0" max="2000000" placeholder="예: 500"></label></div><p class="area-help">경계 모드는 검색된 구역 전체를 표시합니다. 직접 그리기는 지도에 꼭짓점을 3개 이상 지정하세요. 추정 반경은 현장 정보로 기록됩니다.</p><div class="area-draw-tools"><button id="area-undo" type="button">꼭짓점 되돌리기</button><button id="area-clear" type="button">구역 지우기</button></div><small class="geocode-credit">주소·경계: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors / Nominatim</small>`;
export function mountReportMap(form, map, dialog) {
  const $ = (s) => form.querySelector(s),
    location = form.elements.location,
    zone = form.elements.zone,
    mode = form.elements.areaMode;
  const controller = new AbortController();
  let generation = 0,
    disposed = false,
    pending = false,
    locationConfirmed = false,
    selected = [37.5445, 127.0557],
    boundary = null,
    drawn = [],
    areaLayer;
  const status = (msg) => {
    if (!disposed) $('#address-status').textContent = msg;
  };
  const pin = map
    ? L.marker(selected, {
        draggable: true,
        icon: L.divIcon({
          className: 'report-location-pin',
          html: '<span aria-hidden="true">＋</span>',
          iconSize: [32, 40],
          iconAnchor: [16, 38],
        }),
        title: '발생 위치',
      }).addTo(map)
    : null;
  function invalidate() {
    generation++;
    pending = false;
  }
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    invalidate();
    controller.abort();
    map?.release();
    observer.disconnect();
    dialog.removeEventListener('close', close);
    unregister();
  };
  const close = () => {
    if (!dialog.open || !form.isConnected) cleanup();
  };
  const observer = new MutationObserver(() => {
    if (!form.isConnected) cleanup();
  });
  observer.observe(dialog, { childList: true, subtree: true });
  dialog.addEventListener('close', close);
  const unregister = onDispose(cleanup);
  function selectedArea() {
    if (mode.value === 'boundary') return boundary;
    if (mode.value === 'draw' && drawn.length >= 3)
      return { type: 'Polygon', coordinates: [[...drawn, drawn[0]]] };
    return null;
  }
  function paint() {
    if (!map) return;
    areaLayer?.remove();
    const area = selectedArea();
    if (area)
      areaLayer = L.geoJSON(area, {
        style: { color: '#bd344b', weight: 2, fillOpacity: 0.16 },
      }).addTo(map);
    else if (mode.value === 'draw' && drawn.length)
      areaLayer = L.polyline(
        drawn.map(([x, y]) => [y, x]),
        { color: '#bd344b', weight: 2 },
      ).addTo(map);
  }
  function point(lat, lon) {
    selected = [Math.max(-85.051128, Math.min(85.051128, lat)), wrapLongitude(lon)].map((n) => Number(n.toFixed(6)));
    locationConfirmed = true;
    pin?.setLatLng(selected);
    form.elements.latitude.value = selected[0].toFixed(6);
    form.elements.longitude.value = selected[1].toFixed(6);
  }
  async function request(params, ticket) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(serviceConfig.api + '/geocode?' + new URLSearchParams(params), {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
      });
      const data = await response.json();
      if (disposed || generation !== ticket) return null;
      if (response.status === 429 && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1300));
        if (disposed || generation !== ticket) return null;
        continue;
      }
      if (!response.ok) throw Error(data.error || '주소를 찾지 못했습니다.');
      return data.results;
    }
  }
  function result(r, { move = true } = {}) {
    location.value = r.name;
    zone.value = r.zone || zone.value;
    boundary = isArea(r.area) ? r.area : null;
    if (move) {
      point(r.lat, r.lon);
      map?.setView(selected, 14);
    }
    paint();
    if (mode.value === 'boundary' && areaLayer)
      map?.fitBounds(areaLayer.getBounds(), { padding: [20, 20], maxZoom: 15 });
    status(
      boundary
        ? '주소·지도 경계를 확인했습니다.'
        : '위치를 확인했습니다. 제공되는 경계가 없으면 직접 구역을 그릴 수 있습니다.',
    );
    $('#address-results').replaceChildren();
  }
  async function search() {
    const q = location.value.trim();
    if (q.length < 2) return status('검색할 주소나 지역명을 입력해 주세요.');
    const ticket = ++generation;
    pending = true;
    status('주소를 찾고 있습니다…');
    $('#address-results').replaceChildren();
    try {
      const rows = await request({ q }, ticket);
      if (!rows) return;
      if (!rows.length) {
        status('검색 결과가 없습니다. 지도 핀이나 좌표로 지정해 주세요.');
        return;
      }
      if (rows.length === 1) result(rows[0]);
      else {
        status('발생 위치에 맞는 검색 결과를 선택해 주세요.');
        for (const r of rows) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = r.name;
          button.onclick = () => {
            invalidate();
            result(r);
          };
          $('#address-results').append(button);
        }
      }
    } catch (e) {
      if (!disposed && generation === ticket) status(e.message);
    } finally {
      if (generation === ticket) pending = false;
    }
  }
  async function reverse() {
    const ticket = ++generation;
    pending = true;
    const fallback = `${selected[0].toFixed(5)}, ${selected[1].toFixed(5)}`;
    locationConfirmed = true;
    location.value = fallback;
    boundary = null;
    paint();
    status('선택한 위치의 주소를 확인하고 있습니다…');
    try {
      const rows = await request(
        { lat: selected[0], lon: selected[1], area: mode.value === 'boundary' ? '1' : '0' },
        ticket,
      );
      if (!rows) return;
      if (rows[0]) result(rows[0], { move: false });
      else status('이 지점의 주소가 없어 좌표로 기록합니다.');
    } catch (e) {
      if (!disposed && generation === ticket)
        status('주소 조회 실패 · 좌표는 지정되었습니다. ' + e.message);
    } finally {
      if (generation === ticket) pending = false;
    }
  }
  location.addEventListener('input', () => {
    invalidate();
    locationConfirmed = false;
    boundary = null;
    $('#address-results').replaceChildren();
    paint();
  });
  location.addEventListener('change', search);
  location.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  });
  $('#search-address').onclick = () => {
    if (!pending) search();
  };
  map?.on('click', (e) => {
    if (mode.value === 'draw') {
      if (drawn.length >= 200) return status('구역 꼭짓점은 200개까지 지정할 수 있습니다.');
      drawn.push([wrapLongitude(e.latlng.lng), e.latlng.lat]);
      paint();
      status('구역 꼭짓점 ' + drawn.length + '개 · 3개 이상이면 구역이 저장됩니다.');
    } else {
      point(e.latlng.lat, e.latlng.lng);
      reverse();
    }
  });
  pin?.on('dragend', () => {
    const p = pin.getLatLng();
    point(p.lat, p.lng);
    reverse();
  });
  $('#apply-coordinate').onclick = () => {
    if (!form.elements.latitude.reportValidity() || !form.elements.longitude.reportValidity())
      return;
    point(+form.elements.latitude.value, +form.elements.longitude.value);
    map?.setView(selected, 13);
    reverse();
  };
  $('#world-view').onclick = () => map?.setView([20, 0], 2);
  mode.onchange = () => {
    paint();
    if (mode.value === 'boundary' && !boundary) reverse();
    if (mode.value === 'draw') status('지도에서 구역의 꼭짓점을 순서대로 누르세요.');
  };
  $('#area-undo').onclick = () => {
    drawn.pop();
    paint();
  };
  $('#area-clear').onclick = () => {
    drawn = [];
    boundary = null;
    paint();
    status('지정 구역을 지웠습니다.');
  };
  return {
    read() {
      if (!locationConfirmed) throw Error('주소 검색 결과를 선택하거나 지도에 발생 위치를 지정해 주세요.');
      if (pending) throw Error('주소 조회가 끝난 뒤 접수해 주세요.');
      if (+form.elements.latitude.value !== selected[0] || +form.elements.longitude.value !== selected[1])
        throw Error('수정한 좌표를 지도에 적용한 뒤 접수해 주세요.');
      if ($('#address-results').children.length)
        throw Error('주소 검색 결과에서 위치를 선택해 주세요.');
      const area = selectedArea();
      if (mode.value !== 'point' && !isArea(area))
        throw Error('경계를 선택하거나 꼭짓점을 3개 이상 지정해 주세요.');
      return {
        coordinates: [...selected],
        ...(area ? { area, areaSource: mode.value === 'draw' ? 'manual' : 'osm' } : {}),
        radiusMeters: Number(form.elements.radiusMeters.value) || 0,
      };
    },
    dispose: cleanup,
  };
}
