#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_AS7341.h>
#include "secrets.h"
#include "dao_config.h"

Adafruit_AS7341 sensor;
uint32_t sequenceNumber = 0;
uint32_t lastSampleAt = 0;
uint32_t reconnectBackoffMs = DAO_WIFI_RETRY_BASE_MS;

static void beginI2C() {
  if (DAO_I2C_SDA >= 0 && DAO_I2C_SCL >= 0) Wire.begin(DAO_I2C_SDA, DAO_I2C_SCL);
  else Wire.begin();
}

static bool ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  const uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 5000) delay(100);
  if (WiFi.status() == WL_CONNECTED) {
    reconnectBackoffMs = DAO_WIFI_RETRY_BASE_MS;
    return true;
  }
  delay(reconnectBackoffMs);
  reconnectBackoffMs = min<uint32_t>(reconnectBackoffMs * 2, 10000UL);
  return false;
}

static int readBatteryPercentPlaceholder() {
  // Rev A will replace this with PMIC/ADC-backed battery estimation.
  // Returning -1 tells the host that battery telemetry is unavailable.
  return -1;
}

static bool readAndPostSample() {
  uint16_t readings[12];
  if (!sensor.readAllChannels(readings)) {
    Serial.println("AS7341 read failed");
    return false;
  }
  if (!ensureWifi()) {
    Serial.println("Wi-Fi unavailable; sample not posted");
    return false;
  }

  JsonDocument doc;
  doc["deviceId"] = DAO_DEVICE_ID;
  doc["firmwareVersion"] = DAO_FIRMWARE_VERSION;
  doc["sequence"] = sequenceNumber++;
  doc["gain"] = 4;
  doc["integrationMs"] = 100;
  const int battery = readBatteryPercentPlaceholder();
  if (battery >= 0) doc["batteryPercent"] = battery;

  JsonObject c = doc["channels"].to<JsonObject>();
  c["f1"] = readings[0]; c["f2"] = readings[1]; c["f3"] = readings[2]; c["f4"] = readings[3];
  c["f5"] = readings[6]; c["f6"] = readings[7]; c["f7"] = readings[8]; c["f8"] = readings[9];
  c["clear"] = readings[10]; c["nir"] = readings[11];

  String payload;
  serializeJson(doc, payload);
  HTTPClient http;
  http.setTimeout(DAO_HTTP_TIMEOUT_MS);
  if (!http.begin(DAO_SERVER_URL)) {
    Serial.println("HTTP begin failed");
    return false;
  }
  http.addHeader("Content-Type", "application/json");
  const int status = http.POST(payload);
  const String response = status > 0 ? http.getString() : "";
  http.end();
  Serial.printf("DAO POST status=%d seq=%lu\n", status, static_cast<unsigned long>(sequenceNumber - 1));
  if (status < 200 || status >= 300) {
    Serial.println(response);
    return false;
  }
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(300);
  beginI2C();
  if (!sensor.begin()) {
    Serial.println("AS7341 not found. Check power, SDA/SCL and address.");
    while (true) delay(1000);
  }
  sensor.setATIME(100);
  sensor.setASTEP(999);
  sensor.setGain(AS7341_GAIN_4X);
  ensureWifi();
  Serial.printf("DAO firmware %s ready as %s\n", DAO_FIRMWARE_VERSION, DAO_DEVICE_ID);
}

void loop() {
  if (millis() - lastSampleAt >= DAO_SAMPLE_INTERVAL_MS) {
    lastSampleAt = millis();
    readAndPostSample();
  }
  delay(20);
}
