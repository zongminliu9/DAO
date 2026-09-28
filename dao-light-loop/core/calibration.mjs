export const CHANNELS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "clear", "nir"];

export const DEVELOPMENT_PROFILE = Object.freeze({
  id: "dao-dev-as7341-v0",
  note: "Development-only coefficients. Replace with spectroradiometer-derived calibration before human studies or product claims.",
  darkOffsets: Object.fromEntries(CHANNELS.map((c) => [c, 0])),
  photopicCoefficients: {
    f1: 0.01, f2: 0.03, f3: 0.08, f4: 0.16, f5: 0.24,
    f6: 0.22, f7: 0.14, f8: 0.06, clear: 0.03, nir: 0.0
  },
  melanopicCoefficients: {
    f1: 0.02, f2: 0.08, f3: 0.22, f4: 0.30, f5: 0.22,
    f6: 0.10, f7: 0.04, f8: 0.01, clear: 0.01, nir: 0.0
  },
  photopicScale: 1.0,
  melanopicScale: 1.0,
  cctWarmRatio: 0.85,
  cctCoolRatio: 1.25
});

export function normalizeSample(sample) {
  const gain = Number(sample.gain ?? 1);
  const integrationMs = Number(sample.integrationMs ?? 100);
  if (!(gain > 0) || !(integrationMs > 0)) throw new Error("gain and integrationMs must be positive");
  const scale = 100 / (gain * integrationMs);
  const channels = {};
  for (const c of CHANNELS) channels[c] = Math.max(0, Number(sample.channels?.[c] ?? 0)) * scale;
  return { ...sample, gain, integrationMs, channels };
}

function weighted(channels, coeffs) {
  return CHANNELS.reduce((sum, c) => sum + (channels[c] ?? 0) * (coeffs[c] ?? 0), 0);
}

export function deriveMetrics(rawSample, profile = DEVELOPMENT_PROFILE) {
  const sample = normalizeSample(rawSample);
  const corrected = {};
  for (const c of CHANNELS) corrected[c] = Math.max(0, sample.channels[c] - (profile.darkOffsets[c] ?? 0));
  const lux = weighted(corrected, profile.photopicCoefficients) * profile.photopicScale;
  const melanopicEdi = weighted(corrected, profile.melanopicCoefficients) * profile.melanopicScale;
  const warm = corrected.f7 + corrected.f8 + 1;
  const cool = corrected.f3 + corrected.f4 + corrected.f5 + 1;
  const ratio = cool / warm;
  const cct = ratio <= profile.cctWarmRatio ? 3000 : ratio >= profile.cctCoolRatio ? 6500 : 3000 + ((ratio-profile.cctWarmRatio)/(profile.cctCoolRatio-profile.cctWarmRatio))*3500;
  return {
    timestamp: sample.timestamp ?? new Date().toISOString(),
    lux: Number(lux.toFixed(1)),
    melanopicEdi: Number(melanopicEdi.toFixed(1)),
    cct: Math.round(cct),
    channels: corrected,
    calibrationProfile: profile.id,
    calibratedForClaims: false
  };
}
