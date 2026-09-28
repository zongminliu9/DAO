# Calibration plan

The multispectral sensor does **not** natively output a trustworthy melanopic EDI value. V0 therefore separates raw sensor capture from the calibration transform.

## Required production calibration

1. Mount the final diffuser/aperture/sensor stack in the intended enclosure.
2. Place the device in the same eye-plane geometry used by the reference instrument.
3. Record simultaneous reference spectral irradiance and raw device channels across daylight, warm LED, cool LED, RGB/multichannel LED, fluorescent where relevant, and mixed spectra.
4. Sweep useful intensities and incidence angles.
5. Fit coefficients on a training set and report error on held-out spectra.
6. Repeat across multiple production units to quantify unit-to-unit spread.
7. Freeze a versioned calibration profile in firmware/application metadata.

`core/calibration.mjs` ships only with `dao-dev-as7341-v0`, a deterministic development transform for software integration and demos.
