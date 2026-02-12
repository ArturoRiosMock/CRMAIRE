"use client";

import { useState, useRef } from "react";
import { Plus, Upload, Settings, Instagram, Save } from "lucide-react";
import type { BoardState } from "@/types";
import { SearchBar } from "./SearchBar";
import {
  parseInstagramJson,
  usernamesToBoardState,
} from "@/lib/instagram-parser";

interface HeaderProps {
  onAddFollower: () => void;
  onManageColumns: () => void;
  onExport: () => string;
  onImport: (json: string) => boolean;
  onImportInstagram?: (boardState: BoardState) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  tagFilter: string[];
  onTagFilterChange: (tags: string[]) => void;
  tags: BoardState["tags"];
  /** Suma de proposalAmountUsd de leads en columna Cliente (USD) */
  totalClosedUsd?: number;
}

export function Header({
  onAddFollower,
  onManageColumns,
  onExport,
  onImport,
  onImportInstagram,
  searchQuery,
  onSearchChange,
  tagFilter,
  onTagFilterChange,
  tags,
  totalClosedUsd = 0,
}: HeaderProps) {
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [igLoading, setIgLoading] = useState(false);
  const [igError, setIgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const igFileInputRef = useRef<HTMLInputElement>(null);

  function handleSaveState() {
    const stateStr = onExport();
    const state = JSON.parse(stateStr) as BoardState;
    const leadsCount = Object.keys(state.followers).length;
    const payload = {
      _backup: true,
      _exportedAt: new Date().toISOString(),
      _leadsCount: leadsCount,
      ...state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
    a.download = `crm-seguidores-estado-${dateStr}-${timeStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(false);
    setImportSuccess(false);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const ok = onImport(result);
      setImportError(!ok);
      setImportSuccess(ok);
      if (ok) {
        setTimeout(() => setImportSuccess(false), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleImportInstagramClick() {
    if (!onImportInstagram) return;
    setIgError(null);
    setIgLoading(true);
    try {
      const res = await fetch("/api/instagram-import");
      const data = await res.json();
      if (data.success && data.boardState) {
        onImportInstagram(data.boardState);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 2000);
      } else {
        setIgError(data.error ?? "No se encontraron datos");
        igFileInputRef.current?.click();
      }
    } catch {
      setIgError("Error de conexión");
      igFileInputRef.current?.click();
    } finally {
      setIgLoading(false);
    }
  }

  function handleIgFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !onImportInstagram) return;
    let allUsernames: string[] = [];
    const readers: Promise<void>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith(".json")) continue;
      readers.push(
        new Promise<void>((resolve) => {
          const r = new FileReader();
          r.onload = () => {
            const usernames = parseInstagramJson(r.result as string);
            allUsernames = allUsernames.concat(usernames);
            resolve();
          };
          r.readAsText(file);
        })
      );
    }
    Promise.all(readers).then(() => {
      const unique = Array.from(new Set(allUsernames));
      if (unique.length > 0) {
        const boardState = usernamesToBoardState(unique, null);
        onImportInstagram(boardState);
        setImportSuccess(true);
        setIgError(null);
        setTimeout(() => setImportSuccess(false), 2000);
      } else {
        setIgError("No se encontraron usernames en los archivos");
      }
      e.target.value = "";
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
      <div className="mx-auto flex max-w-[1920px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold text-white sm:text-xl">
            CRM Seguidores
          </h1>
          {totalClosedUsd > 0 && (
            <span className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/30">
              Total cerrado: ${totalClosedUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onAddFollower}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
            <button
              type="button"
              onClick={onManageColumns}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-800"
            >
              <Settings className="h-4 w-4" />
              Columnas
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            tagFilter={tagFilter}
            onTagFilterChange={onTagFilterChange}
            tags={tags}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleSaveState}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/60 bg-emerald-600/20 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-600/30"
            title="Descargar copia de seguridad del CRM (columnas, leads, etiquetas, montos). Guarda este archivo en tu PC para poder restaurar después."
          >
            <Save className="h-4 w-4" />
            Guardar estado
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
              importSuccess
                ? "border-green-500 bg-green-500/20 text-green-400"
                : importError
                  ? "border-red-500 bg-red-500/20 text-red-400"
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
            }`}
            title="Subir un archivo .json de backup para restaurar el CRM al estado guardado (reemplaza todo el estado actual)."
          >
            <Upload className="h-4 w-4" />
            Restaurar backup
          </button>
          {onImportInstagram && (
            <>
              <input
                ref={igFileInputRef}
                type="file"
                accept=".json"
                multiple
                className="hidden"
                onChange={handleIgFilesChange}
              />
              <button
                type="button"
                onClick={handleImportInstagramClick}
                disabled={igLoading}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
                  igError
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                } disabled:opacity-50`}
                title={igError ?? "Importar seguidores desde carpeta Instagram o archivos JSON"}
              >
                {igLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                ) : (
                  <Instagram className="h-4 w-4" />
                )}
                Instagram
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
