#pragma once

#ifndef DAO_FIRMWARE_VERSION
#define DAO_FIRMWARE_VERSION "0.2.0"
#endif

#ifndef DAO_DEVICE_ID
#define DAO_DEVICE_ID "dao-v0-esp32c3"
#endif

#ifndef DAO_SAMPLE_INTERVAL_MS
#define DAO_SAMPLE_INTERVAL_MS 2000UL
#endif

#ifndef DAO_HTTP_TIMEOUT_MS
#define DAO_HTTP_TIMEOUT_MS 3000
#endif

#ifndef DAO_WIFI_RETRY_BASE_MS
#define DAO_WIFI_RETRY_BASE_MS 500UL
#endif

#ifndef DAO_I2C_SDA
#define DAO_I2C_SDA -1
#endif

#ifndef DAO_I2C_SCL
#define DAO_I2C_SCL -1
#endif
