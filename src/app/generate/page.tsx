"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SnippetGenerator } from "@/components/snippet-generator";
import { RTOSArchitect } from "@/components/rtos-architect";

function GenerateContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultPrompt = searchParams.get("prompt") ?? "";
  const [activeTab, setActiveTab] = useState(
    tabParam === "rtos" ? "rtos" : "snippet"
  );

  useEffect(() => {
    if (tabParam === "rtos") {
      setActiveTab("rtos");
    }
  }, [tabParam]);

  return (
    <div className="relative min-h-screen bg-grid-pattern-subtle">
      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00D4FF]/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#7C3AED]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#E8E8F0] mb-2"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Code Generator
          </h1>
          <p
            className="text-[#6B6B8A] text-sm sm:text-base"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Select your MCU, configure peripherals, and generate production-ready
            embedded C code.
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
            <span className="text-[#6B6B8A]">Generate</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v ?? "snippet")}
          className="w-full"
        >
          <TabsList className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-1 mb-8 w-full sm:w-auto">
            <TabsTrigger
              value="snippet"
              className="rounded-lg px-5 py-2.5 text-sm font-medium data-active:bg-[#00D4FF]/10 data-active:text-[#00D4FF] data-active:shadow-[0_0_10px_rgba(0,212,255,0.15)] transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              ⚡ Snippet Generator
            </TabsTrigger>
            <TabsTrigger
              value="rtos"
              className="rounded-lg px-5 py-2.5 text-sm font-medium data-active:bg-[#7C3AED]/10 data-active:text-[#7C3AED] data-active:shadow-[0_0_10px_rgba(124,58,237,0.15)] transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              🧠 RTOS Architect
            </TabsTrigger>
          </TabsList>

          <TabsContent value="snippet" className="mt-0">
            <motion.div
              key="snippet"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SnippetGenerator />
            </motion.div>
          </TabsContent>

          <TabsContent value="rtos" className="mt-0">
            <motion.div
              key="rtos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RTOSArchitect initialPrompt={defaultPrompt} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 px-4">
          <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
            <div className="h-4 w-32 bg-[#1E1E2E] rounded" />
            <div className="h-8 w-64 bg-[#1E1E2E] rounded" />
            <div className="h-12 w-48 bg-[#1E1E2E] rounded-lg mt-4" />
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="h-96 bg-[#12121A] rounded-xl border border-[#1E1E2E]" />
              <div className="h-96 bg-[#12121A] rounded-xl border border-[#1E1E2E]" />
            </div>
          </div>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
