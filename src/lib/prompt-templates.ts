// =============================================================================
// FirmForge — Prompt Templates Library (30+ common firmware tasks)
// =============================================================================

export interface SnippetTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  type: "snippet";
  mcu: string;
  peripheral: string;
  codeStyle: string;
  params?: Record<string, string>;
}

export interface RTOSTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  type: "rtos";
  prompt: string;
  mcu: string;
  rtos: string;
}

export type PromptTemplate = SnippetTemplate | RTOSTemplate;

// ---------------------------------------------------------------------------
// Snippet Templates
// ---------------------------------------------------------------------------

export const SNIPPET_TEMPLATES: SnippetTemplate[] = [
  // ── Sensors ──
  {
    id: "s-dht22-temp",
    name: "DHT22 Temperature Logger",
    category: "Sensors",
    description: "Read temperature and humidity from DHT22 sensor via GPIO.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "GPIO",
    codeStyle: "HAL Library",
  },
  {
    id: "s-bmp280-i2c",
    name: "BMP280 Pressure Sensor (I2C)",
    category: "Sensors",
    description: "Initialize and read barometric pressure from BMP280 over I2C.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "I2C",
    codeStyle: "HAL Library",
  },
  {
    id: "s-mpu6050-accel",
    name: "MPU6050 Accelerometer (I2C)",
    category: "Sensors",
    description: "Initialize MPU6050 and read accelerometer data over I2C.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "I2C",
    codeStyle: "HAL Library",
  },
  {
    id: "s-adc-ldr",
    name: "LDR Light Sensor (ADC)",
    category: "Sensors",
    description: "Read light intensity from an LDR using ADC.",
    type: "snippet",
    mcu: "STM32F103",
    peripheral: "ADC",
    codeStyle: "HAL Library",
  },
  {
    id: "s-ultrasonic",
    name: "HC-SR04 Ultrasonic Distance",
    category: "Sensors",
    description: "Measure distance using HC-SR04 ultrasonic sensor with Timer input capture.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "Timer/PWM",
    codeStyle: "HAL Library",
  },

  // ── Communication ──
  {
    id: "s-uart-115200",
    name: "UART 115200 Baud TX/RX",
    category: "Communication",
    description: "Configure UART at 115200 baud for basic serial communication.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "UART",
    codeStyle: "HAL Library",
    params: { baudRate: "115200" },
  },
  {
    id: "s-uart-9600",
    name: "UART 9600 Baud (GPS Module)",
    category: "Communication",
    description: "Configure UART at 9600 baud for GPS module communication.",
    type: "snippet",
    mcu: "STM32F103",
    peripheral: "UART",
    codeStyle: "HAL Library",
    params: { baudRate: "9600" },
  },
  {
    id: "s-spi-flash",
    name: "SPI Flash Memory (W25Q64)",
    category: "Communication",
    description: "Initialize SPI for W25Q64 flash memory read/write operations.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "SPI",
    codeStyle: "HAL Library",
  },
  {
    id: "s-i2c-oled",
    name: "SSD1306 OLED Display (I2C)",
    category: "Communication",
    description: "Initialize SSD1306 128x64 OLED display over I2C.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "I2C",
    codeStyle: "HAL Library",
  },
  {
    id: "s-spi-sd-card",
    name: "SD Card Interface (SPI)",
    category: "Communication",
    description: "Initialize SPI for SD card read/write operations.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "SPI",
    codeStyle: "HAL Library",
  },

  // ── Motor Control ──
  {
    id: "s-servo-pwm",
    name: "Servo Motor PWM Control",
    category: "Motor Control",
    description: "Generate 50Hz PWM signal for standard servo motor control.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "Timer/PWM",
    codeStyle: "HAL Library",
  },
  {
    id: "s-dc-motor-pwm",
    name: "DC Motor Speed (PWM + H-Bridge)",
    category: "Motor Control",
    description: "Control DC motor speed using PWM and direction via GPIO (L298N driver).",
    type: "snippet",
    mcu: "STM32F103",
    peripheral: "Timer/PWM",
    codeStyle: "HAL Library",
  },
  {
    id: "s-stepper-gpio",
    name: "Stepper Motor (GPIO Pulse)",
    category: "Motor Control",
    description: "Drive a stepper motor using GPIO pins with step/direction control.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "GPIO",
    codeStyle: "HAL Library",
  },

  // ── Timing & Interrupts ──
  {
    id: "s-timer-1ms",
    name: "1ms System Timer Interrupt",
    category: "Timing",
    description: "Configure a timer for 1ms periodic interrupt for precise timing.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "Timer/PWM",
    codeStyle: "HAL Library",
  },
  {
    id: "s-exti-button",
    name: "External Interrupt (Button Press)",
    category: "Timing",
    description: "Configure GPIO external interrupt for push-button with debounce.",
    type: "snippet",
    mcu: "STM32F103",
    peripheral: "Interrupt",
    codeStyle: "HAL Library",
  },
  {
    id: "s-watchdog-iwdg",
    name: "Independent Watchdog (IWDG)",
    category: "Safety",
    description: "Configure IWDG watchdog timer to reset MCU on software hang.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "Watchdog",
    codeStyle: "HAL Library",
  },
  {
    id: "s-dma-uart",
    name: "DMA-driven UART Transfer",
    category: "Timing",
    description: "Configure DMA for non-blocking UART transmit to reduce CPU overhead.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "DMA",
    codeStyle: "HAL Library",
  },

  // ── Arduino ──
  {
    id: "s-arduino-led-blink",
    name: "Arduino LED Blink",
    category: "Arduino",
    description: "Classic LED blink on Arduino UNO pin 13.",
    type: "snippet",
    mcu: "Arduino UNO (ATmega328P)",
    peripheral: "GPIO",
    codeStyle: "Arduino IDE",
  },
  {
    id: "s-arduino-dht",
    name: "Arduino DHT11 Temperature",
    category: "Arduino",
    description: "Read temperature from DHT11 sensor on Arduino UNO.",
    type: "snippet",
    mcu: "Arduino UNO (ATmega328P)",
    peripheral: "GPIO",
    codeStyle: "Arduino IDE",
  },
  {
    id: "s-arduino-serial",
    name: "Arduino Serial Monitor",
    category: "Arduino",
    description: "Serial communication setup for Arduino UNO at 9600 baud.",
    type: "snippet",
    mcu: "Arduino UNO (ATmega328P)",
    peripheral: "UART",
    codeStyle: "Arduino IDE",
    params: { baudRate: "9600" },
  },

  // ── ESP32 ──
  {
    id: "s-esp32-wifi-gpio",
    name: "ESP32 GPIO + WiFi Status LED",
    category: "ESP32",
    description: "Toggle GPIO LED based on WiFi connection status on ESP32.",
    type: "snippet",
    mcu: "ESP32",
    peripheral: "GPIO",
    codeStyle: "Arduino IDE",
  },
  {
    id: "s-esp32-adc",
    name: "ESP32 ADC Voltage Reading",
    category: "ESP32",
    description: "Read analog voltage from a potentiometer on ESP32 ADC.",
    type: "snippet",
    mcu: "ESP32",
    peripheral: "ADC",
    codeStyle: "Arduino IDE",
  },

  // ── Bare Metal ──
  {
    id: "s-bare-gpio-toggle",
    name: "Bare Metal GPIO Toggle",
    category: "Bare Metal",
    description: "Direct register-level GPIO toggle on STM32F103.",
    type: "snippet",
    mcu: "STM32F103",
    peripheral: "GPIO",
    codeStyle: "Bare Metal (Registers)",
  },
  {
    id: "s-bare-uart",
    name: "Bare Metal UART Init",
    category: "Bare Metal",
    description: "Direct register-level UART configuration on STM32F103.",
    type: "snippet",
    mcu: "STM32F103",
    peripheral: "UART",
    codeStyle: "Bare Metal (Registers)",
    params: { baudRate: "115200" },
  },

  // ── DAC ──
  {
    id: "s-dac-sine",
    name: "DAC Sine Wave Generator",
    category: "Signal",
    description: "Generate a sine wave output using the DAC peripheral.",
    type: "snippet",
    mcu: "STM32F4xx",
    peripheral: "DAC",
    codeStyle: "HAL Library",
  },
];

// ---------------------------------------------------------------------------
// RTOS Templates
// ---------------------------------------------------------------------------

export const RTOS_TEMPLATES: RTOSTemplate[] = [
  {
    id: "r-temp-mqtt",
    name: "Temperature Monitor + MQTT",
    category: "IoT",
    description: "Read DHT22, filter, publish via MQTT, GPIO alert on threshold.",
    type: "rtos",
    prompt:
      "Read temperature from DHT22 sensor every 2 seconds using a FreeRTOS task. Apply a moving average filter over 5 samples. Publish the filtered temperature via MQTT over WiFi. If temperature exceeds 35 degrees Celsius, set a GPIO pin HIGH as an alert.",
    mcu: "ESP32",
    rtos: "FreeRTOS",
  },
  {
    id: "r-motor-pid",
    name: "PID Motor Speed Controller",
    category: "Motor Control",
    description: "PID loop controlling DC motor speed with encoder feedback.",
    type: "rtos",
    prompt:
      "Create a FreeRTOS-based PID motor speed controller. One task reads rotary encoder pulses to measure actual RPM. Another task runs a PID algorithm to compute PWM duty cycle. A third task handles UART serial communication to receive target RPM commands and report current status.",
    mcu: "STM32F4xx",
    rtos: "FreeRTOS",
  },
  {
    id: "r-data-logger",
    name: "SD Card Data Logger",
    category: "Data Acquisition",
    description: "Multi-sensor data logger writing to SD card with timestamps.",
    type: "rtos",
    prompt:
      "Build a multi-sensor data logger with FreeRTOS. Task 1: Read temperature and humidity from DHT22 every 5 seconds. Task 2: Read light level from LDR via ADC every 2 seconds. Task 3: Aggregate data from both tasks using queues and write timestamped CSV entries to an SD card via SPI. Use a mutex to protect SPI bus access.",
    mcu: "STM32F4xx",
    rtos: "FreeRTOS",
  },
  {
    id: "r-traffic-light",
    name: "Traffic Light Controller",
    category: "Control Systems",
    description: "State machine traffic light with pedestrian interrupt.",
    type: "rtos",
    prompt:
      "Design a traffic light controller using FreeRTOS. One task manages the traffic light state machine (Red -> Green -> Yellow -> Red) with configurable durations. A second task monitors a pedestrian push-button via external interrupt and sends an event to the traffic task to enter a pedestrian crossing phase. A third task drives an LED display showing countdown time.",
    mcu: "STM32F103",
    rtos: "FreeRTOS",
  },
  {
    id: "r-ble-sensor",
    name: "BLE Sensor Hub",
    category: "IoT",
    description: "Collect sensor data and broadcast via BLE advertisements.",
    type: "rtos",
    prompt:
      "Create a BLE sensor hub using Zephyr RTOS on nRF52840. One task reads temperature from an I2C sensor every 10 seconds. Another task reads battery voltage via ADC. A BLE task broadcasts the sensor data as BLE advertisements with a custom service UUID. Use a shared data structure protected by a semaphore.",
    mcu: "nRF52840",
    rtos: "Zephyr",
  },
  {
    id: "r-home-automation",
    name: "Home Automation Hub",
    category: "IoT",
    description: "WiFi-connected relay controller with MQTT command interface.",
    type: "rtos",
    prompt:
      "Build a home automation hub using FreeRTOS on ESP32. Task 1: MQTT client that subscribes to command topics to control 4 relay outputs. Task 2: Periodically read temperature and humidity from DHT22 and publish to MQTT status topic. Task 3: Handle a physical button input to manually toggle relays. All relay state changes should be mutex-protected.",
    mcu: "ESP32",
    rtos: "FreeRTOS",
  },
  {
    id: "r-bare-blink",
    name: "Bare Metal Multi-LED Sequencer",
    category: "Basic",
    description: "Sequential LED pattern without RTOS using timer interrupts.",
    type: "rtos",
    prompt:
      "Create a bare-metal firmware (no RTOS) that sequences 4 LEDs in a pattern. Use a timer interrupt for precise timing. The main loop handles a button press to change the LED pattern mode (chase, blink all, alternate). Include proper GPIO initialization for LEDs and button with debounce.",
    mcu: "STM32F103",
    rtos: "bare-metal (no RTOS)",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const ALL_TEMPLATES: PromptTemplate[] = [
  ...SNIPPET_TEMPLATES,
  ...RTOS_TEMPLATES,
];

/** Get unique categories for a given template type */
export function getCategories(type: "snippet" | "rtos"): string[] {
  const templates = type === "snippet" ? SNIPPET_TEMPLATES : RTOS_TEMPLATES;
  return [...new Set(templates.map((t) => t.category))];
}
