# Rev A wearable architecture

Rev A is the first miniaturized **engineering wearable**, not final mass-production jewelry.

## Functional partition

```text
FRONT / WORLD
      │
      ▼
[optical window]
      │
[diffuser + aperture]
      │
[spectral sensor] ────── short rigid/flex optical island
      │ I²C
      ▼
[BLE SoC] ─ [optional IMU]
      │
[PMIC / charger] ─ [LiPo]
      │
[charge contacts]

RF antenna zone → intentionally kept away from continuous metal coverage
```

## Why separate optical and radio volumes

The sensor wants a stable forward-facing optical field. The antenna wants RF-transparent volume. The battery wants thickness and safe mechanical support. Treating all three as one decorative metal puck creates avoidable optical, RF and wearability compromises.

## Candidate architecture

| Function | Rev A direction | Selection gate |
|---|---|---|
| spectral sensing | AS7343/TCS3448-class miniature multispectral sensor | held-out calibration + optical-stack testing |
| MCU/radio | low-power Nordic BLE SoC class | current profile + package/antenna implementation |
| motion/context | BMA400-class optional IMU | only if wear-state/context materially improves data quality |
| energy | 30–80 mAh LiPo envelope | measured average/peak current, weight and charge interval |
| charging | pogo or magnetic contacts | jewelry mechanics + corrosion/skin constraints |
| PCB | custom rigid-flex | optical island + main electronics + antenna geometry |
| enclosure | mixed metal / RF-transparent region | antenna test + aesthetics + skin comfort |

## Design principles

1. **Optics before aesthetics lock.** The decorative face must respect aperture and diffuser geometry.
2. **Power after measurement.** Battery size is not guessed from marketing battery-life goals.
3. **RF before full-metal shell.** Metal is a jewelry material and an antenna constraint.
4. **Debug access in Rev A.** Do not remove SWD/programming/test points too early.
5. **Wearability is data quality.** Hair, tilt, ear shape and orientation belong in validation, not just industrial design.
