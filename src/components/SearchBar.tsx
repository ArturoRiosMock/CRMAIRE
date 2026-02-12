"use client";

import { Search } from "lucide-react";
import type { Tag } from "@/types";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  tagFilter: string[];
  onTagFilterChange: (tags: string[]) => void;
  tags: Tag[];
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  tagFilter,
  onTagFilterChange,
  tags,
}: SearchBarProps) {
  function toggleTag(tagId: string) {
    if (tagFilter.includes(tagId)) {
      onTagFilterChange(tagFilter.filter((id) => id !== tagId));
    } else {
      onTagFilterChange([...tagFilter, tagId]);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          placeholder="Buscar por nombre o @usuario..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                tagFilter.includes(tag.id)
                  ? "ring-1 ring-offset-2 ring-offset-gray-950"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor: tagFilter.includes(tag.id)
                  ? tag.color
                  : `${tag.color}40`,
                color: tagFilter.includes(tag.id) ? "#fff" : tag.color,
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
