"use client";

import { motion } from "framer-motion";
import { PERIPHERAL_SUPPORT_MATRIX, ALL_PERIPHERALS } from "@/lib/constants";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-grid-pattern-subtle">
      {/* Ambient glow */}
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-[#00D4FF]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
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
            Supported MCUs & Peripherals
          </h1>
          <p
            className="text-[#6B6B8A] text-sm sm:text-base max-w-2xl"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            FirmForge supports a wide range of microcontrollers and peripherals.
            Check the compatibility matrix below to see what&apos;s available for
            your target platform.
          </p>
        </motion.div>

        {/* Support Matrix Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border border-[#1E1E2E] bg-[#12121A] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              {/* Header */}
              <thead>
                <tr className="border-b border-[#1E1E2E]">
                  <th
                    className="text-left px-5 py-4 text-xs font-semibold text-[#6B6B8A] uppercase tracking-wider bg-[#0D0D14] sticky left-0 z-10"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    MCU
                  </th>
                  {ALL_PERIPHERALS.map((peripheral) => (
                    <th
                      key={peripheral}
                      className="text-center px-3 py-4 text-xs font-semibold text-[#6B6B8A] uppercase tracking-wider bg-[#0D0D14]"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      {peripheral}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
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
                    className="border-b border-[#1E1E2E]/50 hover:bg-[#1E1E2E]/20 transition-colors"
                  >
                    <td
                      className="px-5 py-3.5 text-sm font-medium text-[#E8E8F0] bg-[#0D0D14]/50 sticky left-0 z-10"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#00D4FF] opacity-60" />
                        {row.mcu}
                      </div>
                    </td>
                    {ALL_PERIPHERALS.map((peripheral) => (
                      <td
                        key={peripheral}
                        className="text-center px-3 py-3.5"
                      >
                        {row.peripherals[peripheral] ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00FF88]/10">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00FF88"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-[#6B6B8A] text-lg">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-6 flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00FF88]/10">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00FF88"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span
              className="text-xs text-[#6B6B8A]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Supported
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 text-[#6B6B8A] text-sm">
              —
            </span>
            <span
              className="text-xs text-[#6B6B8A]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Not available
            </span>
          </div>
        </motion.div>

        {/* Additional Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="rounded-xl border border-[#1E1E2E] bg-[#12121A] p-5 card-hover">
            <div className="text-2xl mb-3">🎯</div>
            <h3
              className="text-sm font-bold text-[#E8E8F0] mb-1"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Register Accuracy
            </h3>
            <p
              className="text-xs text-[#6B6B8A] leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              All generated code uses verified register maps from official datasheets
              and reference manuals.
            </p>
          </div>
          <div className="rounded-xl border border-[#1E1E2E] bg-[#12121A] p-5 card-hover">
            <div className="text-2xl mb-3">📐</div>
            <h3
              className="text-sm font-bold text-[#E8E8F0] mb-1"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Code Styles
            </h3>
            <p
              className="text-xs text-[#6B6B8A] leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Choose between HAL abstraction layers, bare-metal register access,
              or Arduino IDE-compatible code.
            </p>
          </div>
          <div className="rounded-xl border border-[#1E1E2E] bg-[#12121A] p-5 card-hover">
            <div className="text-2xl mb-3">🔄</div>
            <h3
              className="text-sm font-bold text-[#E8E8F0] mb-1"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              RTOS Support
            </h3>
            <p
              className="text-xs text-[#6B6B8A] leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Generate FreeRTOS and Zephyr task architectures with proper
              priorities, queues, and semaphores.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
