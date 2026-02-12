export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Follower {
  id: string;
  name: string;
  username: string;
  profileUrl: string;
  phone?: string;
  email?: string;
  tags: string[];
  notes: Note[];
  columnId: string;
  /** Monto en USD de la propuesta (visible en Negociación/Cliente) */
  proposalAmountUsd?: number | null;
  contactDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  followerIds: string[];
}

export interface BoardState {
  columns: Column[];
  followers: Record<string, Follower>;
  tags: Tag[];
}
