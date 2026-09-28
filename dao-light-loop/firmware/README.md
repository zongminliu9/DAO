# DAO V0 firmware

Target: ESP32-C3 + AS7341 breakout board.

## Build

```bash
cp include/secrets.h.example include/secrets.h
# edit Wi-Fi and DAO_SERVER_URL
pio run
pio run -t upload
pio device monitor
```

The firmware sends versioned raw spectral telemetry every two seconds. The host validates the schema, applies the development calibration profile and rejects stale samples in physical closed-loop mode.

## Telemetry envelope

```json
{
  "deviceId": "dao-v0-esp32c3",
  "firmwareVersion": "0.2.0",
  "sequence": 17,
  "gain": 4,
  "integrationMs": 100,
  "channels": {"f1":0,"f2":0,"f3":0,"f4":0,"f5":0,"f6":0,"f7":0,"f8":0,"clear":0,"nir":0}
}
```

## Production direction

The V0 Wi-Fi architecture is intentionally development-friendly. Rev A moves toward a low-power BLE SoC, rigid-flex PCB, small LiPo, controlled diffuser/aperture and a jewelry enclosure with an RF-transparent antenna region.
