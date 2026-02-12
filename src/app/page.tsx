"use client";

import { useState, useTransition } from "react";
import { useBoardState } from "@/hooks/useBoardState";
import { useDebounce } from "@/hooks/useDebounce";
import { Header } from "@/components/Header";
import { Board } from "@/components/Board";
import { FollowerModal } from "@/components/FollowerModal";
import { AddFollowerForm } from "@/components/AddFollowerForm";
import { ColumnManager } from "@/components/ColumnManager";
import type { Follower } from "@/types";

export default function Home() {
  const { state, updateState, isHydrated, exportData, importData } =
    useBoardState();
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(
    null
  );
  const [addToColumnId, setAddToColumnId] = useState<string | null>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Header
        onAddFollower={() => {
          const firstCol = state.columns[0];
          setAddToColumnId(firstCol?.id ?? null);
        }}
        onManageColumns={() => setShowColumnManager(true)}
        onExport={exportData}
        onImport={importData}
        onImportInstagram={(boardState) => {
          startTransition(() => {
            updateState(() => boardState);
          });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        tags={state.tags}
      />
      <Board
        state={state}
        onStateChange={updateState}
        searchQuery={debouncedSearch}
        tagFilter={tagFilter}
        onCardClick={setSelectedFollower}
        onAddToColumn={setAddToColumnId}
      />
      {selectedFollower && (
        <FollowerModal
          follower={selectedFollower}
          columns={state.columns}
          tags={state.tags}
          onClose={() => setSelectedFollower(null)}
          onSave={(updated) => {
            updateState((prev) => ({
              ...prev,
              followers: {
                ...prev.followers,
                [updated.id]: updated,
              },
            }));
            setSelectedFollower(updated);
          }}
          onDelete={(id) => {
            updateState((prev) => {
              const newFollowers = { ...prev.followers };
              delete newFollowers[id];
              return {
                ...prev,
                followers: newFollowers,
                columns: prev.columns.map((c) => ({
                  ...c,
                  followerIds: c.followerIds.filter((fid) => fid !== id),
                })),
              };
            });
            setSelectedFollower(null);
          }}
          onCreateTag={(tag) => {
            updateState((prev) => ({
              ...prev,
              tags: [...prev.tags, tag],
            }));
          }}
          onMoveColumn={(followerId, newColumnId) => {
            updateState((prev) => {
              const follower = prev.followers[followerId];
              if (!follower) return prev;
              const now = new Date().toISOString();
              return {
                ...prev,
                followers: {
                  ...prev.followers,
                  [followerId]: {
                    ...follower,
                    columnId: newColumnId,
                    updatedAt: now,
                  },
                },
                columns: prev.columns.map((c) => {
                  if (c.id === follower.columnId) {
                    return {
                      ...c,
                      followerIds: c.followerIds.filter((id) => id !== followerId),
                    };
                  }
                  if (c.id === newColumnId) {
                    return {
                      ...c,
                      followerIds: [...c.followerIds, followerId],
                    };
                  }
                  return c;
                }),
              };
            });
            setSelectedFollower((f) =>
              f && f.id === followerId
                ? { ...f, columnId: newColumnId }
                : f
            );
          }}
        />
      )}
      {addToColumnId && (
        <AddFollowerForm
          columnId={addToColumnId}
          columns={state.columns}
          tags={state.tags}
          onClose={() => setAddToColumnId(null)}
          onAdd={(follower) => {
            updateState((prev) => ({
              ...prev,
              followers: {
                ...prev.followers,
                [follower.id]: follower,
              },
              columns: prev.columns.map((c) =>
                c.id === follower.columnId
                  ? { ...c, followerIds: [...c.followerIds, follower.id] }
                  : c
              ),
            }));
            setAddToColumnId(null);
          }}
          onTagsChange={(newTags) => {
            updateState((prev) => ({ ...prev, tags: newTags }));
          }}
        />
      )}
      {showColumnManager && (
        <ColumnManager
          columns={state.columns}
          onClose={() => setShowColumnManager(false)}
          onSave={(newColumns, followerColumnUpdates) => {
            updateState((prev) => {
              let next = { ...prev, columns: newColumns };
              if (followerColumnUpdates && Object.keys(followerColumnUpdates).length > 0) {
                const newFollowers = { ...prev.followers };
                for (const [fid, newColId] of Object.entries(followerColumnUpdates)) {
                  if (newFollowers[fid]) {
                    newFollowers[fid] = {
                      ...newFollowers[fid],
                      columnId: newColId,
                      updatedAt: new Date().toISOString(),
                    };
                  }
                }
                next = { ...next, followers: newFollowers };
              }
              return next;
            });
            setShowColumnManager(false);
          }}
        />
      )}
    </main>
  );
}
