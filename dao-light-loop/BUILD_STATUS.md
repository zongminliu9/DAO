# Build status

_Last updated: 2026-09-27_

## Software-verified in this repository

- 19/19 Node tests passing.
- Deterministic closed-loop simulator converges to target.
- Browser dashboard runs with no npm dependencies.
- Circadian, visual-comfort and focus target modes.
- Travel timezone planner prototype.
- Exposure ledger.
- Physical sensor schema validation.
- Ten-second stale-sensor rejection.
- Manual stop, max duration, max iteration, deadband and brightness-saturation paths.
- Structured sessions with JSON / CSV export.
- Philips Hue provider implementation.
- Parametric CAD source.

## Implemented, awaiting physical verification

- ESP32-C3 + AS7341 firmware on actual board.
- AS7341 → host → controller → physical Hue → AS7341 feedback loop.
- Local Hue bridge commands on the intended demo lamp.
- Battery/current behavior.

## Engineering artifacts, not yet product-validated

- 18 × 26 mm mechanical envelope.
- Rev A rigid-flex / BLE / battery architecture.
- optical aperture/diffuser concept.
- development melanopic calibration coefficients.
- travel seek/reduce-light heuristic.

## Explicitly not claimed

- medical efficacy;
- final product accuracy;
- final battery life;
- final RF performance;
- production-ready waterproofing or thermal behavior;
- final jewelry comfort;
- jet-lag treatment efficacy.
