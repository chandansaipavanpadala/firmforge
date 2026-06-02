"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
  code: string;
  filename?: string;
  showLineNumbers?: boolean;
  animateIn?: boolean;
  isEmpty?: boolean;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Basic CSS-only syntax highlighting for C code.
 * Applies span classes for keywords, types, strings, comments, preprocessor, numbers.
 */
function highlightLine(line: string): string {
  // Escape HTML characters to prevent browser from interpreting C code as HTML tags
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Order matters: comments and strings first to avoid collisions.

  // Single-line comments
  let highlighted = escaped.replace(
    /(\/\/.*$)/g,
    '<span class="syntax-comment">$1</span>'
  );

  // Preprocessor directives
  highlighted = highlighted.replace(
    /^(\s*#\w+)/g,
    '<span class="syntax-preprocessor">$1</span>'
  );

  // Strings
  highlighted = highlighted.replace(
    /("(?:[^"\\]|\\.)*")/g,
    '<span class="syntax-string">$1</span>'
  );

  // Numbers
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*[fFuUlL]*)\b/g,
    '<span class="syntax-number">$1</span>'
  );

  // C keywords
  const keywords = [
    "void",
    "int",
    "float",
    "double",
    "char",
    "uint8_t",
    "uint16_t",
    "uint32_t",
    "int8_t",
    "int16_t",
    "int32_t",
    "const",
    "static",
    "volatile",
    "extern",
    "return",
    "if",
    "else",
    "while",
    "for",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "default",
    "struct",
    "typedef",
    "enum",
    "sizeof",
    "NULL",
  ];
  const keywordPattern = new RegExp(
    `\\b(${keywords.join("|")})\\b`,
    "g"
  );
  highlighted = highlighted.replace(
    keywordPattern,
    '<span class="syntax-keyword">$1</span>'
  );

  // Type-like identifiers (ending with _t, or known types)
  highlighted = highlighted.replace(
    /\b([A-Z][A-Za-z0-9_]*(?:TypeDef|Handle|Struct)?)\b/g,
    (match) => {
      // Don't re-highlight if already in a span
      if (match.includes("span")) return match;
      return `<span class="syntax-type">${match}</span>`;
    }
  );

  return highlighted;
}

export function CodeBlock({
  code,
  filename,
  showLineNumbers = true,
  animateIn = false,
  isEmpty = false,
  isStreaming = false,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = code.split("\n");

  if (isEmpty) {
    return (
      <div
        className={`relative rounded-xl border border-[#1E1E2E] bg-[#0D0D14] overflow-hidden ${className}`}
      >
        {filename && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E1E2E] bg-[#12121A]">
            <span
              className="text-xs text-[#6B6B8A]"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {filename}
            </span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-3 opacity-30">
          <div className="w-12 h-12 border-2 border-[#1E1E2E] rounded-lg flex items-center justify-center font-mono text-lg text-[#6B6B8A]">
            {`{ }`}
          </div>
          <p
            className="font-mono text-xs text-[#6B6B8A]"
          >
            Your generated code will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border border-[#1E1E2E] bg-[#0D0D14] overflow-hidden group ${className}`}
    >
      {/* Header bar */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E1E2E] bg-[#12121A]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] opacity-70" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E] opacity-70" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] opacity-70" />
            </div>
            <span
              className="text-xs text-[#6B6B8A] ml-2"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {filename}
            </span>
          </div>

          {/* Copy button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md text-[#6B6B8A] hover:text-[#E8E8F0] hover:bg-[#1E1E2E] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
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
                      Copy
                    </>
                  )}
                </button>
              }
            />
            <TooltipContent side="bottom">
              <p>{copied ? "Copied to clipboard!" : "Copy code"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="code-block p-4 min-w-0">
          {lines.map((line, i) => {
            const isLastLine = i === lines.length - 1;
            return (
              <motion.div
                key={`line-${i}`}
                initial={animateIn ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  animateIn
                    ? { duration: 0.15, delay: i * 0.03 }
                    : undefined
                }
                className="flex"
              >
                {showLineNumbers && (
                  <span className="code-line-number flex-shrink-0">
                    {i + 1}
                  </span>
                )}
                <span
                  className="flex-1 whitespace-pre"
                  dangerouslySetInnerHTML={{
                    __html: highlightLine(line) || "&nbsp;",
                  }}
                />
                {isStreaming && isLastLine && (
                  <span className="inline-block w-2 h-4 bg-[#00D4FF] animate-cursor ml-0.5 self-center" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Copy button when no filename header */}
      {!filename && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[#12121A] border border-[#1E1E2E] text-[#6B6B8A] hover:text-[#E8E8F0] hover:border-[#00D4FF]/30 transition-all opacity-0 group-hover:opacity-100"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {copied ? (
            <span className="text-[#00FF88]">Copied!</span>
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
              Copy
            </>
          )}
        </button>
      )}
    </div>
  );
}
