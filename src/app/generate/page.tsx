"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SnippetGenerator } from "@/components/snippet-generator";
import { RTOSArchitect } from "@/components/rtos-architect";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "rtos" ? "rtos" : "snippet");

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
            Select your MCU, configure peripherals, and generate production-ready embedded C code.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-1 mb-8 w-full sm:w-auto">
            <TabsTrigger
              value="snippet"
              className="rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-[#00D4FF]/10 data-[state=active]:text-[#00D4FF] data-[state=active]:shadow-[0_0_10px_rgba(0,212,255,0.15)] data-[state=inactive]:text-[#6B6B8A] transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              ⚡ Snippet Generator
            </TabsTrigger>
            <TabsTrigger
              value="rtos"
              className="rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-[#7C3AED]/10 data-[state=active]:text-[#7C3AED] data-[state=active]:shadow-[0_0_10px_rgba(124,58,237,0.15)] data-[state=inactive]:text-[#6B6B8A] transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              🧠 RTOS Architect
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="snippet" className="mt-0">
              <motion.div
                key="snippet"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
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
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RTOSArchitect />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
