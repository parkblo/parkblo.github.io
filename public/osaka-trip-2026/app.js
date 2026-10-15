(() => {
  'use strict';
  const {places, days} = window.TRIP;
  const storageKey = 'weekend.osaka.2026.v1';
  const blockIds = new Set(Object.values(days).flatMap(d => d.blocks.map(b => b.id)));
  let restored = {};
  try { restored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) {}
  const validPicks = {};
  Object.values(days).forEach(d => d.blocks.forEach(b => {
    const saved = restored.picks && restored.picks[b.id];
    if (Array.isArray(saved)) validPicks[b.id] = saved.filter(id => b.choices.includes(id)).slice(0, b.single ? 1 : 20);
  }));
  const state = {
    day: Object.hasOwn(days, restored.day) ? restored.day : 'sat',
    done: new Set(Array.isArray(restored.done) ? restored.done.filter(id => blockIds.has(id)) : []),
    picks: validPicks,
    memo: new Set(Array.isArray(restored.memo) ? restored.memo.filter(x => typeof x === 'string') : []),
    branch: restored.branch === 'shopping' ? 'shopping' : 'slow',
    view: 'schedule', scope: '', focused: 'shisendo', active: 's-garden', open: new Set(),
  };
  const $ = id => document.getElementById(id);
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mapSearch = p => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.query || p.ja);
  const directions = (from, to, mode = 'walking') => 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(from.query || from.ja) + '&destination=' + encodeURIComponent(to.query || to.ja) + '&travelmode=' + mode;
  let map, markers, routeLayer, baseLayer, tileSuccess = 0, tileFailures = 0, toastTimer;
  const markerById = new Map();
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify({day:state.day, done:[...state.done], picks:state.picks, branch:state.branch, memo:[...state.memo]})); } catch (_) { toast('브라우저 저장 공간을 사용할 수 없어 이번 방문에만 반영돼요.'); }
  }
  function toast(message) {
    $('toast').textContent = message; $('toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2700);
  }
  function currentBlocks() { return days[state.day].blocks; }
  function picked(b) { return state.picks[b.id] || []; }
  function blockPlaces(b) {
    let ids = [...b.fixed, ...b.choices];
    if (b.id === 's-move') ids = ['namba','shisendo'];
    if (b.branch) ids = state.branch === 'shopping' ? ['kiddy'] : ['keibunsha','nakatani'];
    return [...new Set(ids)].map(id => places[id]).filter(Boolean);
  }
  function planned() {
    let ids = [];
    currentBlocks().forEach(b => {
      if (b.id === 's-move') return;
      ids.push(...b.fixed, ...picked(b));
      if (b.branch && state.branch === 'shopping') ids.push('kiddy');
    });
    return [...new Set(ids)].map(id => places[id]).filter(Boolean);
  }
  function candidates() {
    const ids = currentBlocks().flatMap(b => blockPlaces(b).map(p => p.id));
    const routeIds = new Set(planned().map(p => p.id));
    return [...new Set(ids)].filter(id => !routeIds.has(id)).map(id => places[id]).filter(Boolean);
  }
  function scoped(list) { return list.filter(p => state.scope === 'all' || p.area === state.scope); }
  function preview(b) {
    if (b.branch) return state.branch === 'shopping' ? '가와라마치 · 키디랜드 / 선택됨' : '이치조지에 더 머물기 / 선택됨';
    if (b.single && picked(b).length) return '오늘의 선택 / ' + places[picked(b)[0]].name;
    return b.preview || '';
  }
  function candidateHTML(id, b, fixed) {
    const p = places[id]; if (!p) return '';
    const selected = Boolean(picked(b).includes(id) || (b.branch && state.branch === 'shopping'));
    const directionOrigin = places.shisendo;
    return `<article class="candidate ${selected ? 'selected' : ''}"><div><div class="candidate-name">${esc(p.name)}<span class="candidate-ja">${esc(p.ja)}</span></div><p class="candidate-text">${esc(p.desc)}</p><div class="candidate-meta">${esc(p.meta)}</div><div class="candidate-actions"><button type="button" data-map="${esc(id)}">지도에서 보기 ⌖</button><a href="${esc(mapSearch(p))}" target="_blank" rel="noopener noreferrer">장소 검색 ↗</a>${p.source ? `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">안내 ↗</a>` : ''}${p.area === 'kyoto' && id !== 'shisendo' ? `<a href="${esc(directions(directionOrigin,p))}" target="_blank" rel="noopener noreferrer">시센도에서 길찾기 ↗</a>` : ''}</div></div>${fixed ? '<span class="fixed-label">메인 일정</span>' : b.branch ? '<span class="fixed-label">시간 남으면</span>' : `<button type="button" class="pick-button" data-pick="${esc(id)}" data-block="${esc(b.id)}" aria-pressed="${selected}" aria-label="${esc(p.name)} ${selected ? '선택 취소' : '일정에 선택'}">${selected ? '✓ 선택됨' : b.single ? '여기로 선택' : '+ 일정에 담기'}</button>`}</article>`;
  }
  function eventHTML(b) {
    const open = state.open.has(b.id), done = state.done.has(b.id);
    const fixed = b.fixed.map(id => candidateHTML(id, b, true)).join('');
    const choices = b.choices.map(id => candidateHTML(id,b,false)).join('');
    const photo = b.image ? `<img class="event-photo" src="./assets/${esc(b.image)}" alt="" loading="lazy" width="75" height="86">` : `<div class="visual-placeholder ${b.id.includes('night') ? 'night' : ''}" aria-hidden="true">${b.icon || '↝'}</div>`;
    const branch = b.branch ? `<div class="branch-switch" role="group" aria-label="오후 일정 선택"><button type="button" data-branch="slow" aria-pressed="${state.branch === 'slow'}">이치조지에서 더 쉬기</button><button type="button" data-branch="shopping" aria-pressed="${state.branch === 'shopping'}">가와라마치 · 쇼핑</button></div>` : '';
    const firstPlace = places[b.fixed[0]];
    const routeIds = b.id === 's-return' ? [(state.branch === 'shopping' ? 'kiddy' : (state.picks['s-free'] || []).at(-1) || (state.picks['s-lunch'] || [])[0] || 'enkouji'), 'namba'] : b.route;
    const route = routeIds && routeIds.length > 1 ? `<a href="${esc(directions(places[routeIds[0]], places[routeIds.at(-1)], b.travel))}" target="_blank" rel="noopener noreferrer">${b.travel === 'transit' ? '대중교통' : '도보'} 길찾기 ↗</a>` : firstPlace ? `<a href="${esc(mapSearch(firstPlace))}" target="_blank" rel="noopener noreferrer">대표 장소 열기 ↗</a>` : '<span></span>';
    return `<article class="event ${state.active === b.id ? 'active' : ''} ${done ? 'done' : ''}" id="event-${esc(b.id)}"><div class="event-head" data-head="${esc(b.id)}">${photo}<div class="event-time">${esc(b.start)}${b.end ? `<span class="time-end">${esc(b.end)}</span>` : ''}</div><div class="event-meta"><div class="event-category">${esc(b.cat)}<span class="status-tag">${done ? '완료' : b.single ? '택 1' : b.cat === '메인' ? '중심 일정' : '타임블록'}</span></div><h3 class="event-title" id="title-${esc(b.id)}">${esc(b.title)}</h3><p class="event-description">${esc(b.desc)}</p><div class="event-preview">${esc(preview(b))}</div></div><button type="button" class="event-toggle" data-toggle="${esc(b.id)}" aria-expanded="${open}" aria-controls="body-${esc(b.id)}" aria-label="${esc(b.title)} ${open ? '접기' : '상세와 후보 펼치기'}">${open ? '−' : '+'}</button></div><div class="event-body" id="body-${esc(b.id)}" ${open ? '' : 'hidden'}><p class="block-info">${esc(b.detail)}</p>${branch}${fixed ? `<div class="candidate-heading">일정의 중심<span>${b.fixed.length}곳</span></div>${fixed}` : ''}${choices ? `<div class="candidate-heading">${b.branch ? '시간이 남으면' : b.single ? '점심 후보 · 한 곳 고르기' : '관심 있는 후보만 담기'}<span>${b.choices.length}곳</span></div>${choices}` : ''}${b.note ? `<p class="block-callout">${esc(b.note)}</p>` : ''}<div class="event-actions">${route}<label class="done-label"><input type="checkbox" data-done="${esc(b.id)}" ${done ? 'checked' : ''}>이 블록 다녀왔어요</label></div></div></article>`;
  }
  function renderTimeline() {
    const focused = document.activeElement;
    const restorePick = focused && focused.dataset && focused.dataset.pick;
    const restoreBlock = focused && focused.dataset && focused.dataset.block;
    $('timeline').innerHTML = currentBlocks().map(eventHTML).join('');
    $('done-count').textContent = currentBlocks().filter(b => state.done.has(b.id)).length + ' / ' + currentBlocks().length + ' 완료';
    const allOpen = currentBlocks().every(b => state.open.has(b.id));
    $('expand-all').textContent = allOpen ? '모두 접기 −' : '모두 펼치기 +';
    if (restorePick) document.querySelector(`[data-pick="${CSS.escape(restorePick)}"][data-block="${CSS.escape(restoreBlock)}"]`)?.focus({preventScroll:true});
  }
  function renderMemo() {
    $('memo-list').innerHTML = days[state.day].memo.map(([id,title,detail]) => `<label class="memo-entry"><input type="checkbox" data-memo="${esc(id)}" ${state.memo.has(id) ? 'checked' : ''}><span>${esc(title)}<small>${esc(detail)}</small></span></label>`).join('');
  }
  function renderDay() {
    const d = days[state.day];
    document.querySelectorAll('[data-day]').forEach(b => {const yes = b.dataset.day === state.day;b.classList.toggle('active', yes);if(yes)b.setAttribute('aria-current','date');else b.removeAttribute('aria-current');});
    $('day-eyebrow').textContent = d.eyebrow; $('day-title').textContent = d.title;
    $('day-counter').textContent = d.date; $('day-description').textContent = d.desc;
    $('day-note').innerHTML = '<span class="note-sign" aria-hidden="true">↳</span><span>' + esc(d.note) + '</span>';
    $('end-caption').textContent = d.end;
    renderTimeline(); renderMemo(); renderMapUI(true);
  }
  function scopeButtons() {
    const scopes = state.day === 'sat' ? [['kyoto','교토 · 이치조지'],['osaka','오사카'],['all','전체']] : [['osaka','오사카 · 시내'],['all','전체 장소']];
    $('map-scope').innerHTML = scopes.map(([id,label]) => `<button type="button" data-scope="${id}" aria-pressed="${state.scope === id}">${label}</button>`).join('');
  }
  function renderSelection() {
    const p = places[state.focused];
    if (!p) { $('map-selection').innerHTML = '<p class="selection-text">일정이나 후보를 선택하면 이곳에 장소 정보가 나타나요.</p>';return; }
    $('map-selection').innerHTML = `<div><p class="selection-eyebrow">${p.area === 'kyoto' ? 'KYOTO' : 'OSAKA'} / SELECTED PLACE</p><h3 class="selection-title">${esc(p.name)}</h3><p class="selection-text">${esc(p.meta || p.desc)}${!p.ll ? '<br>정확한 위치는 장소 검색에서 확인해요.' : ''}</p></div><div class="selection-actions"><a href="${esc(mapSearch(p))}" target="_blank" rel="noopener noreferrer">Google Maps ↗</a><button type="button" data-find="${esc(p.id)}">일정에서 보기 ↓</button></div>`;
  }
  function renderMapUI(fit = false) {
    scopeButtons();
    const route = scoped(planned()).filter(p => p.ll); const list = scoped(candidates());
    const pinned = [...route,...list].filter(p => p.ll);
    $('pin-count').textContent = pinned.length + ' PLACES';
    const lunch = state.picks['s-lunch']?.[0];
    $('map-summary').innerHTML = `<strong>${state.scope === 'kyoto' ? '이치조지의 작은 반경' : state.scope === 'osaka' ? '오사카에서 보내는 시간' : '하루를 잇는 동선'}</strong><span>${state.day === 'sat' ? lunch ? '점심 · ' + esc(places[lunch].name) : '점심 · 현장 선택' : route.length + '곳의 중심 장소'}</span>`;
    $('route-list').innerHTML = route.map((p,i) => `<button type="button" class="route-stop" data-map="${esc(p.id)}"><span>${String(i+1).padStart(2,'0')}</span><span>${esc(p.name)}</span><small>${p.ll ? '⌖' : '검색 ↗'}</small></button>`).join('') || '<p class="selection-text">아직 담은 장소가 없어요. 일정에서 마음에 드는 후보를 선택해 보세요.</p>';
    let action;
    if (state.day === 'sat' && state.scope === 'kyoto') {
      const ids = ['shisendo','enkouji', ...(lunch ? [lunch] : []), ...(state.picks['s-free'] || []), ...(state.branch === 'shopping' ? ['kiddy'] : [])];
      const unique = [...new Set(ids)];
      // Regional routes use walking for Ichijoji and transit when Kawaramachi is included.
      action = directions(places[unique[0]], places[unique.at(-1)],state.branch === 'shopping' ? 'transit' : 'walking');
      if (unique.length > 2 && state.branch !== 'shopping') action += '&waypoints=' + encodeURIComponent(unique.slice(1,-1).map(id => places[id].query).join('|'));
    } else if (state.day === 'sat' && state.scope === 'all') action = directions(places.namba, places.shisendo,'transit');
    else if (route.length > 1) {
      action = directions(route[0],route.at(-1),'walking');
      if(route.length > 2)action += '&waypoints=' + encodeURIComponent(route.slice(1,-1).map(p=>p.query).join('|'));
    }
    else action = mapSearch(route[0] || places.namba);
    $('route-action').href = action;
    $('route-action').innerHTML = (state.day === 'sat' && state.scope === 'all' ? '오사카 → 교토 대중교통 길찾기' : state.day === 'sat' && state.scope === 'kyoto' && state.branch === 'shopping' ? '가와라마치 대중교통 길찾기' : 'Google Maps에서 동선 보기') + '<span>↗</span>';
    renderSelection(); ensureMap(); if (map) drawMap(fit);
  }
  function ensureMap() {
    if (map || getComputedStyle($('map-panel')).display === 'none') return;
    if (!window.L) { $('map-fallback').hidden = false;return; }
    map = L.map('map', {zoomControl:false,scrollWheelZoom:false,attributionControl:true}).setView([35.0437,135.791],15);
    L.control.zoom({position:'bottomright'}).addTo(map);
    baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    baseLayer.on('tileload',()=>{tileSuccess++;$('map-fallback').hidden=true;});
    baseLayer.on('tileerror',()=>{tileFailures++;if(tileSuccess === 0 && tileFailures >= 4)$('map-fallback').hidden=false;});
    markers=L.layerGroup().addTo(map); routeLayer=L.layerGroup().addTo(map);
    const observer = new ResizeObserver(()=>{if(map)map.invalidateSize({pan:false});}); observer.observe($('map'));
  }
  function markerIcon(p, label, candidate) {
    return L.divIcon({className:'trip-marker',html:`<span class="map-pin ${candidate ? 'candidate-pin' : ''} ${state.focused === p.id ? 'highlight' : ''}">${esc(label)}</span>`,iconSize:[28,28],iconAnchor:[14,14]});
  }
  function drawMap(fit) {
    markers.clearLayers(); routeLayer.clearLayers(); markerById.clear();
    const route = scoped(planned()).filter(p => p.ll);
    const extra = scoped(candidates()).filter(p => p.ll);
    const all = [...route,...extra];
    const add = (p,i,candidate) => {
      const label = candidate ? '·' : String(i+1);
      const marker = L.marker(p.ll,{icon:markerIcon(p,label,candidate),title:p.name,alt:p.name,keyboard:true,zIndexOffset:candidate ? 0 : 100});
      marker.on('click',()=>selectPlace(p.id,false));
      if (!candidate && (p.id === 'shisendo' || p.id === 'enkouji' || state.scope !== 'kyoto')) marker.bindTooltip(p.name,{permanent:true,direction:'top',offset:[0,-12],className:'marker-label'});
      marker.addTo(markers);marker.getElement()?.setAttribute('aria-label',p.name+' 지도에서 보기');markerById.set(p.id,marker);
    };
    route.forEach((p,i)=>add(p,i,false)); extra.forEach((p,i)=>add(p,i,true));
    // Draw each city's visiting order separately. Cross-city travel is explicitly transit.
    for (const area of ['kyoto','osaka']) {
      const points = route.filter(p=>p.area===area).map(p=>p.ll);
      if(points.length>1)L.polyline(points,{color:'#456954',weight:2,opacity:.8,dashArray:'4 7'}).addTo(routeLayer);
    }
    if(state.scope==='all' && state.day==='sat')L.polyline([places.namba.ll,places.shisendo.ll],{color:'#8b9588',weight:1.5,opacity:.65,dashArray:'2 8'}).addTo(routeLayer);
    if(fit && all.length)map.fitBounds(L.latLngBounds(all.map(p=>p.ll)),{paddingTopLeft:[35,65],paddingBottomRight:[35,35],maxZoom:15.5,animate:false});
  }
  function selectPlace(id, pan = true) {
    const p=places[id];if(!p)return;
    state.focused=id;
    if(state.scope!=='all' && state.scope!==p.area)state.scope=p.area;
    if(window.innerWidth<=800 && state.view==='schedule')setView('both');
    renderMapUI(false);
    if(map && p.ll && pan)map.setView(p.ll,Math.max(map.getZoom(),16),{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
    if(!p.ll)toast('이 후보는 Google Maps에서 정확한 위치를 확인해요.');
  }
  function toggleBlock(id) {
    state.active=id;
    if(state.open.has(id))state.open.delete(id);else state.open.add(id);
    const b=currentBlocks().find(x=>x.id===id);
    const first=blockPlaces(b)[0];
    if(first){state.focused=first.id;if(state.scope!=='all')state.scope=first.area;}
    renderTimeline();renderMapUI(false);
    const points=blockPlaces(b).filter(p=>p.ll && (state.scope==='all'||p.area===state.scope)).map(p=>p.ll);
    if(map && points.length)map.fitBounds(L.latLngBounds(points),{padding:[50,60],maxZoom:16,animate:false});
    document.querySelector(`[data-toggle="${CSS.escape(id)}"]`)?.focus({preventScroll:true});
  }
  function setView(view) {
    state.view=view; document.body.dataset.view=view;
    document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    requestAnimationFrame(()=>{ensureMap();if(map){map.invalidateSize({pan:false});drawMap(true);}});
  }
  document.addEventListener('click',e=>{
    const day=e.target.closest('[data-day]');
    if(day){state.day=day.dataset.day;state.scope=days[state.day].scope;state.focused=state.day==='sat'?'shisendo':planned()[0]?.id;state.active=state.day==='sat'?'s-garden':currentBlocks()[0].id;state.open.clear();persist();renderDay();return;}
    const pick=e.target.closest('[data-pick]');
    if(pick){const b=currentBlocks().find(x=>x.id===pick.dataset.block);const id=pick.dataset.pick;const current=picked(b);const selected=current.includes(id);state.picks[b.id]=selected?current.filter(x=>x!==id):b.single?[id]:[...current,id];persist();renderTimeline();selectPlace(id,true);toast(selected ? places[id].name+' 선택을 취소했어요.' : places[id].name+'을(를) 일정에 담았어요.');return;}
    const branch=e.target.closest('[data-branch]');
    if(branch){state.branch=branch.dataset.branch;persist();renderTimeline();renderMapUI(true);toast(state.branch==='shopping'?'오후에 가와라마치로 이동해요.':'이치조지에서 더 여유롭게 보내요.');return;}
    const view=e.target.closest('button[data-view]');if(view){setView(view.dataset.view);$('workspace').scrollIntoView({block:'start',behavior:'instant'});return;}
    const scope=e.target.closest('[data-scope]');if(scope){state.scope=scope.dataset.scope;const first=scoped(planned())[0];if(first)state.focused=first.id;renderMapUI(true);return;}
    const mapButton=e.target.closest('[data-map]');if(mapButton){selectPlace(mapButton.dataset.map,true);return;}
    const find=e.target.closest('[data-find]');
    if(find){const b=currentBlocks().find(b=>[...b.fixed,...b.choices].includes(find.dataset.find));if(b){state.open.add(b.id);state.active=b.id;renderTimeline();if(state.view==='map')setView('schedule');$('event-'+b.id).scrollIntoView({block:'start',behavior:'smooth'});document.querySelector(`[data-toggle="${CSS.escape(b.id)}"]`)?.focus({preventScroll:true});}return;}
    const head=e.target.closest('[data-head]');if(head){toggleBlock(head.dataset.head);return;}
  });
  document.addEventListener('change',e=>{
    const target=e.target;
    if(target.matches('[data-done]')){const id=target.dataset.done;target.checked?state.done.add(id):state.done.delete(id);persist();renderTimeline();document.querySelector(`[data-done="${CSS.escape(id)}"]`)?.focus({preventScroll:true});}
    if(target.matches('[data-memo]')){target.checked?state.memo.add(target.dataset.memo):state.memo.delete(target.dataset.memo);persist();}
  });
  $('expand-all').addEventListener('click',()=>{const all=currentBlocks().every(b=>state.open.has(b.id));currentBlocks().forEach(b=>all?state.open.delete(b.id):state.open.add(b.id));renderTimeline();});
  $('fit-map').addEventListener('click',()=>{ensureMap();if(map){map.invalidateSize({pan:false});drawMap(true);}});
  $('retry-map').addEventListener('click',()=>location.reload());
  $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.origin+location.pathname);toast('여행 수첩 링크를 복사했어요.');}catch(_){toast('주소창의 링크를 복사해 주세요.');}});
  $('sources-toggle').addEventListener('click',()=>{const open=$('sources').hidden;$('sources').hidden=!open;$('sources-toggle').setAttribute('aria-expanded',String(open));});
  state.scope=days[state.day].scope;
  if(state.day!=='sat'){state.focused=planned()[0]?.id;state.active=currentBlocks()[0].id;}
  setView(window.innerWidth <= 800 ? 'both' : 'schedule');renderDay();
})();
