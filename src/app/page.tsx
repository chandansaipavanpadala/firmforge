"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MCUBadge } from "@/components/mcu-badge";
import { MCU_BADGES, FEATURE_CARDS, DEMO_PROMPT, DEMO_CODE } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────
// Hero typing animation hook
// ─────────────────────────────────────────────────────────────
function useTypingAnimation(text: string, speed: number = 40, startDelay: number = 1500) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const startTimeout = setTimeout(() => {
      const typeChar = () => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(typeChar, speed);
        } else {
          setIsComplete(true);
        }
      };
      typeChar();
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay]);

  return { displayedText, isComplete };
}

function useCodeReveal(code: string, lineDelay: number = 80, startDelay: number = 4000) {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = code.split("\n");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentLine = 0;

    const startTimeout = setTimeout(() => {
      const revealLine = () => {
        if (currentLine < lines.length) {
          currentLine++;
          setVisibleLines(currentLine);
          timeout = setTimeout(revealLine, lineDelay);
        }
      };
      revealLine();
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, [code, lineDelay, startDelay, lines.length]);

  return { visibleLines, lines };
}

// ─────────────────────────────────────────────────────────────
// Main Landing Page
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const { displayedText: typedPrompt, isComplete: promptDone } =
    useTypingAnimation(DEMO_PROMPT, 35, 1200);
  const { visibleLines, lines: codeLines } = useCodeReveal(DEMO_CODE, 60, 4500);

  // Word-by-word animation for the hero heading
  const heroWords = "Firmware. From a Single Prompt.".split(" ");

  return (
    <div className="relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* ════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Radial glow behind hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#7C3AED]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Main heading with word-by-word animation */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            {heroWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="inline-block mr-[0.25em]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {word === "Prompt." ? (
                  <span className="gradient-text-cyan">{word}</span>
                ) : (
                  <span className="text-[#E8E8F0]">{word}</span>
                )}
              </motion.span>
            ))}
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-[#6B6B8A] max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Generate production-ready embedded C code for STM32, ESP32, Arduino
            and more. From peripheral snippets to full RTOS architectures.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/generate"
              className="inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-sm bg-[#00D4FF] text-black hover:bg-[#33DDFF] glow-cyan transition-all duration-200"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Generate a Snippet →
            </Link>
            <Link
              href="/generate?tab=rtos"
              className="inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-sm border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 glow-violet transition-all duration-200"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Design RTOS Architecture →
            </Link>
          </motion.div>

          {/* ─── Typing Demo ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-[#1E1E2E] bg-[#12121A] overflow-hidden shadow-2xl">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E1E2E] bg-[#0D0D14]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57] opacity-70" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E] opacity-70" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840] opacity-70" />
                </div>
                <span
                  className="text-xs text-[#6B6B8A] ml-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  FirmForge — firmware.c
                </span>
              </div>

              {/* Prompt area */}
              <div className="px-5 py-3 border-b border-[#1E1E2E] bg-[#0A0A0F]/50">
                <div className="flex items-start gap-2">
                  <span className="text-[#00D4FF] text-xs mt-0.5" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                    &gt;
                  </span>
                  <p
                    className="text-sm text-[#E8E8F0] leading-relaxed"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {typedPrompt}
                    {!promptDone && (
                      <span className="inline-block w-2 h-4 bg-[#00D4FF] ml-0.5 animate-cursor" />
                    )}
                  </p>
                </div>
              </div>

              {/* Code output area */}
              <div className="p-4 max-h-[320px] overflow-y-auto">
                <div className="code-block">
                  {codeLines.slice(0, visibleLines).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex"
                    >
                      <span className="code-line-number flex-shrink-0">
                        {i + 1}
                      </span>
                      <span
                        className="flex-1 whitespace-pre"
                        dangerouslySetInnerHTML={{
                          __html: highlightLine(line) || "&nbsp;",
                        }}
                      />
                    </motion.div>
                  ))}
                  {visibleLines < codeLines.length && visibleLines > 0 && (
                    <div className="flex mt-1">
                      <span className="code-line-number flex-shrink-0">&nbsp;</span>
                      <span className="inline-block w-2 h-4 bg-[#00D4FF] animate-cursor" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── MCU Badge Marquee ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="w-full max-w-5xl mx-auto mt-16 overflow-hidden"
        >
          <p
            className="text-center text-xs text-[#6B6B8A] uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Supported Microcontrollers
          </p>
          <div className="relative overflow-hidden py-2">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0A0A0F] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0F] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-marquee">
              {[...MCU_BADGES, ...MCU_BADGES].map((badge, i) => (
                <MCUBadge key={`${badge.name}-${i}`} name={badge.name} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURE CARDS SECTION
          ════════════════════════════════════════════ */}
      <section
        ref={featuresRef}
        className="relative py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#E8E8F0] mb-3"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Everything You Need
            </h2>
            <p
              className="text-[#6B6B8A] text-base"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              From quick register snippets to full firmware architectures
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <Card className="bg-[#12121A] border-[#1E1E2E] rounded-xl card-hover h-full">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{card.icon}</div>
                    <h3
                      className="text-lg font-bold text-[#E8E8F0] mb-2"
                      style={{ fontFamily: "var(--font-syne)" }}
                    >
                      {card.title}
                    </h3>
                    <p
                      className="text-sm text-[#6B6B8A] leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA SECTION
          ════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#E8E8F0] mb-4"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Start Building{" "}
              <span className="gradient-text-cyan">Firmware</span> Today
            </h2>
            <p
              className="text-[#6B6B8A] mb-8 text-lg"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              No setup required. Select your MCU, describe what you need, and
              get production-ready code in seconds.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-base bg-[#00D4FF] text-black hover:bg-[#33DDFF] glow-cyan-lg transition-all duration-200"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Launch FirmForge →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Inline syntax highlighter (same as code-block.tsx)
// ─────────────────────────────────────────────────────────────
function highlightLine(line: string): string {
  let highlighted = line.replace(
    /(\/\/.*$)/g,
    '<span class="syntax-comment">$1</span>'
  );
  highlighted = highlighted.replace(
    /^(\s*#\w+)/g,
    '<span class="syntax-preprocessor">$1</span>'
  );
  highlighted = highlighted.replace(
    /("(?:[^"\\]|\\.)*")/g,
    '<span class="syntax-string">$1</span>'
  );
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*[fFuUlL]*)\b/g,
    '<span class="syntax-number">$1</span>'
  );
  const keywords = [
    "void", "int", "float", "double", "char", "uint8_t", "uint16_t", "uint32_t",
    "const", "static", "volatile", "return", "if", "else", "while", "for",
    "struct", "typedef", "sizeof", "NULL",
  ];
  const keywordPattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  highlighted = highlighted.replace(
    keywordPattern,
    '<span class="syntax-keyword">$1</span>'
  );
  highlighted = highlighted.replace(
    /\b([A-Z][A-Za-z0-9_]*(?:TypeDef|Handle|Struct)?)\b/g,
    (match) => {
      if (match.includes("span")) return match;
      return `<span class="syntax-type">${match}</span>`;
    }
  );
  return highlighted;
}
