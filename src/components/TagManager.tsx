"use client";

import { useState } from "react";
import { TagBadge } from "./TagBadge";
import type { Tag } from "@/types";
import { generateId } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

interface TagManagerProps {
  tags: Tag[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreateTag?: (tag: Tag) => void;
}

export function TagManager({
  tags,
  selectedIds,
  onSelectionChange,
  onCreateTag,
}: TagManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  function toggleTag(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((tid) => tid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  function handleCreate() {
    const trimmed = newName.trim();
    if (trimmed && onCreateTag) {
      const tag: Tag = {
        id: generateId(),
        name: trimmed,
        color: newColor,
      };
      onCreateTag(tag);
      onSelectionChange([...selectedIds, tag.id]);
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setIsAdding(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`rounded-full transition ${
              selectedIds.includes(tag.id) ? "ring-2 ring-offset-2 ring-offset-gray-900" : ""
            }`}
            style={{
              backgroundColor: selectedIds.includes(tag.id)
                ? tag.color
                : `${tag.color}40`,
              color: selectedIds.includes(tag.id) ? "#fff" : tag.color,
              borderColor: tag.color,
              borderWidth: 1,
              padding: "2px 8px",
              fontSize: "12px",
            }}
          >
            {tag.name}
          </button>
        ))}
        {onCreateTag && (
          <>
            {isAdding ? (
              <div className="flex items-center gap-1 rounded-full border border-gray-600 bg-gray-800 px-2 py-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre"
                  className="w-20 rounded bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-0.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`h-4 w-4 rounded-full transition ${
                        newColor === c ? "ring-2 ring-white" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-400"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="rounded-full border border-dashed border-gray-600 px-2 py-1 text-xs text-gray-500 hover:border-gray-500 hover:text-gray-400"
              >
                + Nueva etiqueta
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
