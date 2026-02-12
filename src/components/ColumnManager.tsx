"use client";

import { useState, useRef } from "react";
import { X, Plus, GripVertical } from "lucide-react";
import type { Column } from "@/types";
import { generateId } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface ColumnManagerProps {
  columns: Column[];
  onClose: () => void;
  onSave: (
    columns: Column[],
    followerColumnUpdates?: Record<string, string>
  ) => void;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function ColumnManager({
  columns: initialColumns,
  onClose,
  onSave,
}: ColumnManagerProps) {
  const [columns, setColumns] = useState(
    () => [...initialColumns].sort((a, b) => a.order - b.order)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const newCols = reorder(columns, result.source.index, result.destination.index);
    setColumns(
      newCols.map((c, i) => ({ ...c, order: i }))
    );
  }

  function startEdit(col: Column) {
    setEditingId(col.id);
    setEditTitle(col.title);
  }

  function saveEdit() {
    if (editingId) {
      setColumns((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, title: editTitle.trim() || c.title } : c
        )
      );
      setEditingId(null);
      setEditTitle("");
    }
  }

  function addColumn() {
    const title = newColumnTitle.trim();
    if (!title) return;
    const maxOrder = Math.max(...columns.map((c) => c.order), -1);
    const newCol: Column = {
      id: generateId(),
      title,
      order: maxOrder + 1,
      followerIds: [],
    };
    setColumns((prev) => [...prev, newCol].sort((a, b) => a.order - b.order));
    setNewColumnTitle("");
  }

  const followerMovesRef = useRef<Record<string, string>>({});

  function deleteColumn(id: string) {
    const col = columns.find((c) => c.id === id);
    if (!col) return;
    if (col.followerIds.length > 0) {
      const firstCol = columns.find((c) => c.id !== id);
      if (firstCol) {
        col.followerIds.forEach((fid) => {
          followerMovesRef.current[fid] = firstCol.id;
        });
        setColumns((prev) =>
          prev
            .filter((c) => c.id !== id)
            .map((c) =>
              c.id === firstCol.id
                ? {
                    ...c,
                    followerIds: [...c.followerIds, ...col.followerIds],
                  }
                : c
            )
        );
      } else {
        setColumns((prev) => prev.filter((c) => c.id !== id));
      }
    } else {
      setColumns((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleteConfirmId(null);
  }

  function handleSave() {
    const reordered = columns.map((c, i) => ({ ...c, order: i }));
    onSave(reordered, { ...followerMovesRef.current });
    followerMovesRef.current = {};
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="col-manager-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3">
          <h2 id="col-manager-title" className="text-lg font-semibold text-white">
            Gestionar columnas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="column-manager-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {columns.map((col, index) => (
                    <Draggable
                      key={col.id}
                      draggableId={col.id}
                      index={index}
                    >
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 p-2"
                        >
                          <div
                            {...dragProvided.dragHandleProps}
                            className="cursor-grab text-gray-500 active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          {editingId === col.id ? (
                            <div className="flex flex-1 items-center gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") {
                                    setEditingId(null);
                                    setEditTitle("");
                                  }
                                }}
                                className="flex-1 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-white focus:outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(col)}
                              className="flex-1 text-left text-white hover:underline"
                            >
                              {col.title}
                            </button>
                          )}
                          <span className="text-sm text-gray-500">
                            {col.followerIds.length}
                          </span>
                          {deleteConfirmId === col.id ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => deleteColumn(col.id)}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs text-gray-500 hover:underline"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(col.id)}
                              className="text-xs text-gray-500 hover:text-red-400"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addColumn();
                }
              }}
              placeholder="Nueva columna..."
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addColumn}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={!newColumnTitle.trim()}
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
