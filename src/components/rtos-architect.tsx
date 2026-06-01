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
import {
  MCU_OPTIONS,
  RTOS_OPTIONS,
  RTOS_MAIN_C,
  RTOS_TASKS_H,
  RTOS_CONFIG_H,
} from "@/lib/constants";

export function RTOSArchitect() {
  const [description, setDescription] = useState("");
  const [mcu, setMcu] = useState("");
  const [rtos, setRtos] = useState("");
  const [includeTaskDiagram, setIncludeTaskDiagram] = useState(true);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [addComments, setAddComments] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [activeFileTab, setActiveFileTab] = useState("main.c");

  const handleGenerate = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasGenerated(true);
    }, 2000);
  }, []);

  const files = [
    { name: "main.c", code: RTOS_MAIN_C },
    { name: "tasks.h", code: RTOS_TASKS_H },
    { name: "config.h", code: RTOS_CONFIG_H },
  ];

  const activeFile = files.find((f) => f.name === activeFileTab) || files[0];

  return (
    <div className="space-y-6">
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
            style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.8125rem" }}
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
            <Select value={mcu} onValueChange={setMcu}>
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
            <Select value={rtos} onValueChange={setRtos}>
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
                checked={includeTaskDiagram}
                onCheckedChange={setIncludeTaskDiagram}
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
                checked={includeHeaders}
                onCheckedChange={setIncludeHeaders}
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
                checked={addComments}
                onCheckedChange={setAddComments}
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
      </motion.div>

      {/* ─── Output Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {hasGenerated ? (
          <div className="space-y-4">
            {/* File tabs */}
            <div className="flex gap-1 border-b border-[#1E1E2E]">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFileTab(file.name)}
                  className={`px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all cursor-pointer ${
                    activeFileTab === file.name
                      ? "bg-[#0D0D14] text-[#00D4FF] border border-[#1E1E2E] border-b-[#0D0D14] -mb-px"
                      : "text-[#6B6B8A] hover:text-[#E8E8F0] hover:bg-[#12121A]"
                  }`}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {file.name}
                </button>
              ))}
            </div>

            {/* Active file code block */}
            <CodeBlock
              code={activeFile.code}
              filename={activeFile.name}
              animateIn={true}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["main.c", "tasks.h", "config.h"].map((name) => (
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
