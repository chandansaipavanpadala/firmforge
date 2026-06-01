"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeBlock } from "@/components/code-block";
import {
  MCU_OPTIONS,
  PERIPHERAL_OPTIONS,
  CODE_STYLE_OPTIONS,
  DEMO_CODE,
  PLACEHOLDER_SNIPPET_CODE,
} from "@/lib/constants";

export function SnippetGenerator() {
  const [mcu, setMcu] = useState("");
  const [peripheral, setPeripheral] = useState("");
  const [codeStyle, setCodeStyle] = useState("");
  const [baudRate, setBaudRate] = useState("115200");
  const [txPin, setTxPin] = useState("PA9");
  const [rxPin, setRxPin] = useState("PA10");
  const [clockSpeed, setClockSpeed] = useState("72");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsLoading(true);
    // Fake 2-second loading state
    setTimeout(() => {
      setIsLoading(false);
      setGeneratedCode(DEMO_CODE);
      setHasGenerated(true);
    }, 2000);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "firmware.c";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedCode]);

  const selectedMCULabel = MCU_OPTIONS.find((o) => o.value === mcu)?.label || "MCU";
  const selectedPeripheralLabel =
    PERIPHERAL_OPTIONS.find((o) => o.value === peripheral)?.label || "Peripheral";
  const selectedStyleLabel =
    CODE_STYLE_OPTIONS.find((o) => o.value === codeStyle)?.label || "Style";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Left Panel: Inputs ─── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        {/* MCU Selection */}
        <div className="space-y-2">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Select MCU
          </label>
          <Select value={mcu} onValueChange={(v) => setMcu(v ?? "")}>
            <SelectTrigger className="w-full bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-11">
              <SelectValue placeholder="Choose your microcontroller" />
            </SelectTrigger>
            <SelectContent className="bg-[#12121A] border-[#1E1E2E]">
              {MCU_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-[#E8E8F0] focus:bg-[#1E1E2E] focus:text-[#00D4FF]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Peripheral Selection */}
        <div className="space-y-2">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Select Peripheral
          </label>
          <Select value={peripheral} onValueChange={(v) => setPeripheral(v ?? "")}>
            <SelectTrigger className="w-full bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-11">
              <SelectValue placeholder="Choose peripheral type" />
            </SelectTrigger>
            <SelectContent className="bg-[#12121A] border-[#1E1E2E]">
              {PERIPHERAL_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-[#E8E8F0] focus:bg-[#1E1E2E] focus:text-[#00D4FF]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Parameter Fields */}
        <div className="space-y-2">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Parameters
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Baud Rate
              </span>
              <Input
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                placeholder="115200"
                className="bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-10"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              />
            </div>
            <div className="space-y-1.5">
              <span
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                TX Pin
              </span>
              <Input
                value={txPin}
                onChange={(e) => setTxPin(e.target.value)}
                placeholder="PA9"
                className="bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-10"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              />
            </div>
            <div className="space-y-1.5">
              <span
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                RX Pin
              </span>
              <Input
                value={rxPin}
                onChange={(e) => setRxPin(e.target.value)}
                placeholder="PA10"
                className="bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-10"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              />
            </div>
            <div className="space-y-1.5">
              <span
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Clock Speed (MHz)
              </span>
              <Input
                value={clockSpeed}
                onChange={(e) => setClockSpeed(e.target.value)}
                placeholder="72"
                className="bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-10"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              />
            </div>
          </div>
        </div>

        {/* Code Style */}
        <div className="space-y-2">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Code Style
          </label>
          <Select value={codeStyle} onValueChange={(v) => setCodeStyle(v ?? "")}>
            <SelectTrigger className="w-full bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-11">
              <SelectValue placeholder="Choose code style" />
            </SelectTrigger>
            <SelectContent className="bg-[#12121A] border-[#1E1E2E]">
              {CODE_STYLE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-[#E8E8F0] focus:bg-[#1E1E2E] focus:text-[#00D4FF]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
            isLoading
              ? "bg-[#00D4FF]/50 text-black/50 cursor-not-allowed animate-pulse-glow"
              : "bg-[#00D4FF] text-black hover:bg-[#33DDFF] glow-cyan cursor-pointer"
          }`}
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="31.416"
                  strokeDashoffset="10"
                  strokeLinecap="round"
                />
              </svg>
              Generating...
            </span>
          ) : (
            "⚡ Generate Code"
          )}
        </motion.button>
      </motion.div>

      {/* ─── Right Panel: Output ─── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4"
      >
        {/* Tag showing selections */}
        <div className="flex items-center gap-2 flex-wrap">
          {mcu && (
            <Badge
              variant="outline"
              className="border-[#1E1E2E] bg-[#12121A] text-[#00D4FF] text-xs"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {selectedMCULabel}
            </Badge>
          )}
          {peripheral && (
            <Badge
              variant="outline"
              className="border-[#1E1E2E] bg-[#12121A] text-[#7C3AED] text-xs"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {selectedPeripheralLabel}
            </Badge>
          )}
          {codeStyle && (
            <Badge
              variant="outline"
              className="border-[#1E1E2E] bg-[#12121A] text-[#00FF88] text-xs"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {selectedStyleLabel}
            </Badge>
          )}
          {!mcu && !peripheral && !codeStyle && (
            <span
              className="text-xs text-[#6B6B8A]"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Select options to see your configuration
            </span>
          )}
        </div>

        {/* Code block */}
        {hasGenerated ? (
          <CodeBlock
            code={generatedCode}
            filename="firmware.c"
            animateIn={true}
          />
        ) : (
          <CodeBlock
            code={PLACEHOLDER_SNIPPET_CODE}
            filename="firmware.c"
            isEmpty={!hasGenerated && !isLoading}
          />
        )}

        {/* Download button */}
        {hasGenerated && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1E1E2E] bg-[#12121A] text-[#E8E8F0] hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5 transition-all text-sm cursor-pointer"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download .c file
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
