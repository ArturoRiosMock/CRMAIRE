import type { BoardState } from "@/types";
import { generateId } from "./utils";

const defaultColumnTitles = [
  "Nuevo",
  "Contactado",
  "Interesado",
  "Negociación",
  "Cliente",
  "Perdido",
];

export function getInitialBoardState(): BoardState {
  const now = new Date().toISOString();
  const columns = defaultColumnTitles.map((title, index) => ({
    id: generateId(),
    title,
    order: index,
    followerIds: [] as string[],
  }));

  const followers: Record<string, BoardState["followers"][string]> = {};
  const tags = [
    { id: "tag-1", name: "VIP", color: "#f59e0b" },
    { id: "tag-2", name: "Prioritario", color: "#ef4444" },
    { id: "tag-3", name: "Seguimiento", color: "#3b82f6" },
  ];

  if (columns[0]) {
    const sampleFollower = {
      id: generateId(),
      name: "Ejemplo Seguidor",
      username: "ejemplo_usuario",
      profileUrl: "https://instagram.com/ejemplo_usuario",
      phone: "",
      email: "",
      tags: ["tag-3"],
      notes: [
        {
          id: generateId(),
          content: "Primer contacto por DM",
          createdAt: now,
        },
      ],
      columnId: columns[0].id,
      contactDate: now,
      createdAt: now,
      updatedAt: now,
    };
    followers[sampleFollower.id] = sampleFollower;
    columns[0].followerIds.push(sampleFollower.id);
  }

  return {
    columns,
    followers,
    tags,
  };
}
