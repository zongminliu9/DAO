const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let currentTarget = 250;
let lastStatus = null;

async function api(path, options = {}) {
  const res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const json = await res.json();
  if (!res.ok || json.ok === false) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}
function pct(v, target) { return target > 0 ? Math.max(0, Math.min(140, (v / target) * 100)) : 0; }
function setRing(p) {
  const capped = Math.max(0, Math.min(100, p));
  $('#ring').style.setProperty('--p', `${capped}%`);
  $('#ringValue').textContent = `${Math.round(p)}%`;
}
function providerWarning(message = '') {
  $('#providerWarning').textContent = message;
  $('#providerWarning').classList.toggle('hidden', !message);
}
function draw(log, target) {
  const svg = $('#plot'); svg.innerHTML = '';
  const W = 1000, H = 300, pad = 30;
  const vals = log.map(x => x.measured);
  const max = Math.max(target, ...vals, 10) * 1.18;
  const x = i => pad + i * ((W - pad * 2) / Math.max(1, log.length - 1));
  const y = v => H - pad - (v / max) * (H - pad * 2);
  const ns = 'http://www.w3.org/2000/svg';
  const targetLine = document.createElementNS(ns, 'line');
  Object.entries({ x1: pad, x2: W - pad, y1: y(target), y2: y(target), stroke: '#d6b98c', 'stroke-dasharray': '8 8', 'stroke-width': 2 }).forEach(([k,v]) => targetLine.setAttribute(k,v));
  svg.append(targetLine);
  if (log.length > 1) {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', log.map((d,i) => `${i ? 'L' : 'M'} ${x(i)} ${y(d.measured)}`).join(' '));
    path.setAttribute('fill','none'); path.setAttribute('stroke','#dce6c4'); path.setAttribute('stroke-width','4'); path.setAttribute('stroke-linecap','round');
    svg.append(path);
  }
  log.forEach((d,i) => {
    const c = document.createElementNS(ns,'circle'); c.setAttribute('cx',x(i)); c.setAttribute('cy',y(d.measured)); c.setAttribute('r','6'); c.setAttribute('fill','#dce6c4'); svg.append(c);
  });
}
function renderChannels(channels) {
  const wrap = $('#channels'); wrap.innerHTML = '';
  if (!channels) { wrap.innerHTML = '<span style="color:#6f746c;font-size:11px">waiting for physical telemetry</span>'; return; }
  const entries = Object.entries(channels); const max = Math.max(...entries.map(([,v]) => Number(v)), 1);
  for (const [name, value] of entries) {
    const el = document.createElement('div'); el.className = 'channel';
    el.innerHTML = `<i style="height:${Math.max(2,(Number(value)/max)*54)}px"></i><span>${name}</span>`; wrap.append(el);
  }
}
async function refresh() {
  try {
    const mode = $('#mode').value;
    const s = await api(`/api/status?mode=${encodeURIComponent(mode)}`);
    lastStatus = s; currentTarget = s.target.targetMedi;
    $('#target').textContent = Math.round(currentTarget); $('#targetLabel').textContent = `${s.target.label} · ${s.target.rationale}`;
    $('#runtimeDot').classList.add('good'); $('#status').textContent = `runtime online · v${s.version}`;
    $('#sensorState').textContent = s.physicalSensorSeen ? (s.physicalSensorFresh ? 'Physical sensor live' : 'Physical sensor stale') : 'Simulator ready';
    $('#sensorDetail').textContent = s.physicalSensorSeen ? `Last physical sample ${s.physicalSensorFresh ? 'is fresh' : 'is older than 10s'}.` : 'No physical sample received in this runtime.';
    $('#hueState').textContent = s.hueConfigured ? 'Hue configured' : 'Simulator ready';
    $('#hueDetail').textContent = s.hueConfigured ? 'Local bridge credentials are present for physical environment control.' : 'Hue remains disabled until local bridge credentials exist.';
    renderChannels(s.latestPhysical?.sample?.channels);
    if (s.lastSession) $('#sessionMeta').textContent = `${s.lastSession.result.status} · ${s.lastSession.sensorProvider} → ${s.lastSession.environmentProvider}`;
  } catch (e) {
    $('#runtimeDot').classList.remove('good'); $('#status').textContent = 'runtime offline';
  }
}

$('#mode').addEventListener('change', refresh);
$('#sensorProvider').addEventListener('change', () => {
  if ($('#sensorProvider').value === 'physical' && !lastStatus?.physicalSensorFresh) providerWarning('Physical sensor mode requires a fresh sample within the last 10 seconds.'); else providerWarning();
});
$('#environmentProvider').addEventListener('change', () => {
  if ($('#environmentProvider').value === 'hue' && !lastStatus?.hueConfigured) providerWarning('Philips Hue mode requires local bridge credentials on the server.'); else providerWarning();
});
$('#stop').onclick = async () => { try { await api('/api/controller/stop',{method:'POST',body:'{}'}); $('#action').textContent='Manual stop requested.'; } catch(e){ providerWarning(e.message); } };

$('#run').onclick = async () => {
  const btn = $('#run'); providerWarning(); btn.disabled = true; btn.textContent = 'Running loop…';
  try {
    await api('/api/demo/reset',{method:'POST',body:JSON.stringify({scenario:$('#scenario').value})});
    $('#action').textContent = 'DAO detected a light deficit. Correcting the environment…'; draw([],currentTarget);
    const payload = {
      mode: $('#mode').value, targetMedi: currentTarget,
      physical: $('#sensorProvider').value === 'physical', hue: $('#environmentProvider').value === 'hue'
    };
    const j = await api('/api/demo/run',{method:'POST',body:JSON.stringify(payload)});
    const log = j.session.result.log;
    for (let i=0;i<log.length;i++) {
      const row = log[i], visible = log.slice(0,i+1); draw(visible,currentTarget);
      const p = pct(row.measured,currentTarget); $('#now').textContent = Math.round(row.measured); setRing(p);
      $('#brightness').textContent = `${Math.round(row.nextBrightness)}%`; $('#bar').style.width = `${Math.max(0,Math.min(100,row.nextBrightness))}%`;
      $('#action').textContent = row.action === 'hold' ? 'Environment corrected ✓' : `DAO is correcting your environment · ${row.action} light`;
      await new Promise(r=>setTimeout(r,360));
    }
    $('#sessionMeta').textContent = `${j.session.result.status} · ${j.session.sensorProvider} → ${j.session.environmentProvider} · ${log.length} iterations`;
    await refresh();
  } catch(e) { providerWarning(e.message); $('#action').textContent = 'Controller did not start.'; }
  finally { btn.disabled = false; btn.textContent = 'Run Closed Loop Demo'; }
};

$$('.tab').forEach(btn => btn.onclick = () => {
  $$('.tab').forEach(x=>x.classList.remove('active')); $$('.tabPane').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); $(`#tab-${btn.dataset.tab}`).classList.add('active');
});

$('#planTravel').onclick = async () => {
  const out = $('#travelResult'); out.innerHTML = '<div class="travelSummary">Generating…</div>';
  try {
    const j = await api('/api/travel/plan',{method:'POST',body:JSON.stringify({originTimeZone:$('#originTz').value,destinationTimeZone:$('#destTz').value,days:Number($('#travelDays').value)})});
    const t = j.travel;
    out.innerHTML = `<div class="travelSummary">${t.direction} · ${t.timezoneDeltaHours >= 0 ? '+' : ''}${t.timezoneDeltaHours}h · prototype heuristic, not medical guidance</div>` + t.plan.map(d=>`<div class="travelDay"><strong>Day ${d.day}</strong><span>Seek light: ${d.seekLight}</span><span>Reduce light: ${d.reduceLight}</span><span>Progressive shift: ${d.progressiveShiftHours}h</span></div>`).join('');
  } catch(e) { out.innerHTML = `<div class="travelSummary" style="color:#df8d83">${e.message}</div>`; }
};

refresh(); setInterval(refresh,5000);
