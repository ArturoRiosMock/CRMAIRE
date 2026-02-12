"use client";

import { useState, useEffect } from "react";
import { memo } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, ChevronDown } from "lucide-react";
import type { Column as ColumnType, Follower, Tag } from "@/types";
import { FollowerCard } from "./FollowerCard";
import {
  INITIAL_VISIBLE_PER_COLUMN,
  LOAD_MORE_INCREMENT,
  MAX_VISIBLE_WHEN_FILTERED,
} from "@/lib/constants";

interface ColumnProps {
  column: ColumnType;
  followers: Follower[];
  tagsMap: Record<string, Tag>;
  highlightedIds: Set<string>;
  onCardClick: (follower: Follower) => void;
  onAddClick: () => void;
  onProposalAmountChange?: (followerId: string, amount: number | null) => void;
  /** Cuando hay filtro activo, mostrar todos los resultados (sin paginar) */
  showAll?: boolean;
}

function ColumnInner({
  column,
  followers,
  tagsMap,
  highlightedIds,
  onCardClick,
  onAddClick,
  onProposalAmountChange,
  showAll = false,
}: ColumnProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PER_COLUMN);
  useEffect(() => {
    if (showAll) {
      setVisibleCount((c) => Math.max(c, MAX_VISIBLE_WHEN_FILTERED));
    } else {
      setVisibleCount(INITIAL_VISIBLE_PER_COLUMN);
    }
  }, [showAll]);
  const limit = showAll
    ? Math.max(visibleCount, MAX_VISIBLE_WHEN_FILTERED)
    : visibleCount;
  const visibleFollowers = followers.slice(0, limit);
  const hasMore = followers.length > limit;
  const remaining = followers.length - limit;

  return (
    <div className="flex h-full w-64 shrink-0 flex-col rounded-lg bg-gray-900/80">
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2">
        <h3 className="font-medium text-white">{column.title}</h3>
        <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
          {followers.length}
        </span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition ${
              snapshot.isDraggingOver ? "bg-gray-800/50" : ""
            }`}
          >
            {visibleFollowers.map((follower, index) => (
              <Draggable
                key={follower.id}
                draggableId={follower.id}
                index={index}
              >
                {(dragProvided) => (
                  <div
                    onClick={() => onCardClick(follower)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onCardClick(follower);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <FollowerCard
                      follower={follower}
                      columnTitle={column.title}
                      tagsMap={tagsMap}
                      provided={dragProvided}
                      isHighlighted={highlightedIds.has(follower.id)}
                      onProposalAmountChange={onProposalAmountChange}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {hasMore && (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((c) =>
                    Math.min(c + LOAD_MORE_INCREMENT, followers.length)
                  )
                }
                className="flex items-center justify-center gap-1 rounded-lg border border-gray-600 py-2 text-xs text-gray-400 transition hover:border-gray-500 hover:bg-gray-800/50 hover:text-gray-300"
              >
                <ChevronDown className="h-4 w-4" />
                Ver más ({remaining} restantes)
              </button>
            )}
            <button
              type="button"
              onClick={onAddClick}
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-2 text-sm text-gray-500 transition hover:border-gray-500 hover:bg-gray-800/50 hover:text-gray-400"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}

export const Column = memo(ColumnInner);
