# Hardware test plan

## V0 bench

- I²C sensor enumeration and recovery.
- raw channel repeatability under fixed source.
- Wi-Fi reconnect / server unavailable behavior.
- sample sequence continuity.
- stale telemetry rejection.
- real Hue command + feedback convergence.

## Optical fixture

For each optical-window/diffuser candidate:

- 0°, ±15°, ±30°, ±45°, ±60° incidence;
- daylight / 2700K LED / 4000K LED / 6500K LED / RGB-mixed source;
- low / medium / high intensity;
- 3+ repeated mounts;
- with/without representative hair shadowing.

Store enclosure revision with every dataset.

## Power

Measure with an instrumented supply:

- sleep/idle;
- sensor acquisition;
- BLE advertising;
- BLE sync burst;
- max radio current;
- charge current;
- average current under proposed duty cycle.

Only then select battery capacity and quote battery life.

## RF / enclosure

- open-board BLE range baseline;
- candidate shell installed;
- metal face present;
- head/skin-adjacent use orientation;
- packet loss / RSSI comparison.

## Fault injection

- sensor disconnected;
- frozen/stale sensor stream;
- radio disconnect;
- actuator unavailable;
- battery brownout/reboot;
- rapid user manual lighting change during control.

Expected outcome: no uncontrolled repeated commands; explicit fault state and recovery path.
