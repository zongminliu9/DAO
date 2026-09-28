import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveMetrics } from '../core/calibration.mjs';
import { buildTarget } from '../core/circadian.mjs';
import { runClosedLoop } from '../core/controller.mjs';
import { createScenario, SIM_SCENARIOS } from '../core/simulator.mjs';
import { validateSensorSample, isFresh, ValidationError } from '../core/validation.mjs';
import { ExposureLedger } from '../core/exposure.mjs';
import { buildTravelPlan } from '../core/travel.mjs';
import { HueEnvironment } from './hue.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const WEB = join(ROOT, 'web');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.json': 'application/json'
};

function json(res, status, obj, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(obj));
}
async function parseBody(req, limit = 512_000) {
  let s = '';
  for await (const c of req) {
    s += c;
    if (s.length > limit) throw new ValidationError('request body too large');
  }
  if (!s) return {};
  try { return JSON.parse(s); } catch { throw new ValidationError('invalid JSON body'); }
}
function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}
function sessionCsv(session) {
  const columns = ['iteration','timestamp','measured','lux','cct','target','brightnessBefore','action','error','nextBrightness','delta','environmentError'];
  return [columns.join(','), ...session.result.log.map(row => columns.map(k => csvEscape(row[k])).join(','))].join('\n');
}

export function createDaoServer({ env = process.env } = {}) {
  const state = {
    startedAt: new Date().toISOString(),
    latestPhysical: null,
    stopRequested: false,
    scenario: createScenario('DIM_OFFICE'),
    ledger: new ExposureLedger(),
    sessions: new Map(),
    sessionOrder: []
  };
  const hueConfigured = () => Boolean(env.HUE_BRIDGE_IP && env.HUE_USERNAME && env.HUE_LIGHT_ID);
  const physicalSensor = () => ({
    measure: async () => {
      if (!state.latestPhysical) throw new Error('No physical sensor sample received yet');
      return state.latestPhysical.metrics;
    }
  });
  const hue = () => new HueEnvironment({ bridgeIp: env.HUE_BRIDGE_IP, username: env.HUE_USERNAME, lightId: env.HUE_LIGHT_ID });
  const newSessionId = () => `dao-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const rememberSession = session => {
    state.sessions.set(session.id, session); state.sessionOrder.unshift(session.id);
    if (state.sessionOrder.length > 50) state.sessions.delete(state.sessionOrder.pop());
  };

  return http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      if (req.method === 'GET' && u.pathname === '/api/status') {
        const mode = u.searchParams.get('mode') || 'circadian';
        const latest = state.latestPhysical;
        return json(res, 200, {
          ok: true,
          version: '0.2.0-blueprint',
          uptimeSeconds: Math.round((Date.now() - new Date(state.startedAt).getTime()) / 1000),
          hueConfigured: hueConfigured(),
          physicalSensorSeen: Boolean(latest),
          physicalSensorFresh: latest ? isFresh(latest.receivedAt) : false,
          latestPhysical: latest,
          target: buildTarget({ mode }),
          exposure24h: state.ledger.summary(24),
          scenario: { name: state.scenario.name, ...state.scenario.config },
          scenarios: SIM_SCENARIOS,
          lastSession: state.sessionOrder[0] ? state.sessions.get(state.sessionOrder[0]) : null
        });
      }

      if (req.method === 'GET' && u.pathname === '/api/engineering') {
        const latest = state.latestPhysical;
        return json(res, 200, {
          ok: true,
          sensor: latest ? {
            receivedAt: latest.receivedAt,
            fresh: isFresh(latest.receivedAt),
            ageMs: Date.now() - new Date(latest.receivedAt).getTime(),
            device: latest.sample.deviceId,
            firmwareVersion: latest.sample.firmwareVersion,
            sequence: latest.sample.sequence,
            gain: latest.sample.gain,
            integrationMs: latest.sample.integrationMs,
            batteryPercent: latest.sample.batteryPercent,
            channels: latest.sample.channels,
            metrics: latest.metrics
          } : null,
          hueConfigured: hueConfigured(),
          controllerStopRequested: state.stopRequested,
          sessions: state.sessionOrder.slice(0, 10).map(id => state.sessions.get(id))
        });
      }

      if (req.method === 'POST' && u.pathname === '/api/sensor') {
        const validated = validateSensorSample(await parseBody(req));
        const metrics = deriveMetrics(validated);
        metrics.timestamp = new Date().toISOString();
        state.latestPhysical = { receivedAt: metrics.timestamp, sample: validated, metrics };
        state.ledger.add(metrics, { durationMinutes: 2 / 60, source: validated.deviceId });
        return json(res, 200, { ok: true, metrics, calibrationWarning: 'development estimate; not production calibrated' });
      }

      if (req.method === 'POST' && u.pathname === '/api/demo/reset') {
        const p = await parseBody(req);
        state.scenario = createScenario(p.scenario || 'DIM_OFFICE');
        state.stopRequested = false;
        return json(res, 200, { ok: true, scenario: state.scenario.name });
      }

      if (req.method === 'POST' && u.pathname === '/api/controller/stop') {
        state.stopRequested = true;
        return json(res, 200, { ok: true, stopped: true });
      }

      if (req.method === 'POST' && u.pathname === '/api/demo/run') {
        const p = await parseBody(req);
        state.stopRequested = false;
        const mode = p.mode || 'circadian';
        const target = Number(p.targetMedi || buildTarget({ mode }).targetMedi || 250);
        if (!Number.isFinite(target) || target < 0 || target > 2000) throw new ValidationError('targetMedi must be between 0 and 2000');
        const usePhysical = Boolean(p.physical);
        const useHue = Boolean(p.hue);
        if (usePhysical && !state.latestPhysical) throw new ValidationError('physical sensor requested but no sample has been received');
        if (usePhysical && !isFresh(state.latestPhysical.receivedAt)) throw new ValidationError('physical sensor sample is stale (>10s)');
        if (useHue && !hueConfigured()) throw new ValidationError('Hue requested but bridge credentials are not configured');

        const sensor = usePhysical ? physicalSensor() : state.scenario.sensor;
        const environment = useHue ? hue() : state.scenario.environment;
        const id = newSessionId();
        const startedAt = new Date().toISOString();
        const result = await runClosedLoop({
          sensor, environment, target,
          maxIterations: Math.min(20, Number(p.maxIterations || 10)),
          maxDurationMs: Math.min(120000, Number(p.maxDurationMs || 30000)),
          minCommandIntervalMs: useHue ? 750 : 0,
          deadband: 8,
          settleMs: useHue ? 900 : 0,
          isStopped: () => state.stopRequested,
          validateMeasurement: m => !usePhysical || isFresh(m.timestamp)
        });
        const session = {
          id, startedAt, completedAt: new Date().toISOString(), mode, target,
          sensorProvider: usePhysical ? 'physical' : `simulator:${state.scenario.name}`,
          environmentProvider: useHue ? 'philips-hue' : 'simulator',
          result,
          environment: await environment.getState()
        };
        rememberSession(session);
        for (const row of result.log) state.ledger.add({ timestamp: row.timestamp, melanopicEdi: row.measured, lux: row.lux, cct: row.cct }, { durationMinutes: 0.25, source: 'controller-session' });
        return json(res, 200, { ok: true, session });
      }

      if (req.method === 'GET' && u.pathname === '/api/sessions') {
        return json(res, 200, { ok: true, sessions: state.sessionOrder.map(id => state.sessions.get(id)) });
      }
      if (req.method === 'GET' && u.pathname.startsWith('/api/sessions/')) {
        const suffix = u.pathname.slice('/api/sessions/'.length);
        const csv = suffix.endsWith('.csv');
        const id = csv ? suffix.slice(0, -4) : suffix;
        const session = state.sessions.get(id);
        if (!session) return json(res, 404, { ok: false, error: 'session not found' });
        if (csv) {
          res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${id}.csv"` });
          return res.end(sessionCsv(session));
        }
        return json(res, 200, { ok: true, session });
      }

      if (req.method === 'POST' && u.pathname === '/api/travel/plan') {
        const p = await parseBody(req);
        if (!p.originTimeZone || !p.destinationTimeZone) throw new ValidationError('originTimeZone and destinationTimeZone are required');
        return json(res, 200, { ok: true, travel: buildTravelPlan(p) });
      }

      if (req.method === 'POST' && u.pathname === '/api/hue/test') {
        if (!hueConfigured()) return json(res, 400, { ok: false, error: 'Hue is not configured in environment variables.' });
        const h = hue(); await h.setBrightness(35); await h.setColorTemperature(4200);
        return json(res, 200, { ok: true, state: await h.getState() });
      }

      if (req.method !== 'GET') { res.writeHead(405); return res.end('Method Not Allowed'); }
      let path = u.pathname === '/' ? '/index.html' : u.pathname;
      path = decodeURIComponent(path);
      if (path.includes('..')) { res.writeHead(403); return res.end('Forbidden'); }
      path = path.replace(/^\/+/, '');
      const file = join(WEB, path);
      if (!file.startsWith(WEB)) { res.writeHead(403); return res.end('Forbidden'); }
      const data = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch (error) {
      if (error?.code === 'ENOENT') { res.writeHead(404); return res.end('Not found'); }
      const status = error instanceof ValidationError ? 400 : 500;
      return json(res, status, { ok: false, error: error.message, details: error.details ?? undefined });
    }
  });
}
