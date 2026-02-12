"use client";

import { memo } from "react";
import type { DraggableProvided } from "@hello-pangea/dnd";
import type { Follower, Tag } from "@/types";
import { formatDateShort } from "@/lib/utils";
import { TagBadge } from "./TagBadge";

interface FollowerCardProps {
  follower: Follower;
  tagsMap: Record<string, Tag>;
  provided: DraggableProvided;
  isHighlighted?: boolean;
}

function FollowerCardInner({
  follower,
  tagsMap,
  provided,
  isHighlighted,
}: FollowerCardProps) {
  const lastNote = follower.notes[follower.notes.length - 1];
  const hasRecentNotes = follower.notes.length > 0;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`group cursor-grab rounded-lg border bg-gray-800 p-3 transition hover:border-gray-600 active:cursor-grabbing ${
        isHighlighted ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950" : "border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{follower.name}</p>
          <a
            href={follower.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            @{follower.username}
          </a>
        </div>
        {hasRecentNotes && (
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
            title="Tiene notas"
          />
        )}
      </div>
      {follower.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {follower.tags.map((tagId) => {
            const tag = tagsMap[tagId];
            if (!tag) return null;
            return <TagBadge key={tagId} tag={tag} />;
          })}
        </div>
      )}
      {(follower.contactDate || lastNote) && (
        <p className="mt-2 text-xs text-gray-500">
          {lastNote
            ? formatDateShort(lastNote.createdAt)
            : follower.contactDate
              ? formatDateShort(follower.contactDate)
              : null}
        </p>
      )}
    </div>
  );
}

export const FollowerCard = memo(FollowerCardInner);
