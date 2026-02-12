import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import type { BoardState } from "@/types";
import { getInitialBoardState } from "@/lib/initial-data";

const BOARD_ID = "default";

function isValidBoardState(body: unknown): body is BoardState {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    Array.isArray(o.columns) &&
    o.followers !== null &&
    typeof o.followers === "object" &&
    Array.isArray(o.tags)
  );
}

export async function GET() {
  try {
    const { rows } = await sql<{ data: BoardState }>`
      SELECT data FROM board_state WHERE id = ${BOARD_ID} LIMIT 1
    `;

    if (rows.length === 0) {
      const initialState = getInitialBoardState();
      await sql`
        INSERT INTO board_state (id, data, updated_at)
        VALUES (${BOARD_ID}, ${JSON.stringify(initialState)}::jsonb, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
      return NextResponse.json(initialState);
    }

    return NextResponse.json(rows[0].data);
  } catch (error) {
    console.error("GET /api/board:", error);
    return NextResponse.json(
      { error: "Error al cargar el tablero" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isValidBoardState(body)) {
      return NextResponse.json(
        { error: "Body inválido: se requieren columns, followers y tags" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO board_state (id, data, updated_at)
      VALUES (${BOARD_ID}, ${JSON.stringify(body)}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW()
    `;

    return NextResponse.json(body);
  } catch (error) {
    console.error("PATCH /api/board:", error);
    return NextResponse.json(
      { error: "Error al guardar el tablero" },
      { status: 500 }
    );
  }
}
