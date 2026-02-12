"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Trash2 } from "lucide-react";
import type { Follower, Column, Tag, Note } from "@/types";
import { generateId } from "@/lib/utils";
import { NoteTimeline } from "./NoteTimeline";
import { TagManager } from "./TagManager";

interface FollowerModalProps {
  follower: Follower;
  columns: Column[];
  tags: Tag[];
  onClose: () => void;
  onSave: (follower: Follower) => void;
  onDelete: (id: string) => void;
  onMoveColumn: (followerId: string, newColumnId: string) => void;
  onCreateTag?: (tag: Tag) => void;
}

export function FollowerModal({
  follower,
  columns,
  tags,
  onClose,
  onSave,
  onDelete,
  onMoveColumn,
  onCreateTag,
}: FollowerModalProps) {
  const [form, setForm] = useState(follower);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setForm(follower);
  }, [follower]);

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      updatedAt: new Date().toISOString(),
    });
  }

  function handleAddNote(content: string) {
    const note: Note = {
      id: generateId(),
      content,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...form,
      notes: [...form.notes, note],
      updatedAt: note.createdAt,
    };
    setForm(updated);
    onSave(updated);
  }

  function handleTagsChange(selectedIds: string[]) {
    const updated = { ...form, tags: selectedIds };
    setForm(updated);
    onSave(updated);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            {form.name || "Editar seguidor"}
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

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">@Usuario</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.username}
                onChange={(e) => {
                  const user = e.target.value.replace("@", "").trim();
                  setForm((f) => ({
                    ...f,
                    username: user,
                    profileUrl: user
                      ? `https://instagram.com/${user}`
                      : f.profileUrl,
                  }));
                }}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
                placeholder="usuario"
              />
              <a
                href={form.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-sm text-blue-400 hover:bg-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Teléfono</label>
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value || undefined }))
              }
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value || undefined }))
              }
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Etiquetas</label>
            <TagManager
              tags={tags}
              selectedIds={form.tags}
              onSelectionChange={handleTagsChange}
              onCreateTag={onCreateTag}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Mover a columna
            </label>
            <select
              value={form.columnId}
              onChange={(e) => {
                const newColId = e.target.value;
                setForm((f) => ({ ...f, columnId: newColId }));
                onMoveColumn(form.id, newColId);
              }}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            >
              {sortedColumns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          <NoteTimeline notes={form.notes} onAddNote={handleAddNote} />

          <div className="flex justify-between gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-600/50 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Guardar
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
            <div className="max-w-sm rounded-xl bg-gray-900 p-4 shadow-xl">
              <p className="mb-4 text-gray-300">
                ¿Eliminar a {form.name}? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(form.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
