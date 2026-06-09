"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SNIPPET_TEMPLATES,
  RTOS_TEMPLATES,
  getCategories,
  type SnippetTemplate,
  type RTOSTemplate,
} from "@/lib/prompt-templates";

// =============================================================================
// TemplatePicker — searchable dropdown for pre-built firmware templates
// =============================================================================

interface SnippetTemplatePickerProps {
  type: "snippet";
  onSelect: (template: SnippetTemplate) => void;
}

interface RTOSTemplatePickerProps {
  type: "rtos";
  onSelect: (template: RTOSTemplate) => void;
}

type TemplatePickerProps = SnippetTemplatePickerProps | RTOSTemplatePickerProps;

export function TemplatePicker(props: TemplatePickerProps) {
  const { type } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


  const categories = useMemo(() => getCategories(type), [type]);

  const filtered = useMemo(() => {
    const allTemplates = type === "snippet" ? SNIPPET_TEMPLATES : RTOS_TEMPLATES;
    const byCategory = selectedCategory
      ? allTemplates.filter((t) => t.category === selectedCategory)
      : allTemplates;
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [type, selectedCategory, search]);

  const handleSelect = (template: SnippetTemplate | RTOSTemplate) => {
    if (type === "snippet") {
      (props as SnippetTemplatePickerProps).onSelect(
        template as SnippetTemplate
      );
    } else {
      (props as RTOSTemplatePickerProps).onSelect(template as RTOSTemplate);
    }
    setIsOpen(false);
    setSearch("");
    setSelectedCategory(null);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#1E1E2E] hover:border-[#00D4FF]/30 bg-transparent hover:bg-[#00D4FF]/5 transition-all text-xs cursor-pointer"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00D4FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span className="text-[#6B6B8A] hover:text-[#E8E8F0] transition-colors">
          Use a template
        </span>
        <span className="text-[10px] text-[#6B6B8A]/50 bg-[#1E1E2E] px-1.5 py-0.5 rounded">
          {type === "snippet" ? SNIPPET_TEMPLATES.length : RTOS_TEMPLATES.length}
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
                setSelectedCategory(null);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 w-[420px] max-h-[480px] z-40 rounded-xl border border-[#1E1E2E] overflow-hidden flex flex-col"
              style={{
                background: "rgba(12, 12, 18, 0.98)",
                backdropFilter: "blur(16px)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(0,212,255,0.1)",
              }}
            >
              {/* Search input */}
              <div className="p-3 border-b border-[#1E1E2E]">
                <div className="relative">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B6B8A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#0D0D14] border border-[#1E1E2E] rounded-lg text-[#E8E8F0] placeholder:text-[#6B6B8A]/50 focus:outline-none focus:border-[#00D4FF]/40"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Category pills */}
              <div className="px-3 py-2 border-b border-[#1E1E2E] flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                    selectedCategory === null
                      ? "bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30"
                      : "text-[#6B6B8A] hover:text-[#E8E8F0] border border-transparent hover:border-[#1E1E2E]"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat ? null : cat
                      )
                    }
                    className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30"
                        : "text-[#6B6B8A] hover:text-[#E8E8F0] border border-transparent hover:border-[#1E1E2E]"
                    }`}
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center">
                    <p
                      className="text-xs text-[#6B6B8A]"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      No templates match your search.
                    </p>
                  </div>
                ) : (
                  filtered.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#1E1E2E]/60 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] font-semibold uppercase text-[#00D4FF]/60 tracking-wide"
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                          }}
                        >
                          {template.category}
                        </span>
                      </div>
                      <p
                        className="text-sm text-[#E8E8F0] font-medium group-hover:text-[#00D4FF] transition-colors"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {template.name}
                      </p>
                      <p
                        className="text-xs text-[#6B6B8A] mt-0.5 line-clamp-1"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
                        {template.description}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t border-[#1E1E2E] flex justify-between items-center">
                <span
                  className="text-[10px] text-[#6B6B8A]/50"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {filtered.length} template
                  {filtered.length !== 1 ? "s" : ""}
                </span>
                <span
                  className="text-[10px] text-[#6B6B8A]/50"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Click to auto-fill
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
