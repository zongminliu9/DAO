# V0 electrical schematic (logical)

```mermaid
flowchart LR
  USB[USB / LiPo] --> ESP[ESP32-C3]
  ESP <-->|I2C SDA/SCL + 3V3/GND| AS[AS7341 spectral sensor]
  ESP -->|Wi-Fi HTTP POST| HOST[DAO local prototype server]
  HOST -->|local Hue API| HUE[Philips Hue bridge + lamp]
  HUE --> LIGHT[changed ambient light]
  LIGHT --> AS
```

## V0 wiring

The exact GPIO numbers depend on the ESP32-C3 board. Use its default I2C pins or set `Wire.begin(SDA, SCL)` explicitly. Both boards must share ground. Confirm the breakout board voltage requirements before connecting power.

## Rev A partition

- Sensor PCB: optical sensor immediately behind diffuser/aperture.
- Main rigid section: BLE SoC, power management, optional IMU.
- Battery: behind-ear or lower jewelry volume, separated from the optical aperture.
- RF keep-out: no continuous metal enclosure around the antenna region.
