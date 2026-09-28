# Blueprint build plan

Goal: leave the program with a **physically validated EVT wearable**, not merely a more polished app.

## Gate 0 — already complete before program

- deterministic closed-loop runtime;
- physical sensor ingestion API;
- Hue provider;
- ESP32-C3 + AS7341 firmware architecture;
- calibration abstraction;
- engineering CAD envelope;
- automated tests and CI;
- explicit validation matrix.

## Weeks 1–2 — close the real loop

Ship a bench/near-ear fixture that performs:

**physical sensor → host → controller → physical lamp → physical sensor verification**.

Deliverables:

- raw logs from ≥5 lighting scenes;
- stale-sensor and lamp-error fault-injection video;
- first eye-plane reference comparison;
- power/current measurements from the V0 sensor node.

**Gate:** no miniaturization work proceeds until the physical loop is repeatable.

## Weeks 3–4 — optics sprint

Build diffuser/aperture variants and quantify:

- angular response;
- enclosure shadowing;
- hair/ear/orientation sensitivity;
- repeatability;
- daylight vs artificial spectra response.

**Gate:** freeze an optical stack only after measured data.

## Weeks 5–6 — Rev A rigid-flex electronics

- low-power BLE SoC;
- selected spectral sensor;
- battery + PMIC;
- charge contacts;
- optional wear-state IMU;
- antenna keep-out;
- debug/programming access.

Deliver assembled Rev A boards and measured current profile.

## Weeks 7–8 — calibration + jewelry mechanics

- spectroradiometer dataset;
- fit/version calibration profile;
- held-out error analysis;
- shell/clip comfort iterations;
- RF test in final-ish metal/non-metal geometry.

## Weeks 9–10 — pilot + DFM decision

Run a small internal pilot covering:

- morning/day/evening daily use;
- office/window/commute transitions;
- one travel-oriented field protocol if logistics permit;
- battery/charge behavior;
- occlusion and data-quality flags.

Finish with a DFM decision package:

- locked vs unresolved components;
- Rev B changes;
- measured risk register;
- manufacturing path and pilot-unit plan.

## End-of-program artifact

A reviewer should be able to hold a wearable unit, dim the environment, watch a real lamp respond, and inspect the logged sensor trace that verifies the correction.
