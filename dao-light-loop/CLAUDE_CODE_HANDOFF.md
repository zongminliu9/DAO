# Claude Code handoff — DAO Blueprint prototype

This repository is already a working funding-demo codebase. Preserve the core proof:

**SENSE → UNDERSTAND → ACT → VERIFY**

Do not replace it with a generic wellness dashboard, AI chat, cloud SaaS scaffolding or fake hardware states.

## Verified starting point

Run before making changes:

```bash
npm test
npm run demo:artifact
npm start
```

Expected software state: **19 tests pass**, the deterministic demo reaches the target, and the local dashboard exposes Consumer, Engineering and Travel product paths.

## Already implemented

- deterministic closed-loop simulator;
- time-aware Circadian / Visual Comfort / Focus modes;
- travel timezone planner prototype;
- exposure ledger;
- structured controller sessions and CSV export;
- stale-sensor rejection;
- manual stop;
- max correction duration / iteration limit / brightness saturation / deadband;
- physical sensor schema ingestion;
- engineering diagnostics;
- Hue local provider;
- ESP32-C3 + AS7341 firmware with device/version/sequence telemetry and reconnect backoff;
- calibration abstraction plus fitting utility;
- parametric CAD and Rev A architecture;
- validation matrix / use-of-funds / Blueprint build plan.

## Non-negotiable truthfulness

1. Never call simulator results physically validated.
2. Never present development melanopic coefficients as calibrated product accuracy.
3. Never claim treatment of depression, jet lag, eye damage, sleep disorders or other disease states.
4. Do not claim a final battery life until current is measured on the actual hardware.
5. Do not claim the current 18 × 26 mm CAD envelope is final jewelry size.
6. Keep secrets out of Git.

## Highest-priority next work

### P0 — physical V0

- flash ESP32-C3 firmware on real hardware;
- connect AS7341 breakout;
- verify raw channel telemetry in Engineering view;
- configure a real Hue bridge/lamp;
- record a physical sensor → lamp → sensor convergence session;
- export raw session JSON/CSV;
- update `BUILD_STATUS.md` only after physical verification.

### P0 — optical reference measurement

Create a repeatable near-eye fixture and collect simultaneous:

- DAO raw channels;
- calibrated eye-plane reference spectrum / lux / melanopic EDI;
- source type;
- angle;
- enclosure revision.

Do not tune calibration using the final held-out source set.

### P1 — Rev A electronics

After power and optics measurements:

- select spectral sensor;
- select low-power BLE SoC;
- select battery from measured current budget;
- design rigid-flex PCB;
- preserve debug/test points;
- validate antenna with intended metal/non-metal shell geometry.

### P1 — Rev B CAD

Follow `cad/REV_B_SPEC.md`. The visual product must remain jewelry-like while exposing the optical aperture and preserving RF volume. Do not build a generic electronics puck.

### P2 — pilot tooling

Add only after the physical loop is stable:

- device provisioning;
- calibration-profile version tracking;
- data-quality/occlusion flags;
- travel adherence re-planning based on measured exposure;
- battery/charge state UI.

## Definition of success

The next major milestone is not “more software.” It is a video and dataset proving:

1. a physical near-eye sensor detects low light;
2. DAO commands a real light;
3. the same physical sensor measures the changed environment;
4. the logged trace reaches/approaches the target without unsafe oscillation;
5. all limitations are documented honestly.
