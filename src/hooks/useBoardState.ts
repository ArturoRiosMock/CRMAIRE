"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BoardState } from "@/types";
import { getInitialBoardState } from "@/lib/initial-data";

const SAVE_DEBOUNCE_MS = 800;
const STORAGE_KEY = "crm-seguidores-board";

function loadFromStorage(): BoardState | null {
  if (typeof window === "undefined") return null;
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
  return null;
}

function saveToStorage(state: BoardState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

export function useBoardState() {
  const [state, setState] = useState<BoardState>(getInitialBoardState);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/board");
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as BoardState;
          if (data.columns && data.followers && data.tags) {
            setState(data);
            saveToStorage(data);
            setIsHydrated(true);
            return;
          }
        }
      } catch {
        // Red de red o API no disponible
      }
      if (cancelled) return;
      const cached = loadFromStorage();
      if (cached) {
        setState(cached);
      } else {
        setState(getInitialBoardState());
      }
      setIsHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(state);
      fetch("/api/board", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }).catch(() => {
        // Error al guardar en servidor; los datos siguen en localStorage
      });
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
    const initial = getInitialBoardState();
    setState(initial);
    saveToStorage(initial);
    fetch("/api/board", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initial),
    }).catch(() => {});
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
