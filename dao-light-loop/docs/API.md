# Local API

The V0 runtime is deliberately local-first. No cloud backend is required for the Blueprint demo.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/status` | runtime, target, providers, latest session |
| GET | `/api/engineering` | physical sensor diagnostics and recent sessions |
| POST | `/api/sensor` | validated ESP32 spectral telemetry ingestion |
| POST | `/api/demo/reset` | choose/reset deterministic simulator scenario |
| POST | `/api/demo/run` | execute a bounded closed-loop session |
| POST | `/api/controller/stop` | request manual stop |
| GET | `/api/sessions` | recent structured session logs |
| GET | `/api/sessions/:id` | one session as JSON |
| GET | `/api/sessions/:id.csv` | one session as CSV |
| POST | `/api/travel/plan` | prototype travel light-plan heuristic |
| POST | `/api/hue/test` | test configured local Hue provider |

## Physical sensor payload

```json
{
  "deviceId": "dao-v0-esp32c3",
  "firmwareVersion": "0.2.0",
  "sequence": 17,
  "gain": 4,
  "integrationMs": 100,
  "channels": {
    "f1": 100, "f2": 200, "f3": 300, "f4": 400,
    "f5": 500, "f6": 500, "f7": 300, "f8": 200,
    "clear": 700, "nir": 50
  }
}
```

All ten channels are required. Physical closed-loop mode rejects samples older than ten seconds.
