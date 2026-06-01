// =============================================================================
// FirmForge — TypeScript Interfaces & Types
// =============================================================================

export type MCU =
  | "STM32F103"
  | "STM32F4xx"
  | "STM32H7xx"
  | "ESP32"
  | "ESP8266"
  | "Arduino UNO (ATmega328P)"
  | "Arduino Mega"
  | "RP2040"
  | "nRF52840";

export type Peripheral =
  | "UART"
  | "SPI"
  | "I2C"
  | "ADC"
  | "DAC"
  | "GPIO"
  | "Timer/PWM"
  | "Interrupt"
  | "DMA"
  | "Watchdog";

export type CodeStyle = "HAL Library" | "Bare Metal (Registers)" | "Arduino IDE";

export type RTOS = "FreeRTOS" | "Zephyr" | "bare-metal (no RTOS)";

export interface SnippetFormState {
  mcu: MCU | "";
  peripheral: Peripheral | "";
  codeStyle: CodeStyle | "";
  baudRate: string;
  txPin: string;
  rxPin: string;
  clockSpeed: string;
}

export interface RTOSFormState {
  description: string;
  mcu: MCU | "";
  rtos: RTOS | "";
  includeTaskDiagram: boolean;
  includeHeaders: boolean;
  addComments: boolean;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface MCUBadge {
  name: string;
  shortName: string;
}

export interface PeripheralSupport {
  mcu: string;
  peripherals: Record<Peripheral, boolean>;
}
