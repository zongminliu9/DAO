# Contributing

This prototype prioritizes inspectable engineering over feature count.

Before opening a change:

```bash
npm test
npm run demo:artifact
```

Changes that affect calibration, sensor geometry, control behavior or product claims must update the relevant docs and tests. Never turn simulated behavior into a physical-validation claim.
