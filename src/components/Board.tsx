"use client";

import { useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import type { BoardState, Column, Follower } from "@/types";
import { Column as ColumnComponent } from "./Column";

interface BoardProps {
  state: BoardState;
  onStateChange: (updater: (prev: BoardState) => BoardState) => void;
  searchQuery: string;
  tagFilter: string[];
  onCardClick: (follower: Follower) => void;
  onAddToColumn: (columnId: string) => void;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function moveFollower(
  state: BoardState,
  followerId: string,
  sourceColId: string,
  destColId: string,
  destIndex: number
): BoardState {
  const sourceCol = state.columns.find((c) => c.id === sourceColId);
  const destCol = state.columns.find((c) => c.id === destColId);
  if (!sourceCol || !destCol) return state;

  const newSourceIds = sourceCol.followerIds.filter((id) => id !== followerId);
  const newDestIds = Array.from(destCol.followerIds);
  newDestIds.splice(destIndex, 0, followerId);

  const now = new Date().toISOString();
  const updatedFollower: Follower = {
    ...state.followers[followerId],
    columnId: destColId,
    updatedAt: now,
  };

  return {
    ...state,
    columns: state.columns.map((c) => {
      if (c.id === sourceColId) return { ...c, followerIds: newSourceIds };
      if (c.id === destColId) return { ...c, followerIds: newDestIds };
      return c;
    }),
    followers: {
      ...state.followers,
      [followerId]: updatedFollower,
    },
  };
}

export function Board({
  state,
  onStateChange,
  searchQuery,
  tagFilter,
  onCardClick,
  onAddToColumn,
}: BoardProps) {
  const sortedColumns = useMemo(
    () => [...state.columns].sort((a, b) => a.order - b.order),
    [state.columns]
  );

  const tagsMap = useMemo(() => {
    const map: Record<string, (typeof state.tags)[0]> = {};
    for (const tag of state.tags) {
      map[tag.id] = tag;
    }
    return map;
  }, [state.tags]);

  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!searchQuery.trim() && tagFilter.length === 0) return ids;
    const q = searchQuery.toLowerCase().trim();
    for (const follower of Object.values(state.followers)) {
      let match = false;
      if (q) {
        match =
          follower.name.toLowerCase().includes(q) ||
          follower.username.toLowerCase().includes(q);
      }
      if (tagFilter.length > 0) {
        const hasAllTags = tagFilter.every((tid) => follower.tags.includes(tid));
        match = match || hasAllTags;
      }
      if (match) ids.add(follower.id);
    }
    return ids;
  }, [state.followers, searchQuery, tagFilter]);

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim() && tagFilter.length === 0) return sortedColumns;
    return sortedColumns.map((col) => ({
      ...col,
      followerIds: col.followerIds.filter((id) => highlightedIds.has(id)),
    }));
  }, [sortedColumns, searchQuery, tagFilter, highlightedIds]);

  const showAllWhenFiltered =
    searchQuery.trim().length > 0 || tagFilter.length > 0;
  const columnsToShow = showAllWhenFiltered ? filteredColumns : sortedColumns;

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const followerId = draggableId;
    const sourceCol = state.columns.find((c) => c.id === source.droppableId);
    if (!sourceCol || !sourceCol.followerIds.includes(followerId)) return;

    const isFilterActive = searchQuery.trim().length > 0 || tagFilter.length > 0;
    const destCol = state.columns.find((c) => c.id === destination.droppableId);
    const destIndex =
      isFilterActive && destCol ? destCol.followerIds.length : destination.index;

    if (source.droppableId === destination.droppableId) {
      if (isFilterActive) return;
      const newIds = reorder(
        sourceCol.followerIds,
        source.index,
        destination.index
      );
      onStateChange((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === source.droppableId ? { ...c, followerIds: newIds } : c
        ),
      }));
    } else {
      onStateChange((prev) =>
        moveFollower(
          prev,
          followerId,
          source.droppableId,
          destination.droppableId,
          destIndex
        )
      );
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-120px)] gap-4 overflow-x-auto p-4">
        {columnsToShow.map((column) => {
          const followers = column.followerIds
            .map((id) => state.followers[id])
            .filter(Boolean);
          return (
            <ColumnComponent
              key={column.id}
              column={column}
              followers={followers}
              tagsMap={tagsMap}
              highlightedIds={highlightedIds}
              onCardClick={onCardClick}
              onAddClick={() => onAddToColumn(column.id)}
              showAll={showAllWhenFiltered}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
