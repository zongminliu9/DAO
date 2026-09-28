import { CHANNELS } from './calibration.mjs';

export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export function validateSensorSample(sample) {
  if (!sample || typeof sample !== 'object') throw new ValidationError('sample must be an object');
  const gain = Number(sample.gain ?? 1);
  const integrationMs = Number(sample.integrationMs ?? 100);
  if (!Number.isFinite(gain) || gain <= 0) throw new ValidationError('gain must be positive');
  if (!Number.isFinite(integrationMs) || integrationMs <= 0 || integrationMs > 10000) {
    throw new ValidationError('integrationMs must be between 0 and 10000');
  }
  if (!sample.channels || typeof sample.channels !== 'object') throw new ValidationError('channels are required');

  const channels = {};
  for (const c of CHANNELS) {
    const value = Number(sample.channels[c]);
    if (!Number.isFinite(value) || value < 0) throw new ValidationError(`channel ${c} must be a non-negative number`);
    channels[c] = value;
  }

  return {
    deviceId: String(sample.deviceId ?? 'unknown-device').slice(0, 96),
    sequence: Number.isFinite(Number(sample.sequence)) ? Number(sample.sequence) : null,
    firmwareVersion: String(sample.firmwareVersion ?? 'unknown').slice(0, 48),
    timestamp: sample.timestamp ?? new Date().toISOString(),
    gain,
    integrationMs,
    channels,
    batteryPercent: sample.batteryPercent == null ? null : Math.max(0, Math.min(100, Number(sample.batteryPercent)))
  };
}

export function isFresh(timestamp, maxAgeMs = 10000, now = Date.now()) {
  const t = new Date(timestamp).getTime();
  return Number.isFinite(t) && now - t <= maxAgeMs && now - t >= -5000;
}
