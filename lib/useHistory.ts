"use client";

import { useState, useEffect } from "react";
import type { CaseInput, GeneratedResult } from "./generator";

export interface HistoryEntry {
  id: string;
  input: CaseInput;
  result: GeneratedResult;
  timestamp: number;
}

const STORAGE_KEY = "srg_history";
const MAX_ENTRIES = 10;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  function addEntry(input: CaseInput, result: GeneratedResult) {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      input,
      result,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // storage full — silently skip
      }
      return updated;
    });
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { history, addEntry, clearHistory };
}
