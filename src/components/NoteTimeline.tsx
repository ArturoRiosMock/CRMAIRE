"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import type { Note } from "@/types";

interface NoteTimelineProps {
  notes: Note[];
  onAddNote: (content: string) => void;
}

export function NoteTimeline({ notes, onAddNote }: NoteTimelineProps) {
  const [newNote, setNewNote] = useState("");

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (trimmed) {
      onAddNote(trimmed);
      setNewNote("");
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300">Notas / Mensajes</h4>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Agregar nota..."
          className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          disabled={!newNote.trim()}
        >
          Agregar
        </button>
      </form>
      <div className="max-h-48 space-y-2 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <p className="text-sm text-gray-500">Sin notas aún</p>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg bg-gray-800/80 p-2 text-sm"
            >
              <p className="text-gray-200">{note.content}</p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(note.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
