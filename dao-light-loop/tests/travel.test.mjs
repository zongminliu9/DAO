import test from 'node:test';
import assert from 'node:assert/strict';
import { timezoneDeltaHours, buildTravelPlan } from '../core/travel.mjs';

test('timezone delta is plausible', () => {
  const d = timezoneDeltaHours('America/Los_Angeles','Asia/Tokyo',new Date('2026-09-27T12:00:00Z'));
  assert.ok(Math.abs(d) >= 8);
});

test('travel planner returns seek and reduce windows', () => {
  const p = buildTravelPlan({originTimeZone:'America/Los_Angeles',destinationTimeZone:'Asia/Tokyo',departureAt:'2026-09-27T12:00:00Z',days:4});
  assert.equal(p.plan.length,4); assert.ok(p.plan[0].seekLight); assert.match(p.disclaimer,/Prototype heuristic/);
});
