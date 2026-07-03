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
import { useCodeHistory, type HistoryEntry } from "@/lib/use-code-history";
import { CodeHistoryPanel } from "@/components/code-history";
import { TemplatePicker } from "@/components/template-picker";
import type { SnippetTemplate } from "@/lib/prompt-templates";
import { isShareEnabled, createShareLink } from "@/lib/supabase";

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

  // ── History ────────────────────────────────────────────────────────────
  const { entries, addEntry, removeEntry, clearAll } = useCodeHistory();
  const [historyOpen, setHistoryOpen] = useState(false);

  // ── Share ──────────────────────────────────────────────────────────────
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const shareEnabled = isShareEnabled();

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

  // ── Template selection handler ────────────────────────────────────────
  const handleTemplateSelect = useCallback((template: SnippetTemplate) => {
    setMcu(template.mcu);
    setPeripheral(template.peripheral);
    setCodeStyle(template.codeStyle);
    if (template.params) {
      setParamValues((prev) => ({ ...prev, ...template.params }));
    }
  }, []);

  // ── History restore handler ───────────────────────────────────────────
  const handleHistoryRestore = useCallback((entry: HistoryEntry) => {
    setGeneratedCode(entry.code);
    setHasGenerated(true);
    setError(null);
  }, []);

  // ── Real streaming generation ─────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!mcu || !peripheral) return;

    setIsLoading(true);
    setIsStreaming(true);
    setGeneratedCode("");
    setError(null);
    setHasGenerated(false);
    setShareUrl(null);
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

      // Save to history
      const selectedPeripheralLabel =
        PERIPHERAL_OPTIONS.find((o) => o.value === peripheral)?.label || peripheral;
      addEntry({
        type: "snippet",
        label: `${mcu} — ${selectedPeripheralLabel}`,
        mcu,
        secondary: selectedPeripheralLabel,
        code: fullCode,
        lineCount: fullCode.split("\n").length,
      });
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
  }, [mcu, peripheral, codeStyle, paramValues, addEntry]);

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

  // ── Share handler ─────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!generatedCode || !shareEnabled) return;
    setIsSharing(true);
    try {
      const selectedPeripheralLabel =
        PERIPHERAL_OPTIONS.find((o) => o.value === peripheral)?.label || peripheral;
      const shortId = await createShareLink(generatedCode, {
        type: "snippet",
        mcu,
        peripheral,
        codeStyle: codeStyle || "HAL Library",
        label: `${mcu} — ${selectedPeripheralLabel}`,
      });
      if (shortId) {
        const url = `${window.location.origin}/share?id=${shortId}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
      }
    } catch {
      setError("Failed to create share link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  }, [generatedCode, shareEnabled, mcu, peripheral, codeStyle]);

  const selectedMCULabel =
    MCU_OPTIONS.find((o) => o.value === mcu)?.label || "MCU";
  const selectedPeripheralLabel =
    PERIPHERAL_OPTIONS.find((o) => o.value === peripheral)?.label || "Peripheral";
  const selectedStyleLabel =
    CODE_STYLE_OPTIONS.find((o) => o.value === codeStyle)?.label || "Style";

  return (
    <>
      {/* History sidebar */}
      <CodeHistoryPanel
        entries={entries}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleHistoryRestore}
        onRemove={removeEntry}
        onClearAll={clearAll}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Left Panel: Inputs ─── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Template Picker */}
          <TemplatePicker
            type="snippet"
            onSelect={handleTemplateSelect}
          />

          {/* MCU Selection */}
          <div className="space-y-2">
            <label
              className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Select MCU
            </label>
            <Select value={mcu} onValueChange={(v) => setMcu(v ?? "")}>
              <SelectTrigger className="w-full bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] focus-glow h-11">
                <SelectValue placeholder="Choose your microcontroller" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                {MCU_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-[var(--foreground)] focus:bg-[var(--muted)] focus:text-[var(--primary)]"
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
              className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Select Peripheral
            </label>
            <Select
              value={peripheral}
              onValueChange={(v) => setPeripheral(v ?? "")}
            >
              <SelectTrigger className="w-full bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] focus-glow h-11">
                <SelectValue placeholder="Choose peripheral type" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                {PERIPHERAL_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-[var(--foreground)] focus:bg-[var(--muted)] focus:text-[var(--primary)]"
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
                className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Parameters
              </label>
              <div className="grid grid-cols-2 gap-3">
                {peripheralParams.map((param) => (
                  <div key={param.key} className="space-y-1.5">
                    <span
                      className="text-xs text-[var(--muted-foreground)]"
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
                        <SelectTrigger className="w-full bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] focus-glow h-10 text-xs">
                          <SelectValue placeholder={param.placeholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                          {param.options.map((opt) => (
                            <SelectItem
                              key={opt}
                              value={opt}
                              className="text-[var(--foreground)] focus:bg-[var(--muted)] focus:text-[var(--primary)] text-xs"
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
                        className="bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] focus-glow h-10 text-xs"
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
              className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Code Style
            </label>
            <Select
              value={codeStyle}
              onValueChange={(v) => setCodeStyle(v ?? "")}
            >
              <SelectTrigger className="w-full bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] focus-glow h-11">
                <SelectValue placeholder="Choose code style" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                {CODE_STYLE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-[var(--foreground)] focus:bg-[var(--muted)] focus:text-[var(--primary)]"
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
              "Generate Code"
            )}
          </motion.button>
          <p className="text-xs text-[var(--muted-foreground)] font-mono mt-2">
            Ctrl + Enter to generate
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
          {/* Tag showing selections + History button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {mcu && (
                <Badge
                  variant="outline"
                  className="border-[var(--border)] bg-[var(--card)] text-[var(--primary)] text-xs"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {selectedMCULabel}
                </Badge>
              )}
              {peripheral && (
                <Badge
                  variant="outline"
                  className="border-[var(--border)] bg-[var(--card)] text-[#7C3AED] text-xs"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {selectedPeripheralLabel}
                </Badge>
              )}
              {codeStyle && (
                <Badge
                  variant="outline"
                  className="border-[var(--border)] bg-[var(--card)] text-[#00FF88] text-xs"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {selectedStyleLabel}
                </Badge>
              )}
              {!mcu && !peripheral && !codeStyle && (
                <span
                  className="text-xs text-[var(--muted-foreground)]"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  Select options to see your configuration
                </span>
              )}
            </div>

            {/* History toggle */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/30 transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
              {entries.length > 0 && (
                <span className="text-[10px] bg-[var(--muted)] px-1.5 py-0.5 rounded-full">
                  {entries.length}
                </span>
              )}
            </button>
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

          {/* Action buttons */}
          {hasGenerated && generatedCode && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Download */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all text-sm cursor-pointer"
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

              {/* Share */}
              {shareEnabled && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-all text-sm cursor-pointer disabled:opacity-50"
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
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {isSharing ? "Sharing..." : shareUrl ? "Link copied!" : "Share"}
                </motion.button>
              )}

              {/* Share URL display */}
              {shareUrl && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[#00FF88]"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  Link copied to clipboard
                </motion.span>
              )}
            </div>
          )}

          {/* Token counter */}
          {generatedCode && (
            <p
              className="text-xs text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Generated {generatedCode.split("\n").length} lines ·{" "}
              {generatedCode.length} characters
            </p>
          )}
        </motion.div>
        </div>
      </div>
    </>
  );
}
