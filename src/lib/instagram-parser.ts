import type { BoardState, Follower } from "@/types";
import { generateId } from "./utils";
import { getInitialBoardState } from "./initial-data";

/**
 * Parsea el formato JSON de exportación de Instagram.
 * Soporta formatos:
 * - relationships_followers / relationships_following con string_list_data
 * - Array simple de usernames
 */
function extractUsernamesFromJson(data: unknown): string[] {
  const usernames: string[] = [];
  const seen = new Set<string>();

  function extractFromItem(item: unknown): void {
    if (typeof item === "string") {
      const user = item.trim().toLowerCase();
      if (user && !seen.has(user)) {
        seen.add(user);
        usernames.push(user);
      }
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(extractFromItem);
      return;
    }
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      if (obj.string_list_data && Array.isArray(obj.string_list_data)) {
        obj.string_list_data.forEach((s: unknown) => {
          const entry = s as { value?: string; href?: string };
          if (entry?.value) extractFromItem(entry.value);
        });
      } else if (obj.value && typeof obj.value === "string") {
        extractFromItem(obj.value);
      } else {
        Object.values(obj).forEach(extractFromItem);
      }
    }
  }

  if (Array.isArray(data)) {
    data.forEach(extractFromItem);
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const keys = [
      "relationships_followers",
      "relationships_following",
      "string_list_data",
      "follower",
      "following",
      "accounts_you_follow",
    ];
    for (const key of keys) {
      if (obj[key]) {
        extractFromItem(obj[key]);
      }
    }
    if (usernames.length === 0) {
      Object.values(obj).forEach(extractFromItem);
    }
  }
  return usernames;
}

export function parseInstagramJson(jsonString: string): string[] {
  try {
    const data = JSON.parse(jsonString) as unknown;
    return extractUsernamesFromJson(data);
  } catch {
    return [];
  }
}

export function usernamesToBoardState(
  usernames: string[],
  existingState?: BoardState | null
): BoardState {
  const state = existingState ?? getInitialBoardState();
  const firstColumn = state.columns.find((c) => c.order === 0) ?? state.columns[0];
  if (!firstColumn) return state;

  const now = new Date().toISOString();
  const newFollowers: Record<string, Follower> = { ...state.followers };
  const newFollowerIds = [...firstColumn.followerIds];

  for (const username of usernames) {
    const normalized = username.trim().toLowerCase();
    if (!normalized) continue;

    const alreadyExists = Object.values(newFollowers).some(
      (f) => f.username.toLowerCase() === normalized
    );
    if (alreadyExists) continue;

    const id = generateId();
    const follower: Follower = {
      id,
      name: normalized,
      username: normalized,
      profileUrl: `https://instagram.com/${normalized}`,
      tags: [],
      notes: [],
      columnId: firstColumn.id,
      contactDate: now,
      createdAt: now,
      updatedAt: now,
    };
    newFollowers[id] = follower;
    newFollowerIds.push(id);
  }

  return {
    ...state,
    followers: newFollowers,
    columns: state.columns.map((c) =>
      c.id === firstColumn.id ? { ...c, followerIds: newFollowerIds } : c
    ),
  };
}
