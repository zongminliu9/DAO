export const SIM_SCENARIOS = Object.freeze({
  DIM_OFFICE: { label: 'Dim office', ambient: 45, brightness: 18, cct: 4000, maxLampContribution: 320 },
  BRIGHT_WINDOW: { label: 'Bright window', ambient: 240, brightness: 20, cct: 5200, maxLampContribution: 220 },
  EVENING_HOME: { label: 'Evening home', ambient: 18, brightness: 42, cct: 3000, maxLampContribution: 260 },
  AIRPLANE_CABIN: { label: 'Airplane cabin', ambient: 32, brightness: 25, cct: 4300, maxLampContribution: 150 }
});

export class SimulatedEnvironment {
  constructor({ brightness = 18, colorTemperature = 4000 } = {}) {
    this.brightness = brightness;
    this.colorTemperature = colorTemperature;
  }
  async getState() { return { brightness: this.brightness, colorTemperature: this.colorTemperature }; }
  async setBrightness(v) { this.brightness = Math.max(0, Math.min(100, Number(v))); return this.getState(); }
  async setColorTemperature(k) { this.colorTemperature = Math.max(2000, Math.min(6500, Number(k))); return this.getState(); }
}

export class SimulatedSensor {
  constructor(environment, { ambient = 45, maxLampContribution = 320, cct = 4000 } = {}) {
    this.environment = environment;
    this.ambient = ambient;
    this.maxLampContribution = maxLampContribution;
    this.cct = cct;
    this.index = 0;
  }
  async measure() {
    const b = this.environment.brightness / 100;
    const medi = this.ambient + this.maxLampContribution * Math.pow(b, 1.15);
    const wobble = [0, 1.2, -0.7, 0.4, -0.2][this.index++ % 5];
    return {
      timestamp: new Date().toISOString(),
      melanopicEdi: +(medi + wobble).toFixed(1),
      lux: +((medi + wobble) * 1.45).toFixed(1),
      cct: this.environment.colorTemperature || this.cct,
      calibratedForClaims: false,
      source: 'simulator'
    };
  }
}

export function createScenario(name = 'DIM_OFFICE') {
  const cfg = SIM_SCENARIOS[name] ?? SIM_SCENARIOS.DIM_OFFICE;
  const environment = new SimulatedEnvironment({ brightness: cfg.brightness, colorTemperature: cfg.cct });
  const sensor = new SimulatedSensor(environment, cfg);
  return { name, config: cfg, environment, sensor };
}
