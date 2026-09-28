# Blueprint demo

## 30-second software proof

1. Open the dashboard.
2. Keep **Simulator / Simulator** selected.
3. Click **Run Closed Loop Demo**.
4. Narrate only what is visible: measured light is low, the controller increases the environment, measurements rise, the system enters the target deadband.
5. Open Engineering to show the failsafe and calibration boundary.
6. Open Travel mode to show the longer-term product wedge without pretending the travel heuristic is medical guidance.

## Physical proof once V0 hardware is assembled

1. ESP32-C3 posts AS7341 telemetry to `/api/sensor`.
2. Dashboard shows **Physical sensor live**.
3. Hue bridge credentials are configured locally.
4. Select **Physical sensor / Philips Hue**.
5. Cover or move the sensor into a low-light condition.
6. Start the loop.
7. Film the physical lamp changing and the measured trace responding.

## The line to remember

> DAO does not stop at telling you that your light is wrong. It changes the environment and checks whether it worked.
