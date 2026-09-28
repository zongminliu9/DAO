import test from 'node:test';
import assert from 'node:assert/strict';
import { ExposureLedger } from '../core/exposure.mjs';

test('exposure ledger accumulates dose', () => {
  const l = new ExposureLedger();
  l.add({timestamp:new Date().toISOString(),melanopicEdi:120,lux:200,cct:4000},{durationMinutes:30});
  const s = l.summary(24);
  assert.equal(s.sampleCount,1); assert.equal(s.melanopicDose,60);
});
