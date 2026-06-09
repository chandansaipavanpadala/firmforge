// =============================================================================
// FirmForge — Code History (localStorage)
// =============================================================================

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "firmforge-history";
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  type: "snippet" | "rtos";
  timestamp: number;
  label: string;
  mcu: string;
  /** Peripheral name for snippets, RTOS name for rtos entries */
  secondary: string;
  /** The generated code (single string for snippets, JSON-stringified files for RTOS) */
  code: string;
  /** Line count for quick preview */
  lineCount: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function loadEntries(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function useCodeHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Load on mount
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      setEntries((prev) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: generateId(),
          timestamp: Date.now(),
        };
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        saveEntries(updated);
        return updated;
      });
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEntries(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    saveEntries([]);
  }, []);

  return { entries, addEntry, removeEntry, clearAll };
}
