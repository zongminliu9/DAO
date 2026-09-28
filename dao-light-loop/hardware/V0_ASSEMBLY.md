# V0 assembly guide

The goal is a robust physical demo, not a miniaturized product.

## Parts

- ESP32-C3 development board;
- AS7341 breakout;
- USB power;
- jumper wires / small perfboard or printed fixture;
- computer running DAO host runtime;
- optional Philips Hue bridge + compatible lamp;
- printed near-ear carrier or eyeglass/ear fixture for repeatable sensor orientation.

## Electrical

1. Confirm breakout-board voltage requirements.
2. Connect 3V3, GND, SDA and SCL.
3. Copy `firmware/include/secrets.h.example` to `secrets.h`.
4. Set `DAO_SERVER_URL` to the computer's LAN IP, not localhost.
5. Flash firmware and confirm sequence numbers increment in serial output.
6. POSTs should return HTTP 2xx from `/api/sensor`.

## Host verification

Open Engineering in the dashboard. Confirm:

- device ID;
- firmware version;
- fresh sample status;
- F1–F8 / Clear / NIR activity;
- development calibration warning.

## Closed-loop physical demo

With Hue configured:

1. select **Physical sensor**;
2. select **Philips Hue**;
3. create a low-light condition;
4. start the controller;
5. visually confirm the lamp changes;
6. confirm the sensor trace changes in the expected direction;
7. export the session CSV.

Do not use physical mode if the sensor timestamp is stale; the host rejects it by design.
