"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
} from "@/lib/constants";
import { getPeripheralParams } from "@/lib/peripheral-params";

export function SnippetGenerator() {
  const [mcu, setMcu] = useState("");
  const [peripheral, setPeripheral] = useState("");
  const [codeStyle, setCodeStyle] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Get dynamic parameter definitions for the selected peripheral
  const peripheralParams = peripheral ? getPeripheralParams(peripheral) : [];

  // Reset parameter values when peripheral changes, pre-fill select defaults
  useEffect(() => {
    if (!peripheral) {
      setParamValues({});
      return;
    }
    const params = getPeripheralParams(peripheral);
    const defaults: Record<string, string> = {};
    for (const param of params) {
      if (param.type === "select" && param.options && param.options.length > 0) {
        // Pre-fill with placeholder value (first option or common default)
        const placeholderIdx = param.options.indexOf(param.placeholder);
        defaults[param.key] =
          placeholderIdx >= 0 ? param.options[placeholderIdx] : param.options[0];
      } else {
        defaults[param.key] = param.placeholder;
      }
    }
    setParamValues(defaults);
  }, [peripheral]);

  const updateParam = useCallback((key: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Real streaming generation ─────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!mcu || !peripheral) return;

    setIsLoading(true);
    setIsStreaming(true);
    setGeneratedCode("");
    setError(null);
    setHasGenerated(false);
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const response = await fetch("/api/generate-snippet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcu,
          peripheral,
          codeStyle: codeStyle || "HAL Library",
          parameters: paramValues,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Generation failed";
        try {
          const errBody = await response.json();
          errorMsg = errBody.error || errorMsg;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMsg);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullCode = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullCode += chunk;
        setGeneratedCode(fullCode);
      }

      setHasGenerated(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(
        message.includes("API key")
          ? message
          : `Failed to generate code. ${message}`
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [mcu, peripheral, codeStyle, paramValues]);

  // ── Ctrl+Enter keyboard shortcut ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleGenerate]);

  // ── Download handler ──────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mcu}_${peripheral}_init.c`.replace(/[^a-z0-9_.]/gi, "_");
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedCode, mcu, peripheral]);

  const selectedMCULabel =
    MCU_OPTIONS.find((o) => o.value === mcu)?.label || "MCU";
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
          <Select
            value={peripheral}
            onValueChange={(v) => setPeripheral(v ?? "")}
          >
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
        {peripheralParams.length > 0 && (
          <div className="space-y-2">
            <label
              className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Parameters
            </label>
            <div className="grid grid-cols-2 gap-3">
              {peripheralParams.map((param) => (
                <div key={param.key} className="space-y-1.5">
                  <span
                    className="text-xs text-[#6B6B8A]"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {param.label}
                  </span>
                  {param.type === "select" && param.options ? (
                    <Select
                      value={paramValues[param.key] || ""}
                      onValueChange={(v) =>
                        updateParam(param.key, v ?? "")
                      }
                    >
                      <SelectTrigger className="w-full bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-10 text-xs">
                        <SelectValue placeholder={param.placeholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121A] border-[#1E1E2E]">
                        {param.options.map((opt) => (
                          <SelectItem
                            key={opt}
                            value={opt}
                            className="text-[#E8E8F0] focus:bg-[#1E1E2E] focus:text-[#00D4FF] text-xs"
                          >
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={paramValues[param.key] || ""}
                      onChange={(e) =>
                        updateParam(param.key, e.target.value)
                      }
                      placeholder={param.placeholder}
                      className="bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-10 text-xs"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Style */}
        <div className="space-y-2">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Code Style
          </label>
          <Select
            value={codeStyle}
            onValueChange={(v) => setCodeStyle(v ?? "")}
          >
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
          disabled={isLoading || !mcu || !peripheral}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
            isLoading
              ? "bg-[#00D4FF]/50 text-black/50 cursor-not-allowed animate-pulse-glow"
              : !mcu || !peripheral
                ? "bg-[#00D4FF]/30 text-black/30 cursor-not-allowed"
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
        <p className="text-xs text-[#6B6B8A] font-mono mt-2">
          ⌘ + Enter to generate
        </p>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <div className="flex items-start gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p
                className="text-xs text-red-400 leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ─── Right Panel: Output ─── */}
      <div ref={outputRef}>
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
        {generatedCode ? (
          <CodeBlock
            code={generatedCode}
            filename={
              hasGenerated
                ? `${mcu}_${peripheral}_init.c`.replace(/[^a-z0-9_.]/gi, "_")
                : "firmware.c"
            }
            isStreaming={isStreaming}
          />
        ) : (
          <CodeBlock
            code=""
            filename="firmware.c"
            isEmpty={!isLoading}
          />
        )}

        {/* Download button */}
        {hasGenerated && generatedCode && (
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

        {/* Token counter */}
        {generatedCode && (
          <p
            className="text-xs text-[#6B6B8A]"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Generated {generatedCode.split("\n").length} lines ·{" "}
            {generatedCode.length} characters
          </p>
        )}
      </motion.div>
      </div>
    </div>
  );
}
