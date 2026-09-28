# Validation matrix

This document separates **product thesis**, **current evidence** and **required proof**. Passing a software test does not count as physical validation.

| Hypothesis | Current evidence | Next experiment | Success criterion | Status |
|---|---|---|---|---|
| Closed-loop environment control converges | deterministic simulator + controller tests | AS7341 near-ear fixture controlling a real Hue lamp | target band reached repeatedly without oscillation across ≥5 lighting scenes | Software proven / physical pending |
| Ear placement approximates useful personal light exposure | mechanical + optical placement rationale | simultaneous ear-mounted DAO + calibrated eye-plane reference + wrist/chest comparators | quantify bias, RMSE and orientation sensitivity; ear must add useful information vs easier placements | Pending |
| Multispectral channels can estimate useful melanopic quantities | versioned calibration architecture | calibrated spectroradiometer dataset across daylight, warm/cool/RGB LED and mixed spectra | pre-specified held-out error threshold set before fitting | Pending |
| Optical window can be jewelry-compatible | parametric CAD and aperture zone | 3–5 diffuser/aperture geometries in printed shells | acceptable angular response + low cosmetic intrusion + repeatability | Pending |
| Rev A can fit an ear-worn volume | component-envelope CAD | selected battery + rigid-flex layout + antenna simulation/bench test | wearable mass/volume target met without RF or thermal compromise | Architecture only |
| Physical telemetry is robust | schema validation + stale-sample gate | fault injection: Wi-Fi loss, sensor unplug, reboot, stale sample | no uncontrolled lighting command; explicit failure state | Software path ready |
| Travel mode can verify adherence | timezone planner + exposure ledger | field pilot on transmeridian travelers | sensor can distinguish intended seek/reduce-light windows and trigger re-plan logic | Product-path prototype |
| Users value automatic correction over another score | closed-loop interaction demo | 15–30 qualitative/behavioral prototype sessions | users understand the correction and prefer auto-action in a defined scenario | Pending |

## Experimental discipline

- Predefine metrics before collecting validation data.
- Keep raw spectral samples and reference-instrument readings.
- Version calibration coefficients and enclosure/optical geometry together.
- Hold out spectra and participants when evaluating calibration/generalization.
- Report negative results; placement or optics should change if the data rejects the current architecture.
