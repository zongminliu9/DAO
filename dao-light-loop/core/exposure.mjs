export class ExposureLedger {
  constructor({ maxSamples = 10000 } = {}) {
    this.maxSamples = maxSamples;
    this.samples = [];
  }

  add(metrics, { durationMinutes = 1, source = 'sensor' } = {}) {
    const row = {
      timestamp: metrics.timestamp ?? new Date().toISOString(),
      melanopicEdi: Number(metrics.melanopicEdi ?? 0),
      lux: Number(metrics.lux ?? 0),
      cct: Number(metrics.cct ?? 0),
      durationMinutes: Math.max(0, Number(durationMinutes)),
      source
    };
    this.samples.push(row);
    if (this.samples.length > this.maxSamples) this.samples.splice(0, this.samples.length - this.maxSamples);
    return row;
  }

  clear() { this.samples = []; }

  since(hours = 24, now = Date.now()) {
    const cutoff = now - hours * 3600_000;
    return this.samples.filter(x => new Date(x.timestamp).getTime() >= cutoff);
  }

  summary(hours = 24, now = Date.now()) {
    const rows = this.since(hours, now);
    const dose = rows.reduce((sum, r) => sum + r.melanopicEdi * (r.durationMinutes / 60), 0);
    const byPeriod = { morning: 0, daytime: 0, evening: 0, night: 0 };
    for (const r of rows) {
      const h = new Date(r.timestamp).getHours();
      const d = r.melanopicEdi * (r.durationMinutes / 60);
      if (h >= 6 && h < 9) byPeriod.morning += d;
      else if (h >= 9 && h < 17) byPeriod.daytime += d;
      else if (h >= 17 && h < 22) byPeriod.evening += d;
      else byPeriod.night += d;
    }
    for (const k of Object.keys(byPeriod)) byPeriod[k] = +byPeriod[k].toFixed(1);
    return { sampleCount: rows.length, melanopicDose: +dose.toFixed(1), byPeriod };
  }
}
