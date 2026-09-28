export const ControllerReason = Object.freeze({
  TARGET_REACHED: 'target-reached',
  MAX_ITERATIONS: 'max-iterations',
  MAX_DURATION: 'max-duration',
  SENSOR_STALE: 'sensor-stale',
  MANUAL_STOP: 'manual-stop',
  ENVIRONMENT_ERROR: 'environment-error'
});

export function computeControl({ measured, target, brightness, kp = 0.18, deadband = 8, minBrightness = 5, maxBrightness = 100, maxStep = 20 }) {
  const error = target - measured;
  if (Math.abs(error) <= deadband) return { action: 'hold', error, nextBrightness: brightness, delta: 0 };
  const delta = Math.max(-maxStep, Math.min(maxStep, kp * error));
  const nextBrightness = Math.max(minBrightness, Math.min(maxBrightness, brightness + delta));
  return {
    action: nextBrightness > brightness ? 'increase' : 'decrease',
    error: +error.toFixed(2),
    nextBrightness: +nextBrightness.toFixed(1),
    delta: +(nextBrightness - brightness).toFixed(1)
  };
}

export async function runClosedLoop({
  sensor,
  environment,
  target,
  maxIterations = 10,
  maxDurationMs = 30000,
  minCommandIntervalMs = 0,
  settleMs = 0,
  deadband = 8,
  isStopped = () => false,
  validateMeasurement = () => true,
  onIteration = () => {}
}) {
  const startedAt = Date.now();
  const log = [];
  let lastCommandAt = 0;

  for (let i = 0; i < maxIterations; i++) {
    if (isStopped()) return { status: ControllerReason.MANUAL_STOP, log, final: log.at(-1) ?? null };
    if (Date.now() - startedAt > maxDurationMs) return { status: ControllerReason.MAX_DURATION, log, final: log.at(-1) ?? null };

    const measurement = await sensor.measure();
    if (!validateMeasurement(measurement)) return { status: ControllerReason.SENSOR_STALE, log, final: log.at(-1) ?? null };

    const state = await environment.getState();
    const control = computeControl({ measured: measurement.melanopicEdi, target, brightness: state.brightness, deadband });
    const row = {
      iteration: i + 1,
      timestamp: new Date().toISOString(),
      measured: measurement.melanopicEdi,
      lux: measurement.lux ?? null,
      cct: measurement.cct ?? null,
      target,
      brightnessBefore: state.brightness,
      ...control
    };

    if (control.action !== 'hold') {
      const wait = Math.max(0, minCommandIntervalMs - (Date.now() - lastCommandAt));
      if (wait) await new Promise(r => setTimeout(r, wait));
      try {
        await environment.setBrightness(control.nextBrightness);
        lastCommandAt = Date.now();
      } catch (error) {
        row.environmentError = error.message;
        log.push(row);
        await onIteration(row);
        return { status: ControllerReason.ENVIRONMENT_ERROR, log, final: row };
      }
    }

    log.push(row);
    await onIteration(row);
    if (control.action === 'hold') return { status: ControllerReason.TARGET_REACHED, log, final: row };
    if (settleMs > 0) await new Promise(r => setTimeout(r, settleMs));
  }
  return { status: ControllerReason.MAX_ITERATIONS, log, final: log.at(-1) ?? null };
}
