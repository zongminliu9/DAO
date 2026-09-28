# Reviewer guide

## If you have 30 seconds

1. Read the first screen of `README.md`.
2. Watch `assets/closed-loop-demo.gif`.
3. Look at `assets/exploded-engineering.svg`.

You should understand the thesis: **ear-worn spectral sensing that changes the environment and verifies the correction.**

## If you have 3 minutes

```bash
npm test
npm start
```

Open `http://localhost:8787`, run the loop, then open the Engineering and Travel tabs.

## If you have 10 minutes

Read:

- `docs/VALIDATION_MATRIX.md`
- `hardware/REV_A_ARCHITECTURE.md`
- `docs/BLUEPRINT_BUILD_PLAN.md`
- `BUILD_STATUS.md`

Those four documents separate what already works from what Blueprint resources would turn into a physically validated EVT wearable.

## Hard technical questions we expect

**Why ear instead of wrist?**  
Because the engineering hypothesis is better approximation to eye-plane personal exposure while preserving wearability. It is not yet treated as proven; the validation matrix defines the comparator experiment.

**Why not just an app?**  
An app can schedule light but cannot directly verify the user's actual exposure. DAO's core product claim is closed-loop measurement + environmental action + verification.

**Is melanopic EDI real in the prototype?**  
The software supports an estimated metric behind a versioned calibration layer. The included development coefficients are not an accuracy claim. Real calibration requires a reference spectroradiometer and held-out validation.

**Is the jewelry size solved?**  
No. The repo has an engineering volume study and Rev A partition. Battery, RF, optical stack and clip mechanics are intentionally not frozen before measurement.

**What would the program change?**  
It converts a functioning system architecture into physical-loop data, Rev A electronics, calibrated optics and a wearable EVT pilot.
