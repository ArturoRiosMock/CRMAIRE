"use client";

import { memo } from "react";
import type { DraggableProvided } from "@hello-pangea/dnd";
import type { Follower, Tag } from "@/types";
import { formatDateShort } from "@/lib/utils";
import { TagBadge } from "./TagBadge";

const SHOW_PROPOSAL_AMOUNT_COLUMNS = ["Negociación", "Cliente"];

interface FollowerCardProps {
  follower: Follower;
  columnTitle: string;
  tagsMap: Record<string, Tag>;
  provided: DraggableProvided;
  isHighlighted?: boolean;
  onProposalAmountChange?: (followerId: string, amount: number | null) => void;
}

function FollowerCardInner({
  follower,
  columnTitle,
  tagsMap,
  provided,
  isHighlighted,
  onProposalAmountChange,
}: FollowerCardProps) {
  const lastNote = follower.notes[follower.notes.length - 1];
  const hasRecentNotes = follower.notes.length > 0;
  const showProposalAmount = SHOW_PROPOSAL_AMOUNT_COLUMNS.includes(columnTitle);
  const amount = follower.proposalAmountUsd ?? "";

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!onProposalAmountChange) return;
    const raw = e.target.value.trim().replace(/,/, ".");
    if (raw === "") {
      onProposalAmountChange(follower.id, null);
      return;
    }
    const num = Number.parseFloat(raw);
    if (!Number.isNaN(num) && num >= 0) {
      onProposalAmountChange(follower.id, num);
    }
  }

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
      {showProposalAmount && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <label className="mb-0.5 block text-xs text-gray-400">
            Monto propuesta (USD)
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount === "" ? "" : amount}
            onChange={handleAmountChange}
            className="w-full rounded border border-gray-600 bg-gray-700/80 px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
          />
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
