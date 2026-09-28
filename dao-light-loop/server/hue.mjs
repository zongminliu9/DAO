export class HueEnvironment {
  constructor({ bridgeIp, username, lightId, fetchImpl = fetch }) {
    if (!bridgeIp || !username || !lightId) {
      throw new Error('Hue config missing: HUE_BRIDGE_IP, HUE_USERNAME, HUE_LIGHT_ID are required');
    }
    this.bridgeIp = bridgeIp;
    this.username = username;
    this.lightId = String(lightId);
    this.fetchImpl = fetchImpl;
    this.last = { brightness: 50, colorTemperature: 4000 };
  }
  get url() { return `http://${this.bridgeIp}/api/${this.username}/lights/${this.lightId}/state`; }
  async getState() { return { ...this.last, provider: 'philips-hue' }; }
  async command(body) {
    const res = await this.fetchImpl(this.url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Hue HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.some(x => x.error)) throw new Error(`Hue error: ${JSON.stringify(data)}`);
    return data;
  }
  async setBrightness(percent) {
    const p = Math.max(0, Math.min(100, Number(percent)));
    const bri = Math.max(1, Math.round((p / 100) * 254));
    await this.command({ on: true, bri, transitiontime: 5 });
    this.last.brightness = p;
    return this.getState();
  }
  async setColorTemperature(kelvin) {
    const k = Math.max(2000, Math.min(6500, Number(kelvin)));
    const ct = Math.round(1_000_000 / k);
    await this.command({ on: true, ct, transitiontime: 5 });
    this.last.colorTemperature = k;
    return this.getState();
  }
}
