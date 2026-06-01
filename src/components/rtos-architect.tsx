"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeBlock } from "@/components/code-block";
import { MCU_OPTIONS, RTOS_OPTIONS } from "@/lib/constants";

// =============================================================================
// Types & Helpers
// =============================================================================

type FileStatus = "idle" | "streaming" | "complete";
type FileName = "main.c" | "tasks.h" | "config.h";

const FILE_NAMES: FileName[] = ["main.c", "tasks.h", "config.h"];

const NEXT_DELIMITERS: Record<FileName, string> = {
  "main.c": "===FILE:tasks.h===",
  "tasks.h": "===FILE:config.h===",
  "config.h": "===END===",
};

function getFileStatus(
  filename: FileName,
  raw: string,
  loading: boolean
): FileStatus {
  const delimiter = `===FILE:${filename}===`;
  if (!raw.includes(delimiter)) return "idle";
  const nextDelimiter = NEXT_DELIMITERS[filename];
  if (raw.includes(nextDelimiter) || !loading) return "complete";
  return "streaming";
}

function parseFiles(raw: string): Record<FileName, string> {
  const result: Record<FileName, string> = {
    "main.c": "",
    "tasks.h": "",
    "config.h": "",
  };

  const mainMatch = raw.match(
    /===FILE:main\.c===([\s\S]*?)(?:===FILE:|===END===|$)/
  );
  const tasksMatch = raw.match(
    /===FILE:tasks\.h===([\s\S]*?)(?:===FILE:|===END===|$)/
  );
  const configMatch = raw.match(
    /===FILE:config\.h===([\s\S]*?)(?:===FILE:|===END===|$)/
  );

  if (mainMatch) result["main.c"] = mainMatch[1].trim();
  if (tasksMatch) result["tasks.h"] = tasksMatch[1].trim();
  if (configMatch) result["config.h"] = configMatch[1].trim();

  return result;
}

// =============================================================================
// StatusDot — visual indicator for file generation state
// =============================================================================

function StatusDot({ status }: { status: FileStatus }) {
  if (status === "idle") {
    return <span className="w-2 h-2 rounded-full bg-[#6B6B8A]/50 flex-shrink-0" />;
  }
  if (status === "streaming") {
    return (
      <svg
        className="w-2.5 h-2.5 animate-spin flex-shrink-0"
        viewBox="0 0 10 10"
        fill="none"
      >
        <circle
          cx="5"
          cy="5"
          r="3.5"
          stroke="#00D4FF"
          strokeWidth="1.5"
          strokeDasharray="14"
          strokeDashoffset="5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // complete
  return <span className="w-2 h-2 rounded-full bg-[#00FF88] flex-shrink-0" />;
}

// =============================================================================
// RTOSArchitect Component
// =============================================================================

export function RTOSArchitect() {
  // ── Input state ─────────────────────────────────────────────────────────
  const [description, setDescription] = useState("");
  const [mcu, setMcu] = useState("");
  const [rtos, setRtos] = useState("");
  const [options, setOptions] = useState({
    includeSchedulingDiagram: false,
    includeHeaders: true,
    addDetailedComments: true,
  });

  // ── Generation state ────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawStream, setRawStream] = useState("");
  const [files, setFiles] = useState<Record<FileName, string>>({
    "main.c": "",
    "tasks.h": "",
    "config.h": "",
  });
  const [activeFile, setActiveFile] = useState<FileName>("main.c");
  const [copied, setCopied] = useState(false);

  // ── Derived state ───────────────────────────────────────────────────────
  const hasAnyContent = Object.values(files).some((c) => c.length > 0);
  const showOutput = isLoading || hasAnyContent;
  const activeContent = files[activeFile];
  const activeStatus = getFileStatus(activeFile, rawStream, isLoading);

  // ── Streaming generation handler ────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe your firmware behavior in more detail.");
      return;
    }
    if (!mcu || !rtos) {
      setError("MCU and RTOS are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRawStream("");
    setFiles({ "main.c": "", "tasks.h": "", "config.h": "" });

    try {
      const response = await fetch("/api/generate-rtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: description,
          mcu,
          rtos,
          options,
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
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setRawStream(accumulated);
        setFiles(parseFiles(accumulated));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(
        message.includes("API key")
          ? message
          : `Failed to generate firmware. ${message}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [description, mcu, rtos, options]);

  // ── Copy handler ────────────────────────────────────────────────────────
  const handleCopyFile = useCallback(async (content: string) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // ── Download handlers ───────────────────────────────────────────────────
  const handleDownloadSingle = useCallback(
    (filename: string, content: string) => {
      if (!content) return;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleDownloadAll = useCallback(() => {
    Object.entries(files).forEach(([filename, content]) => {
      if (!content) return;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [files]);

  // ═══════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ─── Error Card ─── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <div className="flex items-start justify-between">
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
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors ml-3 flex-shrink-0 cursor-pointer"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Input Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        {/* Description textarea */}
        <div className="space-y-2">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Describe your firmware behavior
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Read temperature from DHT22 every 2 seconds using a FreeRTOS task, apply a moving average filter, and publish via MQTT over WiFi. Alert via GPIO if temp exceeds 35°C."
            rows={5}
            className="bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] placeholder:text-[#6B6B8A]/60 focus-glow resize-none"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "0.8125rem",
            }}
          />
        </div>

        {/* MCU + RTOS selectors in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Select MCU
            </label>
            <Select value={mcu} onValueChange={(v) => setMcu(v ?? "")}>
              <SelectTrigger className="w-full bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-11">
                <SelectValue placeholder="Choose MCU" />
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

          <div className="space-y-2">
            <label
              className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Select RTOS
            </label>
            <Select value={rtos} onValueChange={(v) => setRtos(v ?? "")}>
              <SelectTrigger className="w-full bg-[#0D0D14] border-[#1E1E2E] text-[#E8E8F0] focus-glow h-11">
                <SelectValue placeholder="Choose RTOS" />
              </SelectTrigger>
              <SelectContent className="bg-[#12121A] border-[#1E1E2E]">
                {RTOS_OPTIONS.map((opt) => (
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
        </div>

        {/* Toggle switches */}
        <div className="space-y-3">
          <label
            className="block text-xs font-medium text-[#6B6B8A] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Options
          </label>
          <div className="space-y-3 rounded-xl border border-[#1E1E2E] bg-[#0D0D14] p-4">
            <div className="flex items-center justify-between">
              <span
                className="text-sm text-[#E8E8F0]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Include task scheduling diagram
              </span>
              <Switch
                checked={options.includeSchedulingDiagram}
                onCheckedChange={(v) =>
                  setOptions((prev) => ({
                    ...prev,
                    includeSchedulingDiagram: !!v,
                  }))
                }
                className="data-[state=checked]:bg-[#00D4FF]"
              />
            </div>
            <div className="h-px bg-[#1E1E2E]" />
            <div className="flex items-center justify-between">
              <span
                className="text-sm text-[#E8E8F0]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Include header files
              </span>
              <Switch
                checked={options.includeHeaders}
                onCheckedChange={(v) =>
                  setOptions((prev) => ({ ...prev, includeHeaders: !!v }))
                }
                className="data-[state=checked]:bg-[#00D4FF]"
              />
            </div>
            <div className="h-px bg-[#1E1E2E]" />
            <div className="flex items-center justify-between">
              <span
                className="text-sm text-[#E8E8F0]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Add detailed comments
              </span>
              <Switch
                checked={options.addDetailedComments}
                onCheckedChange={(v) =>
                  setOptions((prev) => ({
                    ...prev,
                    addDetailedComments: !!v,
                  }))
                }
                className="data-[state=checked]:bg-[#00D4FF]"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
            isLoading
              ? "bg-[#7C3AED]/50 text-white/50 cursor-not-allowed animate-pulse-glow"
              : "bg-[#7C3AED] text-white hover:bg-[#8B4FE8] glow-violet cursor-pointer"
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
              Architecting...
            </span>
          ) : (
            "🧠 Architect Firmware →"
          )}
        </motion.button>

        {/* Indeterminate progress bar while loading */}
        {isLoading && (
          <div className="w-full h-0.5 bg-[#1E1E2E] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#00D4FF] rounded-full"
              style={{ width: "40%" }}
              animate={{ x: ["-100%", "250%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        )}
      </motion.div>

      {/* ─── Output Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {showOutput ? (
          <div className="space-y-4">
            {/* File tab bar */}
            <div className="flex gap-2 flex-wrap">
              {FILE_NAMES.map((name) => {
                const status = getFileStatus(name, rawStream, isLoading);
                const isActive = activeFile === name;
                return (
                  <button
                    key={name}
                    onClick={() => setActiveFile(name)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#00D4FF]"
                        : "text-[#6B6B8A] hover:text-[#E8E8F0] border border-transparent hover:border-[#1E1E2E]"
                    }`}
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    <StatusDot status={status} />
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Code block */}
            <CodeBlock
              code={activeContent}
              filename={activeFile}
              isStreaming={activeStatus === "streaming"}
              isEmpty={!activeContent && activeStatus !== "streaming"}
              className="min-h-[500px]"
            />

            {/* Stats bar */}
            {hasAnyContent && activeContent && (
              <div
                className="flex items-center gap-3 text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                <span>
                  Lines:{" "}
                  <span className="text-[#00D4FF]">
                    {activeContent.split("\n").length}
                  </span>
                </span>
                <span className="text-[#6B6B8A]/40">·</span>
                <span>
                  Characters:{" "}
                  <span className="text-[#00D4FF]">
                    {activeContent.length}
                  </span>
                </span>
                <span className="text-[#6B6B8A]/40">·</span>
                <span>
                  Functions:{" "}
                  <span className="text-[#00D4FF]">
                    {(activeContent.match(/\w+\s*\(/g) || []).length}
                  </span>
                </span>
              </div>
            )}

            {/* Action buttons */}
            {hasAnyContent && (
              <div className="flex items-center gap-3 flex-wrap">
                {/* Copy active file */}
                <button
                  onClick={() => handleCopyFile(activeContent)}
                  disabled={!activeContent}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    !activeContent
                      ? "border-[#1E1E2E]/50 bg-[#12121A]/50 text-[#6B6B8A]/50 cursor-not-allowed"
                      : "border-[#1E1E2E] bg-[#12121A] text-[#E8E8F0] hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5 cursor-pointer"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {copied ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#00FF88"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[#00FF88]">Copied!</span>
                    </>
                  ) : (
                    <>
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
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy {activeFile}
                    </>
                  )}
                </button>

                {/* Download active file */}
                <button
                  onClick={() =>
                    handleDownloadSingle(activeFile, activeContent)
                  }
                  disabled={!activeContent}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    !activeContent
                      ? "border-[#1E1E2E]/50 bg-[#12121A]/50 text-[#6B6B8A]/50 cursor-not-allowed"
                      : "border-[#1E1E2E] bg-[#12121A] text-[#E8E8F0] hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5 cursor-pointer"
                  }`}
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
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download {activeFile}
                </button>

                {/* Download all */}
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1E1E2E] bg-[#12121A] text-[#E8E8F0] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-all text-sm cursor-pointer"
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
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download All Files{" "}
                  <span className="text-[#6B6B8A] text-xs">
                    (.zip coming soon)
                  </span>
                </button>
              </div>
            )}

            {/* Token counter */}
            {hasAnyContent && activeContent && (
              <p
                className="text-xs text-[#6B6B8A]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Generated {activeContent.split("\n").length} lines ·{" "}
                {activeContent.length} characters
              </p>
            )}
          </div>
        ) : (
          /* Empty state — 3 shimmer blocks */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FILE_NAMES.map((name) => (
              <CodeBlock
                key={name}
                code=""
                filename={name}
                isEmpty={true}
                className="min-h-[200px]"
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
