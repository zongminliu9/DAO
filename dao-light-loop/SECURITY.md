# Security

The Blueprint prototype is local-first and should never commit Wi-Fi passwords or Hue bridge credentials.

- Copy `firmware/include/secrets.h.example` to `secrets.h`; the real file is gitignored.
- Hue credentials are supplied through environment variables.
- Do not expose the V0 local HTTP server directly to the public internet.
- A production mobile/BLE architecture will require authenticated pairing, encrypted transport, signed firmware/update policy and a threat model before user deployment.

Report security issues privately to the DAO team rather than opening a public issue with secrets or exploit details.
