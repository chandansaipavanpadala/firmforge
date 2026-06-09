"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HistoryEntry } from "@/lib/use-code-history";

// =============================================================================
// CodeHistoryPanel — slide-out sidebar for browsing past generations
// =============================================================================

interface CodeHistoryPanelProps {
  entries: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CodeHistoryPanel({
  entries,
  isOpen,
  onClose,
  onRestore,
  onRemove,
  onClearAll,
}: CodeHistoryPanelProps) {
  const [previewEntry, setPreviewEntry] = useState<HistoryEntry | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{
              background: "rgba(12, 12, 18, 0.95)",
              backdropFilter: "blur(20px) saturate(180%)",
              borderLeft: "1px solid rgba(30, 30, 46, 0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E2E]">
              <div className="flex items-center gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00D4FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h2
                  className="text-base font-semibold text-[#E8E8F0]"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  Code History
                </h2>
                <span className="text-xs text-[#6B6B8A] bg-[#1E1E2E] px-2 py-0.5 rounded-full">
                  {entries.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {entries.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-[#6B6B8A] hover:text-red-400 transition-colors px-2 py-1 rounded cursor-pointer"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#6B6B8A] hover:text-[#E8E8F0] hover:bg-[#1E1E2E] transition-colors cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
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
            </div>

            {/* Preview panel (when an entry is being previewed) */}
            <AnimatePresence>
              {previewEntry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-[#1E1E2E] overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium text-[#00D4FF] uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        Preview
                      </span>
                      <button
                        onClick={() => setPreviewEntry(null)}
                        className="text-xs text-[#6B6B8A] hover:text-[#E8E8F0] transition-colors cursor-pointer"
                      >
                        Close preview
                      </button>
                    </div>
                    <pre
                      className="text-xs text-[#E8E8F0] bg-[#0D0D14] rounded-lg p-3 max-h-48 overflow-auto code-block"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      {previewEntry.type === "rtos"
                        ? (() => {
                            try {
                              const files = JSON.parse(previewEntry.code);
                              return Object.entries(files)
                                .filter(([, v]) => (v as string).length > 0)
                                .map(
                                  ([k, v]) =>
                                    `// === ${k} ===\n${(v as string).substring(0, 300)}${(v as string).length > 300 ? "\n// ..." : ""}`
                                )
                                .join("\n\n");
                            } catch {
                              return previewEntry.code.substring(0, 600);
                            }
                          })()
                        : previewEntry.code.substring(0, 600) +
                          (previewEntry.code.length > 600 ? "\n// ..." : "")}
                    </pre>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onRestore(previewEntry);
                        setPreviewEntry(null);
                        onClose();
                      }}
                      className="w-full py-2 px-4 rounded-lg bg-[#00D4FF] text-black text-sm font-bold transition-all hover:bg-[#33DDFF] glow-cyan cursor-pointer"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      Restore This Code
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Entry List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B6B8A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-4 opacity-40"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p
                    className="text-sm text-[#6B6B8A] mb-1"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    No history yet
                  </p>
                  <p
                    className="text-xs text-[#6B6B8A]/60"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    Generated code snippets will appear here for quick access.
                  </p>
                </div>
              ) : (
                entries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group rounded-xl border border-[#1E1E2E] bg-[#12121A]/80 hover:border-[#00D4FF]/20 hover:bg-[#12121A] transition-all p-3.5 cursor-pointer"
                    onClick={() => setPreviewEntry(entry)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Type badge + label */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              entry.type === "snippet"
                                ? "bg-[#00D4FF]/10 text-[#00D4FF]"
                                : "bg-[#7C3AED]/10 text-[#7C3AED]"
                            }`}
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                            }}
                          >
                            {entry.type === "snippet" ? "SNIP" : "RTOS"}
                          </span>
                          <span
                            className="text-sm text-[#E8E8F0] truncate font-medium"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {entry.label}
                          </span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-2 text-xs text-[#6B6B8A]">
                          <span
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                            }}
                          >
                            {entry.mcu}
                          </span>
                          <span className="text-[#6B6B8A]/30">·</span>
                          <span>{entry.secondary}</span>
                          <span className="text-[#6B6B8A]/30">·</span>
                          <span>{entry.lineCount} lines</span>
                          <span className="text-[#6B6B8A]/30">·</span>
                          <span>{formatTimestamp(entry.timestamp)}</span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(entry.id);
                          if (previewEntry?.id === entry.id) {
                            setPreviewEntry(null);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#6B6B8A] hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#1E1E2E]">
              <p
                className="text-[10px] text-[#6B6B8A]/60 text-center"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Stores the last 10 generations locally in your browser
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
