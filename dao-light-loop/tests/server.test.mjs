import test from 'node:test';
import assert from 'node:assert/strict';
import { createDaoServer } from '../server/app.mjs';

async function withServer(fn) {
  const server = createDaoServer({env:{}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const {port}=server.address(); const base=`http://127.0.0.1:${port}`;
  try { await fn(base); } finally { await new Promise(r=>server.close(r)); }
}

test('status endpoint reports runtime', async () => withServer(async base => {
  const r=await fetch(`${base}/api/status`); const j=await r.json();
  assert.equal(r.status,200); assert.equal(j.ok,true); assert.match(j.version,/blueprint/);
}));

test('deterministic API demo converges', async () => withServer(async base => {
  await fetch(`${base}/api/demo/reset`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({scenario:'DIM_OFFICE'})});
  const r=await fetch(`${base}/api/demo/run`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({targetMedi:250})});
  const j=await r.json(); assert.equal(r.status,200); assert.equal(j.session.result.status,'target-reached'); assert.ok(j.session.result.log.length>=2);
}));

test('physical mode refuses to fake missing hardware', async () => withServer(async base => {
  const r=await fetch(`${base}/api/demo/run`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({targetMedi:250,physical:true})});
  const j=await r.json(); assert.equal(r.status,400); assert.match(j.error,/no sample/i);
}));

test('sensor ingestion validates schema and exposes engineering state', async () => withServer(async base => {
  const sample={deviceId:'dao-v0',firmwareVersion:'0.1.0',sequence:3,gain:1,integrationMs:100,channels:{f1:100,f2:200,f3:300,f4:400,f5:500,f6:500,f7:300,f8:200,clear:700,nir:50}};
  const r=await fetch(`${base}/api/sensor`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(sample)}); assert.equal(r.status,200);
  const e=await (await fetch(`${base}/api/engineering`)).json(); assert.equal(e.sensor.device,'dao-v0'); assert.equal(e.sensor.fresh,true);
}));

test('travel endpoint returns product heuristic', async () => withServer(async base => {
  const r=await fetch(`${base}/api/travel/plan`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({originTimeZone:'America/Los_Angeles',destinationTimeZone:'Asia/Tokyo',days:3})});
  const j=await r.json(); assert.equal(j.travel.plan.length,3); assert.match(j.travel.disclaimer,/not medical/i);
}));
