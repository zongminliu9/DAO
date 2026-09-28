import test from "node:test";import assert from "node:assert/strict";import {targetForHour} from "../core/circadian.mjs";
test("morning target is high",()=>assert.equal(targetForHour(7).target,250));
test("night target is low",()=>assert.equal(targetForHour(1).target,5));
test("focus mode is explicit",()=>assert.equal(targetForHour(22,"focus").target,300));