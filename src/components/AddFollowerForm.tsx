"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Follower, Column, Tag } from "@/types";
import { generateId } from "@/lib/utils";
import { TagManager } from "./TagManager";

interface AddFollowerFormProps {
  columnId: string;
  columns: Column[];
  tags: Tag[];
  onClose: () => void;
  onAdd: (follower: Follower) => void;
  onTagsChange: (tags: Tag[]) => void;
}

export function AddFollowerForm({
  columnId,
  columns,
  tags,
  onClose,
  onAdd,
  onTagsChange,
}: AddFollowerFormProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUser = username.trim().replace("@", "");
    if (!trimmedUser) return;

    const now = new Date().toISOString();
    const follower: Follower = {
      id: generateId(),
      name: name.trim() || trimmedUser,
      username: trimmedUser,
      profileUrl: `https://instagram.com/${trimmedUser}`,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      tags: selectedTags,
      notes: [],
      columnId,
      proposalAmountUsd: null,
      followUpAt: null,
      contactDate: now,
      createdAt: now,
      updatedAt: now,
    };
    onAdd(follower);
  }

  function handleCreateTag(tag: Tag) {
    onTagsChange([...tags, tag]);
    setSelectedTags((prev) => [...prev, tag.id]);
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
        aria-labelledby="add-modal-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3">
          <h2 id="add-modal-title" className="text-lg font-semibold text-white">
            Nuevo seguidor
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
              placeholder="Nombre del seguidor"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              @Usuario (obligatorio)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
              placeholder="usuario_instagram"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Etiquetas</label>
            <TagManager
              tags={tags}
              selectedIds={selectedTags}
              onSelectionChange={setSelectedTags}
              onCreateTag={handleCreateTag}
            />
          </div>
          <p className="text-xs text-gray-500">
            Se agregará a la columna{" "}
            {columns.find((c) => c.id === columnId)?.title ?? ""}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={!username.trim()}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
