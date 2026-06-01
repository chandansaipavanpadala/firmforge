// =============================================================================
// FirmForge — Dynamic Peripheral Parameter Definitions
// Maps each peripheral to its configurable parameter fields
// =============================================================================

export interface PeripheralParam {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "select";
  options?: string[];
}

export const PERIPHERAL_PARAMS: Record<string, PeripheralParam[]> = {
  UART: [
    {
      key: "baudRate",
      label: "Baud Rate",
      placeholder: "115200",
      type: "select",
      options: [
        "9600",
        "19200",
        "38400",
        "57600",
        "115200",
        "230400",
        "460800",
        "921600",
      ],
    },
    { key: "txPin", label: "TX Pin", placeholder: "PA9", type: "text" },
    { key: "rxPin", label: "RX Pin", placeholder: "PA10", type: "text" },
    {
      key: "dataBits",
      label: "Data Bits",
      placeholder: "8",
      type: "select",
      options: ["7", "8", "9"],
    },
    {
      key: "stopBits",
      label: "Stop Bits",
      placeholder: "1",
      type: "select",
      options: ["0.5", "1", "1.5", "2"],
    },
    {
      key: "parity",
      label: "Parity",
      placeholder: "None",
      type: "select",
      options: ["None", "Even", "Odd"],
    },
  ],

  SPI: [
    {
      key: "clockSpeed",
      label: "Clock Speed",
      placeholder: "1000000",
      type: "select",
      options: [
        "125000",
        "250000",
        "500000",
        "1000000",
        "4000000",
        "8000000",
        "16000000",
      ],
    },
    { key: "mosiPin", label: "MOSI Pin", placeholder: "PA7", type: "text" },
    { key: "misoPin", label: "MISO Pin", placeholder: "PA6", type: "text" },
    { key: "sckPin", label: "SCK Pin", placeholder: "PA5", type: "text" },
    { key: "csPin", label: "CS Pin", placeholder: "PA4", type: "text" },
    {
      key: "mode",
      label: "SPI Mode",
      placeholder: "Mode 0",
      type: "select",
      options: ["Mode 0", "Mode 1", "Mode 2", "Mode 3"],
    },
    {
      key: "dataSize",
      label: "Data Size",
      placeholder: "8-bit",
      type: "select",
      options: ["8-bit", "16-bit"],
    },
  ],

  I2C: [
    {
      key: "clockSpeed",
      label: "Clock Speed",
      placeholder: "100000",
      type: "select",
      options: ["100000", "400000", "1000000"],
    },
    { key: "sdaPin", label: "SDA Pin", placeholder: "PB7", type: "text" },
    { key: "sclPin", label: "SCL Pin", placeholder: "PB6", type: "text" },
    {
      key: "ownAddress",
      label: "Own Address (Hex)",
      placeholder: "0x00",
      type: "text",
    },
    {
      key: "addressingMode",
      label: "Addressing Mode",
      placeholder: "7-bit",
      type: "select",
      options: ["7-bit", "10-bit"],
    },
  ],

  ADC: [
    {
      key: "channel",
      label: "ADC Channel",
      placeholder: "0",
      type: "select",
      options: [
        "0", "1", "2", "3", "4", "5", "6", "7",
        "8", "9", "10", "11", "12", "13", "14", "15",
      ],
    },
    { key: "pin", label: "Input Pin", placeholder: "PA0", type: "text" },
    {
      key: "resolution",
      label: "Resolution",
      placeholder: "12-bit",
      type: "select",
      options: ["6-bit", "8-bit", "10-bit", "12-bit"],
    },
    {
      key: "samplingTime",
      label: "Sampling Time",
      placeholder: "56 cycles",
      type: "select",
      options: [
        "3 cycles",
        "15 cycles",
        "28 cycles",
        "56 cycles",
        "84 cycles",
        "112 cycles",
        "144 cycles",
        "480 cycles",
      ],
    },
    {
      key: "conversionMode",
      label: "Conversion Mode",
      placeholder: "Single",
      type: "select",
      options: ["Single", "Continuous", "Scan"],
    },
  ],

  GPIO: [
    { key: "pin", label: "Pin", placeholder: "PC13", type: "text" },
    {
      key: "mode",
      label: "Mode",
      placeholder: "Output",
      type: "select",
      options: ["Input", "Output", "Alternate Function", "Analog"],
    },
    {
      key: "outputType",
      label: "Output Type",
      placeholder: "Push-Pull",
      type: "select",
      options: ["Push-Pull", "Open-Drain"],
    },
    {
      key: "speed",
      label: "Speed",
      placeholder: "Low",
      type: "select",
      options: ["Low", "Medium", "High", "Very High"],
    },
    {
      key: "pull",
      label: "Pull",
      placeholder: "No Pull",
      type: "select",
      options: ["No Pull", "Pull-Up", "Pull-Down"],
    },
  ],

  "Timer/PWM": [
    {
      key: "timer",
      label: "Timer",
      placeholder: "TIM2",
      type: "select",
      options: ["TIM1", "TIM2", "TIM3", "TIM4", "TIM5", "TIM6", "TIM7", "TIM8"],
    },
    {
      key: "channel",
      label: "Channel",
      placeholder: "CH1",
      type: "select",
      options: ["CH1", "CH2", "CH3", "CH4"],
    },
    { key: "pin", label: "Output Pin", placeholder: "PA0", type: "text" },
    {
      key: "frequency",
      label: "PWM Frequency (Hz)",
      placeholder: "1000",
      type: "text",
    },
    { key: "dutyCycle", label: "Duty Cycle (%)", placeholder: "50", type: "text" },
    { key: "prescaler", label: "Prescaler", placeholder: "84", type: "text" },
  ],

  DMA: [
    {
      key: "stream",
      label: "DMA Stream",
      placeholder: "DMA2_Stream0",
      type: "text",
    },
    {
      key: "channel",
      label: "Channel",
      placeholder: "Channel 0",
      type: "select",
      options: [
        "Channel 0", "Channel 1", "Channel 2", "Channel 3",
        "Channel 4", "Channel 5", "Channel 6", "Channel 7",
      ],
    },
    {
      key: "direction",
      label: "Direction",
      placeholder: "Peripheral to Memory",
      type: "select",
      options: [
        "Peripheral to Memory",
        "Memory to Peripheral",
        "Memory to Memory",
      ],
    },
    {
      key: "dataWidth",
      label: "Data Width",
      placeholder: "Byte",
      type: "select",
      options: ["Byte", "Half Word", "Word"],
    },
    {
      key: "mode",
      label: "Mode",
      placeholder: "Normal",
      type: "select",
      options: ["Normal", "Circular"],
    },
  ],

  Interrupt: [
    { key: "pin", label: "Trigger Pin", placeholder: "PA0", type: "text" },
    {
      key: "trigger",
      label: "Trigger Edge",
      placeholder: "Rising",
      type: "select",
      options: ["Rising", "Falling", "Rising & Falling"],
    },
    {
      key: "priority",
      label: "NVIC Priority",
      placeholder: "0",
      type: "select",
      options: [
        "0", "1", "2", "3", "4", "5", "6", "7",
        "8", "9", "10", "11", "12", "13", "14", "15",
      ],
    },
    {
      key: "pull",
      label: "Pull",
      placeholder: "No Pull",
      type: "select",
      options: ["No Pull", "Pull-Up", "Pull-Down"],
    },
  ],

  Watchdog: [
    {
      key: "type",
      label: "Watchdog Type",
      placeholder: "IWDG",
      type: "select",
      options: ["IWDG (Independent)", "WWDG (Window)"],
    },
    { key: "timeout", label: "Timeout (ms)", placeholder: "1000", type: "text" },
    {
      key: "prescaler",
      label: "Prescaler",
      placeholder: "256",
      type: "select",
      options: ["4", "8", "16", "32", "64", "128", "256"],
    },
  ],

  DAC: [
    {
      key: "channel",
      label: "DAC Channel",
      placeholder: "DAC_CHANNEL_1",
      type: "select",
      options: ["DAC_CHANNEL_1", "DAC_CHANNEL_2"],
    },
    { key: "pin", label: "Output Pin", placeholder: "PA4", type: "text" },
    {
      key: "trigger",
      label: "Trigger",
      placeholder: "Software",
      type: "select",
      options: [
        "Software",
        "TIM2",
        "TIM4",
        "TIM6",
        "TIM7",
        "TIM8",
        "External Line 9",
      ],
    },
    {
      key: "outputBuffer",
      label: "Output Buffer",
      placeholder: "Enable",
      type: "select",
      options: ["Enable", "Disable"],
    },
  ],
};

// Default fallback for unknown peripherals
export const DEFAULT_PARAMS: PeripheralParam[] = [
  { key: "detail1", label: "Parameter 1", placeholder: "value", type: "text" as const },
  { key: "detail2", label: "Parameter 2", placeholder: "value", type: "text" as const },
];

/**
 * Returns the parameter definitions for a given peripheral name.
 * Falls back to DEFAULT_PARAMS if the peripheral is not found.
 */
export function getPeripheralParams(peripheral: string): PeripheralParam[] {
  return PERIPHERAL_PARAMS[peripheral] || DEFAULT_PARAMS;
}
