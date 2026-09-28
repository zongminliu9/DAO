# Hardware and optical architecture

## V0 functional prototype

- AS7341 breakout board
- ESP32-C3 development board
- USB power initially
- DAO local server
- optional Philips Hue bridge/lamp
- engineering carrier or taped/printed near-ear mount

The point of V0 is to make the loop physically observable, not to pretend a development board is product-ready jewelry.

## Rev A production direction

- AS7343/TCS3448-class miniature multispectral sensor
- low-power Nordic BLE SoC class device
- custom rigid-flex electronics
- 30–80 mAh LiPo placeholder pending current profiling
- PMIC/charger
- optional ultra-low-power accelerometer
- controlled optical diffuser/aperture
- antenna keep-out / RF-transparent region
- jewelry-grade enclosure and rear cover
- pogo or magnetic charging contacts

## Optical placement

The optical window should face broadly forward/outward and approximate light exposure near the vertical eye plane. Do not bury the sensor behind opaque metal, gemstones, hair-facing recesses or a side-facing decorative wall.

The sensor needs a controlled angular response. A small translucent window alone is not enough; diffuser material, aperture diameter, sensor-to-window distance and enclosure shadowing must be measured during calibration.

## Mechanical partition

The visible face can remain jewelry-like because the sensor package itself is small. The large constraints are battery volume, antenna clearance, charging, clip mechanics and skin comfort. The current CAD therefore separates the optical sensor zone from the deeper electronics/battery zone.
