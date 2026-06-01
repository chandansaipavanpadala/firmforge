// =============================================================================
// FirmForge — Constants & Static Data
// =============================================================================

import type {
  MCU,
  Peripheral,
  CodeStyle,
  RTOS,
  FeatureCard,
  MCUBadge,
  PeripheralSupport,
} from "./types";

// ---------------------------------------------------------------------------
// Dropdown Options
// ---------------------------------------------------------------------------

export const MCU_OPTIONS: { value: MCU; label: string }[] = [
  { value: "STM32F103", label: "STM32F103" },
  { value: "STM32F4xx", label: "STM32F4xx" },
  { value: "STM32H7xx", label: "STM32H7xx" },
  { value: "ESP32", label: "ESP32" },
  { value: "ESP8266", label: "ESP8266" },
  { value: "Arduino UNO (ATmega328P)", label: "Arduino UNO (ATmega328P)" },
  { value: "Arduino Mega", label: "Arduino Mega" },
  { value: "RP2040", label: "RP2040" },
  { value: "nRF52840", label: "nRF52840" },
];

export const PERIPHERAL_OPTIONS: { value: Peripheral; label: string }[] = [
  { value: "UART", label: "UART" },
  { value: "SPI", label: "SPI" },
  { value: "I2C", label: "I2C" },
  { value: "ADC", label: "ADC" },
  { value: "DAC", label: "DAC" },
  { value: "GPIO", label: "GPIO" },
  { value: "Timer/PWM", label: "Timer/PWM" },
  { value: "Interrupt", label: "Interrupt" },
  { value: "DMA", label: "DMA" },
  { value: "Watchdog", label: "Watchdog" },
];

export const CODE_STYLE_OPTIONS: { value: CodeStyle; label: string }[] = [
  { value: "HAL Library", label: "HAL Library" },
  { value: "Bare Metal (Registers)", label: "Bare Metal (Registers)" },
  { value: "Arduino IDE", label: "Arduino IDE" },
];

export const RTOS_OPTIONS: { value: RTOS; label: string }[] = [
  { value: "FreeRTOS", label: "FreeRTOS" },
  { value: "Zephyr", label: "Zephyr" },
  { value: "bare-metal (no RTOS)", label: "bare-metal (no RTOS)" },
];

// ---------------------------------------------------------------------------
// MCU Badges for the hero marquee
// ---------------------------------------------------------------------------

export const MCU_BADGES: MCUBadge[] = [
  { name: "STM32F4", shortName: "STM32F4" },
  { name: "ESP32", shortName: "ESP32" },
  { name: "Arduino UNO", shortName: "UNO" },
  { name: "ESP8266", shortName: "ESP8266" },
  { name: "STM32H7", shortName: "STM32H7" },
  { name: "ATmega328", shortName: "ATmega328" },
  { name: "RP2040", shortName: "RP2040" },
  { name: "nRF52840", shortName: "nRF52840" },
];

// ---------------------------------------------------------------------------
// Feature Cards
// ---------------------------------------------------------------------------

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: "🔌",
    title: "Peripheral Snippets",
    description:
      "UART, SPI, I2C, ADC, Timers — correct register maps, every time.",
  },
  {
    icon: "🧠",
    title: "RTOS Architect",
    description:
      "Describe behavior in plain English. Get FreeRTOS tasks, queues, and semaphores.",
  },
  {
    icon: "📋",
    title: "HAL + Bare Metal",
    description:
      "Choose between STM32 HAL or direct register access. Full flexibility.",
  },
];

// ---------------------------------------------------------------------------
// Placeholder / Demo Code
// ---------------------------------------------------------------------------

export const DEMO_PROMPT =
  "Generate UART transmit code for STM32F4 at 115200 baud on PA9/PA10";

export const DEMO_CODE = `#include "stm32f4xx_hal.h"

UART_HandleTypeDef huart1;

void UART_Init(void) {
    __HAL_RCC_USART1_CLK_ENABLE();
    __HAL_RCC_GPIOA_CLK_ENABLE();

    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_9 | GPIO_PIN_10;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
    GPIO_InitStruct.Alternate = GPIO_AF7_USART1;
    HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

    huart1.Instance = USART1;
    huart1.Init.BaudRate = 115200;
    huart1.Init.WordLength = UART_WORDLENGTH_8B;
    huart1.Init.StopBits = UART_STOPBITS_1;
    huart1.Init.Parity = UART_PARITY_NONE;
    huart1.Init.Mode = UART_MODE_TX_RX;
    huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
    HAL_UART_Init(&huart1);
}

void UART_Transmit(uint8_t *data, uint16_t size) {
    HAL_UART_Transmit(&huart1, data, size, HAL_MAX_DELAY);
}

int main(void) {
    HAL_Init();
    SystemClock_Config();
    UART_Init();

    uint8_t msg[] = "Hello from STM32F4!\\r\\n";
    while (1) {
        UART_Transmit(msg, sizeof(msg) - 1);
        HAL_Delay(1000);
    }
}`;

export const PLACEHOLDER_SNIPPET_CODE = `// Select your MCU, peripheral, and parameters
// then click "Generate Code" to get started.
//
// Example output:
//
// #include "stm32f4xx_hal.h"
//
// void Peripheral_Init(void) {
//     // Clock enable
//     // GPIO configuration
//     // Peripheral configuration
//     // Interrupt configuration (if needed)
// }
//
// int main(void) {
//     HAL_Init();
//     SystemClock_Config();
//     Peripheral_Init();
//     while (1) { /* main loop */ }
// }`;

export const RTOS_MAIN_C = `#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "semphr.h"
#include "tasks.h"
#include "config.h"

/* Queue and Semaphore handles */
QueueHandle_t xTempQueue;
SemaphoreHandle_t xMQTTMutex;

int main(void) {
    HAL_Init();
    SystemClock_Config();
    MX_GPIO_Init();

    /* Create IPC primitives */
    xTempQueue = xQueueCreate(QUEUE_LENGTH, sizeof(float));
    xMQTTMutex = xSemaphoreCreateMutex();

    /* Create tasks */
    xTaskCreate(vTaskTempReader, "TempRead",
                STACK_SIZE_TEMP, NULL,
                PRIORITY_TEMP, NULL);

    xTaskCreate(vTaskFilter, "Filter",
                STACK_SIZE_FILTER, NULL,
                PRIORITY_FILTER, NULL);

    xTaskCreate(vTaskMQTT, "MQTT",
                STACK_SIZE_MQTT, NULL,
                PRIORITY_MQTT, NULL);

    xTaskCreate(vTaskAlertGPIO, "Alert",
                STACK_SIZE_ALERT, NULL,
                PRIORITY_ALERT, NULL);

    /* Start scheduler */
    vTaskStartScheduler();

    /* Should never reach here */
    for (;;) {}
}`;

export const RTOS_TASKS_H = `#ifndef TASKS_H
#define TASKS_H

#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "config.h"

/* ──────────────────────────────────────────────
 * Task: Temperature Reader (DHT22)
 * Period: Every 2 seconds
 * ──────────────────────────────────────────── */
void vTaskTempReader(void *pvParameters);

/* ──────────────────────────────────────────────
 * Task: Moving Average Filter
 * Reads from xTempQueue, applies filter
 * ──────────────────────────────────────────── */
void vTaskFilter(void *pvParameters);

/* ──────────────────────────────────────────────
 * Task: MQTT Publisher
 * Publishes filtered temp over WiFi
 * ──────────────────────────────────────────── */
void vTaskMQTT(void *pvParameters);

/* ──────────────────────────────────────────────
 * Task: GPIO Alert
 * Sets GPIO HIGH if temp > TEMP_THRESHOLD
 * ──────────────────────────────────────────── */
void vTaskAlertGPIO(void *pvParameters);

#endif /* TASKS_H */`;

export const RTOS_CONFIG_H = `#ifndef CONFIG_H
#define CONFIG_H

/* ── Temperature Thresholds ─────────────── */
#define TEMP_THRESHOLD       35.0f
#define FILTER_WINDOW_SIZE   5

/* ── Task Priorities ────────────────────── */
#define PRIORITY_TEMP        3
#define PRIORITY_FILTER      2
#define PRIORITY_MQTT        2
#define PRIORITY_ALERT       4  /* Highest - safety */

/* ── Stack Sizes (words) ────────────────── */
#define STACK_SIZE_TEMP      256
#define STACK_SIZE_FILTER    256
#define STACK_SIZE_MQTT      512
#define STACK_SIZE_ALERT     128

/* ── Queue Configuration ────────────────── */
#define QUEUE_LENGTH         10

/* ── MQTT Configuration ─────────────────── */
#define MQTT_BROKER          "broker.hivemq.com"
#define MQTT_PORT            1883
#define MQTT_TOPIC           "firmware/temp"

/* ── GPIO Pin for Alert ─────────────────── */
#define ALERT_GPIO_PORT      GPIOB
#define ALERT_GPIO_PIN       GPIO_PIN_0

/* ── DHT22 Pin ──────────────────────────── */
#define DHT22_GPIO_PORT      GPIOA
#define DHT22_GPIO_PIN       GPIO_PIN_5

#endif /* CONFIG_H */`;

// ---------------------------------------------------------------------------
// Peripheral Support Matrix (for /docs page)
// ---------------------------------------------------------------------------

export const ALL_PERIPHERALS: Peripheral[] = [
  "UART",
  "SPI",
  "I2C",
  "ADC",
  "DAC",
  "GPIO",
  "Timer/PWM",
  "Interrupt",
  "DMA",
  "Watchdog",
];

export const PERIPHERAL_SUPPORT_MATRIX: PeripheralSupport[] = [
  {
    mcu: "STM32F103",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: true,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: true, Watchdog: true,
    },
  },
  {
    mcu: "STM32F4xx",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: true,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: true, Watchdog: true,
    },
  },
  {
    mcu: "STM32H7xx",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: true,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: true, Watchdog: true,
    },
  },
  {
    mcu: "ESP32",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: true,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: true, Watchdog: true,
    },
  },
  {
    mcu: "ESP8266",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: false,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: false, Watchdog: true,
    },
  },
  {
    mcu: "Arduino UNO",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: false,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: false, Watchdog: true,
    },
  },
  {
    mcu: "Arduino Mega",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: false,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: false, Watchdog: true,
    },
  },
  {
    mcu: "RP2040",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: false,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: true, Watchdog: true,
    },
  },
  {
    mcu: "nRF52840",
    peripherals: {
      UART: true, SPI: true, I2C: true, ADC: true, DAC: false,
      GPIO: true, "Timer/PWM": true, Interrupt: true, DMA: true, Watchdog: true,
    },
  },
];

// ---------------------------------------------------------------------------
// Navigation Links
// ---------------------------------------------------------------------------

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/generate", label: "Generate" },
  { href: "/docs", label: "Docs" },
];
