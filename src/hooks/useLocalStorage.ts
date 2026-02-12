"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BoardState } from "@/types";
import { getInitialBoardState } from "@/lib/initial-data";

const SAVE_DEBOUNCE_MS = 800;

const STORAGE_KEY = "crm-seguidores-board";

function loadFromStorage(): BoardState {
  if (typeof window === "undefined") {
    return getInitialBoardState();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as BoardState;
      if (parsed.columns && parsed.followers && parsed.tags) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return getInitialBoardState();
}

export function useLocalStorage() {
  const [state, setState] = useState<BoardState>(getInitialBoardState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setIsHydrated(true);
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore quota errors
      }
      saveTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isHydrated]);

  const updateState = useCallback((updater: (prev: BoardState) => BoardState) => {
    setState(updater);
  }, []);

  const exportData = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as BoardState;
      if (parsed.columns && parsed.followers && parsed.tags) {
        setState(parsed);
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  }, []);

  const resetData = useCallback(() => {
    setState(getInitialBoardState());
  }, []);

  return {
    state,
    updateState,
    isHydrated,
    exportData,
    importData,
    resetData,
  };
}
