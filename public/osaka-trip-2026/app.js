(() => {
  'use strict';
  const {places, days} = window.TRIP;
  const storageKey = 'weekend.osaka.2026.v1';
  let restored = {};
  try { restored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) {}
  const state = {
    day: Object.hasOwn(days, restored.day) ? restored.day : 'sat',
    branch: restored.branch === 'shopping' ? 'shopping' : 'slow',
    scope: '', focused: '', active: '', open: new Set(),
  };
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const search = p => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.query || p.ja || p.name);
  const directions = (from, to, mode = 'walking') => 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(from.query || from.name) + '&destination=' + encodeURIComponent(to.query || to.name) + '&travelmode=' + mode;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let map, markers, routeLayer, baseLayer, tileSuccess = 0, tileFailures = 0, toastTimer;
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify({day:state.day, branch:state.branch})); }
    catch (_) { toast('브라우저 저장 공간을 사용할 수 없어 이번 방문에만 반영돼요.'); }
  }
  function toast(message) {
    $('toast').textContent = message; $('toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2600);
  }
  function currentBlocks() { return days[state.day].blocks; }
  function uniquePlaces(ids) { return [...new Set(ids)].map(id => places[id]).filter(Boolean); }
  function blockPlaces(b) {
    if (b.branch) return uniquePlaces(state.branch === 'shopping' ? ['kiddy'] : ['keibunsha','nakatani']);
    if (b.id === 's-return') return uniquePlaces([(state.branch === 'shopping' ? 'kiddy' : 'enkouji'),'namba']);
    return uniquePlaces([...b.fixed, ...b.choices, ...(b.route || []), ...(b.mapIds || [])]);
  }
  function planned() {
    return uniquePlaces(currentBlocks().flatMap(b => [...b.fixed, ...(b.branch && state.branch === 'shopping' ? ['kiddy'] : [])]));
  }
  function candidates() {
    const routeIds = new Set(planned().map(p => p.id));
    return uniquePlaces(currentBlocks().flatMap(b => blockPlaces(b).map(p => p.id))).filter(p => !routeIds.has(p.id));
  }
  function scoped(list) { return list.filter(p => state.scope === 'all' || p.area === state.scope); }
  function iconHTML(name) {
    const paths = {
      plane:'M22 2 9 15m13-13-4 20-5-9L2 8 22 2Z',
      train:'M7 3h10a3 3 0 0 1 3 3v11H4V6a3 3 0 0 1 3-3ZM4 11h16M8 17l-3 4m11-4 3 4M8 14h.01M16 14h.01M12 3v8',
      bus:'M5 17V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v11H5ZM5 10h14M8 14h.01M16 14h.01M7 17v3m10-3v3M2 7v5m20-5v5',
      luggage:'M8 5V2h8v3M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2ZM9 8v8m6-8v8M7 19v3m10-3v3',
      game:'M7 7h10a4 4 0 0 1 4 3l2 8a2 2 0 0 1-3 2l-4-4H8l-4 4a2 2 0 0 1-3-2l2-8a4 4 0 0 1 4-3ZM7 10v5m-2-2h5m6-2h.01m3 3h.01',
      food:'M4 2v8a3 3 0 0 0 6 0V2M7 2v20M20 22V2c-5 3-5 12 0 12',
      bag:'M4 7h16l1 15H3L4 7ZM8 8V5a4 4 0 0 1 8 0v3',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.bag}"/></svg>`;
  }
  function photoHTML(image, className, icon = 'bag') {
    return image ? `<img class="${className}" src="./assets/${esc(image)}" alt="" data-icon="${esc(icon)}" loading="lazy" width="64" height="64">` : `<span class="${className} visual-placeholder">${iconHTML(icon)}</span>`;
  }
  function candidateHTML(id) {
    const p = places[id]; if (!p) return '';
    return `<article class="candidate">${p.image ? photoHTML(p.image,'candidate-photo') : ''}<div class="candidate-content"><h4>${esc(p.name)}</h4><p>${esc(p.desc)}</p>${p.meta ? `<p class="candidate-meta">${esc(p.meta)}</p>` : ''}<div class="candidate-actions"><button type="button" data-map="${esc(id)}">지도에서 보기</button><a href="${esc(search(p))}" target="_blank" rel="noopener noreferrer">장소 검색 ↗</a>${p.source ? `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">공식·안내 ↗</a>` : ''}${p.area === 'kyoto' && id !== 'shisendo' ? `<a href="${esc(directions(places.shisendo,p,id === 'kiddy' ? 'transit' : 'walking'))}" target="_blank" rel="noopener noreferrer">시센도에서 ${id === 'kiddy' ? '대중교통' : '도보'} ↗</a>` : ''}</div></div></article>`;
  }
  function transitHTML(t) {
    return `<section class="transport"><h4>${iconHTML(/601[03]/.test(t.title) ? 'bus' : 'train')}${esc(t.title)}</h4><ol>${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><p>${esc(t.meta)}</p><div class="transport-links">${t.links.map(([label,url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('')}</div></section>`;
  }
  function eventHTML(b) {
    const open = state.open.has(b.id);
    const photo = b.branch && state.branch === 'shopping' ? places.kiddy.image : b.image;
    const branch = b.branch ? `<div class="branch-switch" role="group" aria-label="교토 자유시간 선택"><button type="button" data-branch="slow" aria-pressed="${state.branch === 'slow'}">이치조지에 머물기</button><button type="button" data-branch="shopping" aria-pressed="${state.branch === 'shopping'}">가와라마치 쇼핑</button></div>` : '';
    const fixed = uniquePlaces(b.fixed).map(p => `<a class="fixed-place" href="${esc(search(p))}" target="_blank" rel="noopener noreferrer">${esc(p.name)} ↗</a>`).join('');
    let routeIds = b.route || [];
    if (b.id === 's-return') routeIds = blockPlaces(b).map(p => p.id);
    const route = routeIds.length > 1 && routeIds.every(id => places[id]) ? `<a href="${esc(directions(places[routeIds[0]],places[routeIds.at(-1)],b.travel))}" target="_blank" rel="noopener noreferrer">${b.travel === 'transit' ? '대중교통' : '도보'} 길찾기 ↗</a>` : '';
    return `<article class="event ${state.active === b.id ? 'active' : ''}" id="event-${esc(b.id)}" aria-labelledby="title-${esc(b.id)}"><button type="button" class="event-head" data-head="${esc(b.id)}" aria-expanded="${open}" aria-controls="body-${esc(b.id)}" aria-label="${esc(b.start+' '+b.title)} ${open ? '접기' : '상세와 후보 펼치기'}">${photoHTML(photo,'event-photo',b.icon)}<span class="event-time">${esc(b.start)}${b.end ? `<span>${esc(b.end)}</span>` : ''}</span><span class="event-meta"><span class="event-title" id="title-${esc(b.id)}">${esc(b.title)}</span><span class="event-description">${esc(b.desc)}</span></span><span class="event-toggle" aria-hidden="true">${open ? '−' : '+'}</span></button><div class="event-body" id="body-${esc(b.id)}" ${open ? '' : 'hidden'}><p class="block-info">${esc(b.detail)}</p>${fixed ? `<div class="fixed-places">${fixed}</div>` : ''}${branch}${b.choices.length ? `<div class="candidate-heading">${b.branch ? '시간이 남으면' : b.single ? '식사 후보' : '방문 후보'}<span>${b.choices.length}곳</span></div>${b.choices.map(id => candidateHTML(id)).join('')}` : ''}${(b.transit || []).map(transitHTML).join('')}${b.note ? `<p class="block-callout">${esc(b.note)}</p>` : ''}${route ? `<div class="event-actions">${route}</div>` : ''}</div></article>`;
  }
  function renderTimeline() {
    $('timeline').innerHTML = currentBlocks().map(eventHTML).join('');
    $('expand-all').textContent = currentBlocks().every(b => state.open.has(b.id)) ? '모두 접기 −' : '모두 펼치기 +';
  }
  function renderDay() {
    document.querySelectorAll('[data-day]').forEach(b => {
      const active = b.dataset.day === state.day;
      b.classList.toggle('active',active); if(active)b.setAttribute('aria-current','date');else b.removeAttribute('aria-current');
    });
    $('itinerary').setAttribute('aria-label',days[state.day].date+' 여행 타임라인');
    renderTimeline(); renderMapUI(true);
  }
  function scopeButtons() {
    const areas = new Set([...planned(),...candidates()].map(p => p.area));
    const scopes = [['kyoto','교토'],['osaka','오사카'],['seoul','한국'],['all','전체']].filter(([id]) => areas.has(id) || id === 'all');
    $('map-scope').innerHTML = scopes.map(([id,label]) => `<button type="button" data-scope="${id}" aria-pressed="${state.scope === id}">${label}</button>`).join('');
  }
  function renderSelection() {
    const p = places[state.focused];
    $('map-selection').innerHTML = p ? `<div><span class="selection-label">선택한 장소</span><strong>${esc(p.name)}</strong></div><a href="${esc(search(p))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.name)} Google Maps에서 열기">길찾기 ↗</a>` : '<span>아래 일정을 누르면 지도에서 이어져요.</span>';
  }
  function renderMapUI(fit = false) {
    scopeButtons(); renderSelection(); ensureMap(); if (map) drawMap(fit);
  }
  function ensureMap() {
    if (map) return;
    if (!window.L) { $('map-fallback').hidden = false; return; }
    map = L.map('map', {zoomControl:false,scrollWheelZoom:false,attributionControl:true}).setView([35.0437,135.791],15);
    L.control.zoom({position:'bottomright'}).addTo(map);
    baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    baseLayer.on('tileload',()=>{tileSuccess++;$('map-fallback').hidden=true;});
    baseLayer.on('tileerror',()=>{tileFailures++;if(tileSuccess===0 && tileFailures>=4)$('map-fallback').hidden=false;});
    markers=L.layerGroup().addTo(map); routeLayer=L.layerGroup().addTo(map);
    new ResizeObserver(()=>map.invalidateSize({pan:false})).observe($('map'));
  }
  function markerIcon(p, label, candidate) {
    return L.divIcon({className:'trip-marker',html:`<span class="map-pin ${candidate ? 'candidate-pin' : ''} ${state.focused === p.id ? 'highlight' : ''}">${esc(label)}</span>`,iconSize:[28,28],iconAnchor:[14,14]});
  }
  function moveTo(points, animated = true) {
    if (!map || !points.length) return;
    map.stop();
    const animate = animated && !reduced();
    if(points.length===1) {
      if(animate)map.flyTo(points[0],16,{duration:.85});else map.setView(points[0],16,{animate:false});
    } else {
      const options={paddingTopLeft:[48,68],paddingBottomRight:[48,78],maxZoom:16,duration:.85};
      if(animate)map.flyToBounds(L.latLngBounds(points),options);else map.fitBounds(L.latLngBounds(points),{...options,animate:false});
    }
  }
  function drawMap(fit) {
    markers.clearLayers(); routeLayer.clearLayers();
    const route = scoped(planned()).filter(p => p.ll), extra = scoped(candidates()).filter(p => p.ll);
    const all = [...route,...extra];
    const add = (p,i,candidate) => {
      const marker = L.marker(p.ll,{icon:markerIcon(p,candidate ? '·' : i+1,candidate),title:p.name,alt:p.name,keyboard:true,zIndexOffset:state.focused===p.id ? 1000 : candidate ? 0 : 100});
      marker.on('click',()=>selectPlace(p.id,false));
      if(state.focused===p.id)marker.bindTooltip(p.name,{permanent:true,direction:'top',offset:[0,-12],className:'marker-label'});
      marker.addTo(markers);marker.getElement()?.setAttribute('aria-label',p.name+' 지도에서 보기');
    };
    for(const area of ['kyoto','osaka']) {
      const points=route.filter(p=>p.area===area).map(p=>p.ll);
      if(points.length>1)L.polyline(points,{color:'#496957',weight:2,opacity:.75,dashArray:'4 7',interactive:false}).addTo(routeLayer);
    }
    if(state.day==='sun' && (state.scope==='seoul'||state.scope==='all')) {
      [['icn','wangsimni'],['icn','seongsu-stop','seongsu']].forEach(ids=>L.polyline(ids.map(id=>places[id].ll),{color:'#496957',weight:2,opacity:.75,dashArray:'4 7',interactive:false}).addTo(routeLayer));
    }
    if(state.day==='sat' && state.scope==='all')L.polyline([places.namba.ll,places.shisendo.ll],{color:'#8b9588',weight:1.5,opacity:.65,dashArray:'2 8',interactive:false}).addTo(routeLayer);
    route.forEach((p,i)=>add(p,i,false));extra.forEach((p,i)=>add(p,i,true));
    if(fit)moveTo(all.map(p=>p.ll),false);
  }
  function selectPlace(id, pan = true) {
    const p=places[id];if(!p)return;
    state.focused=id;
    if(state.scope!=='all' && state.scope!==p.area)state.scope=p.area;
    renderMapUI(false);
    if(p.ll && pan)moveTo([p.ll]);
    if(!p.ll)toast('이 후보는 장소 검색에서 정확한 위치를 확인해요.');
  }
  function toggleBlock(id) {
    const before = document.querySelector(`[data-head="${CSS.escape(id)}"]`);
    const beforeTop = before?.getBoundingClientRect().top;
    state.active=id;
    if(state.open.has(id))state.open.delete(id);else state.open.add(id);
    const b=currentBlocks().find(x=>x.id===id);
    const points=blockPlaces(b).filter(p=>p.ll);
    if(points.length) {
      state.focused=points[0].id;
      state.scope=points.every(p=>p.area===points[0].area) ? points[0].area : 'all';
    }
    renderTimeline();renderMapUI(false);moveTo(points.map(p=>p.ll));
    const head=document.querySelector(`[data-head="${CSS.escape(id)}"]`);
    // Keep the tapped row still while details open or close in the scroll pane.
    if(beforeTop!==undefined && head)$('itinerary').scrollTop += head.getBoundingClientRect().top-beforeTop;
    head?.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const day=e.target.closest('[data-day]');
    if(day) {
      state.day=day.dataset.day;state.scope=days[state.day].scope;state.open.clear();state.active='';
      state.focused=(state.day==='sat' ? places.shisendo : scoped(planned())[0])?.id || '';
      persist();renderDay();$('itinerary').scrollTop=0;return;
    }
    const branch=e.target.closest('[data-branch]');
    if(branch) {
      state.branch=branch.dataset.branch;persist();renderTimeline();
      const points=blockPlaces(currentBlocks().find(b=>b.branch));state.scope='kyoto';state.focused=points[0]?.id;renderMapUI(false);moveTo(points.filter(p=>p.ll).map(p=>p.ll));
      document.querySelector(`[data-branch="${state.branch}"]`)?.focus({preventScroll:true});return;
    }
    const scope=e.target.closest('[data-scope]');
    if(scope) {state.scope=scope.dataset.scope;state.focused=scoped(planned())[0]?.id||'';renderMapUI(true);document.querySelector(`[data-scope="${state.scope}"]`)?.focus({preventScroll:true});return;}
    const mapButton=e.target.closest('[data-map]');if(mapButton){selectPlace(mapButton.dataset.map);return;}
    const head=e.target.closest('[data-head]');if(head)toggleBlock(head.dataset.head);
  });
  document.addEventListener('error',e=>{
    if(e.target.matches?.('.event-photo,.candidate-photo')) {
      const old=e.target, replacement=document.createElement('span');replacement.className=old.className+' visual-placeholder';replacement.innerHTML=iconHTML(old.dataset.icon || 'bag');old.replaceWith(replacement);
    }
  },true);
  $('expand-all').addEventListener('click',()=>{const all=currentBlocks().every(b=>state.open.has(b.id));currentBlocks().forEach(b=>all?state.open.delete(b.id):state.open.add(b.id));renderTimeline();});
  $('fit-map').addEventListener('click',()=>{ensureMap();if(map){map.invalidateSize({pan:false});moveTo([...scoped(planned()),...scoped(candidates())].filter(p=>p.ll).map(p=>p.ll));}});
  $('retry-map').addEventListener('click',()=>location.reload());
  $('sources-toggle').addEventListener('click',()=>{const open=$('sources').hidden;$('sources').hidden=!open;$('sources-toggle').setAttribute('aria-expanded',String(open));});
  state.scope=days[state.day].scope;
  state.focused=(state.day==='sat' ? places.shisendo : scoped(planned())[0])?.id || '';
  renderDay();
})();
