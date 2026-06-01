"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MCUBadge } from "@/components/mcu-badge";
import { PERIPHERAL_SUPPORT_MATRIX, ALL_PERIPHERALS } from "@/lib/constants";

// =============================================================================
// Example RTOS Prompts Data
// =============================================================================

const EXAMPLE_PROMPTS = [
  {
    mcu: "ESP32",
    rtos: "FreeRTOS",
    prompt:
      "Read temperature from DHT22 every 2 seconds using a FreeRTOS task. Apply a 5-sample moving average filter. Publish the result via MQTT over WiFi. Trigger a GPIO alarm if temperature exceeds 35\u00B0C.",
  },
  {
    mcu: "STM32F4xx",
    rtos: "FreeRTOS",
    prompt:
      "Control a stepper motor using DRV8825 driver over SPI. Accept speed and direction commands via UART at 115200 baud. Use a FreeRTOS queue to decouple command reception from motor control.",
  },
  {
    mcu: "RP2040",
    rtos: "FreeRTOS",
    prompt:
      "Read 4 analog sensors via ADC in round-robin using DMA. Log data to SD card over SPI every 100ms. Blink LED on GPIO 25 as a heartbeat every 500ms using a separate low-priority FreeRTOS task.",
  },
  {
    mcu: "ESP32",
    rtos: "Bare Metal (No RTOS)",
    prompt:
      "Initialize BLE advertising with a custom service UUID. On connection, receive data via BLE characteristic and echo it back. Flash onboard LED when data is received. No RTOS \u2014 use interrupt-driven approach.",
  },
  {
    mcu: "STM32F103",
    rtos: "FreeRTOS",
    prompt:
      "Sample an accelerometer (MPU6050) via I2C at 100Hz. Detect a free-fall event using threshold comparison. On detection, send an alert via UART and toggle a buzzer GPIO for 500ms.",
  },
  {
    mcu: "Arduino Mega",
    rtos: "FreeRTOS",
    prompt:
      "Read 3 ultrasonic sensors (HC-SR04) using GPIO timing. Display distances on a 16x2 LCD via I2C. Sound a buzzer if any sensor reads under 20cm. Use FreeRTOS with 3 sensor tasks and 1 display task.",
  },
];

const QUICK_START_STEPS = [
  {
    number: "01",
    title: "Choose Your Mode",
    icon: "\u26A1",
    text: "Use Snippet Generator for single peripheral initialization code, or RTOS Architect for complete multi-task firmware projects.",
  },
  {
    number: "02",
    title: "Configure & Prompt",
    icon: "\uD83E\uDDE0",
    text: "Select your MCU and peripheral, fill in pin and timing parameters, or describe your firmware behavior in plain English.",
  },
  {
    number: "03",
    title: "Copy & Flash",
    icon: "\uD83D\uDCCB",
    text: "Generated code is ready to paste directly into your IDE \u2014 STM32CubeIDE, Arduino IDE, ESP-IDF, or VS Code with PlatformIO.",
  },
];

// =============================================================================
// DocsPage Component
// =============================================================================

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-grid-pattern-subtle">
      {/* Ambient glow */}
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-[#00D4FF]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-[#7C3AED]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ─── Section 1: Page Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#E8E8F0] mb-2"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Documentation
          </h1>
          <p
            className="text-[#6B6B8A] text-sm sm:text-base max-w-2xl"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Supported MCUs, peripherals, example prompts, and API reference.
          </p>
          <div
            className="flex items-center gap-2 mt-3 text-xs"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Link
              href="/"
              className="text-[#00D4FF]/60 hover:text-[#00D4FF] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#6B6B8A]">&rarr;</span>
            <span className="text-[#6B6B8A]">Docs</span>
          </div>
        </motion.div>

        {/* ─── Section 2: MCU × Peripheral Support Matrix ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-16"
        >
          <h2
            className="text-xl font-bold text-[#E8E8F0] mb-4"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            MCU &times; Peripheral Support Matrix
          </h2>
          <div className="rounded-xl border border-[#1E1E2E] bg-[#12121A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#1E1E2E]">
                    <th
                      className="text-left px-5 py-4 text-xs font-semibold text-[#6B6B8A] uppercase tracking-wider bg-[#12121A] sticky left-0 z-10"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      MCU
                    </th>
                    {ALL_PERIPHERALS.map((peripheral) => (
                      <th
                        key={peripheral}
                        className="text-center px-3 py-4 text-xs font-semibold text-[#6B6B8A] uppercase tracking-wider bg-[#12121A]"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        {peripheral}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIPHERAL_SUPPORT_MATRIX.map((row, rowIndex) => (
                    <motion.tr
                      key={row.mcu}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.2 + rowIndex * 0.05,
                      }}
                      className="border-b border-[#1E1E2E]/50 hover:bg-[#12121A]/50 transition-colors"
                    >
                      <td
                        className="px-5 py-3.5 text-sm font-semibold text-white bg-[#0D0D14]/50 sticky left-0 z-10"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        {row.mcu}
                      </td>
                      {ALL_PERIPHERALS.map((peripheral) => (
                        <td
                          key={peripheral}
                          className="text-center px-3 py-3.5 border border-[#1E1E2E]"
                        >
                          {row.peripherals[peripheral] ? (
                            <span className="text-[#00FF88] font-bold text-base">
                              &#10003;
                            </span>
                          ) : (
                            <span className="text-[#1E1E2E] text-base">
                              &#10007;
                            </span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[#00FF88] font-bold text-sm">&#10003;</span>
              <span
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Supported
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#1E1E2E] text-sm">&#10007;</span>
              <span
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Not available
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── Section 3: Example RTOS Prompts Gallery ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2
            className="text-xl font-bold text-[#E8E8F0] mb-1"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Example RTOS Prompts
          </h2>
          <p
            className="text-[#6B6B8A] text-sm mb-6"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Click any example to open it in the Architect.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.08 }}
                className="group rounded-xl border border-[#1E1E2E] bg-[#12121A] p-5 hover:border-[#00D4FF]/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Badges row */}
                <div className="flex items-center justify-between mb-4">
                  <MCUBadge name={example.mcu} />
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-[#1E1E2E] bg-[#12121A] text-[#7C3AED] rounded-full whitespace-nowrap select-none"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7C3AED] opacity-60" />
                    {example.rtos}
                  </span>
                </div>

                {/* Prompt text */}
                <p
                  className="text-sm text-[#E8E8F0]/80 leading-relaxed mb-4"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {example.prompt}
                </p>

                {/* Open in Architect link */}
                <Link
                  href={`/generate?tab=rtos&prompt=${encodeURIComponent(example.prompt)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#00D4FF]/70 hover:text-[#00D4FF] transition-colors"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Open in Architect
                  <span className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Section 4: Quick Start Guide ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <h2
            className="text-xl font-bold text-[#E8E8F0] mb-6"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Quick Start
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_START_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 + index * 0.1 }}
                className="relative rounded-xl border border-[#1E1E2E] bg-[#12121A] p-6 overflow-hidden card-hover"
              >
                {/* Decorative step number */}
                <div
                  className="absolute top-2 right-3 text-5xl font-bold text-[#00D4FF]/5 select-none pointer-events-none"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg border border-[#1E1E2E] bg-[#0D0D14] flex items-center justify-center text-lg mb-4">
                  {step.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-sm font-bold text-[#E8E8F0] mb-2"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="text-xs text-[#6B6B8A] leading-relaxed"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
