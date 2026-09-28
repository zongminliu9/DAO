import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSensorSample, isFresh } from '../core/validation.mjs';

const channels = { f1:1,f2:2,f3:3,f4:4,f5:5,f6:6,f7:7,f8:8,clear:9,nir:10 };

test('sensor schema accepts complete sample', () => {
  const s = validateSensorSample({ gain:4, integrationMs:100, channels, deviceId:'dao-v0' });
  assert.equal(s.deviceId,'dao-v0'); assert.equal(s.channels.f8,8);
});

test('sensor schema rejects missing spectral channels', () => {
  assert.throws(() => validateSensorSample({ gain:1, integrationMs:100, channels:{f1:1} }), /channel f2/);
});

test('freshness gate rejects old data', () => {
  assert.equal(isFresh(new Date(Date.now()-11000).toISOString(),10000),false);
  assert.equal(isFresh(new Date().toISOString(),10000),true);
});
