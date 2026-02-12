import { NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  parseInstagramJson,
  usernamesToBoardState,
} from "@/lib/instagram-parser";

const INSTAGRAM_FOLDERS = [
  "instagram-airepilatesfit-2026-02-11-ZJafTQUp",
  "instagram",
];

async function readJsonFilesInDir(
  dirPath: string,
  usernames: string[]
): Promise<void> {
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(
    () => []
  );
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await readJsonFilesInDir(join(dirPath, entry.name), usernames);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      (entry.name.toLowerCase().includes("follower") ||
        entry.name.toLowerCase().includes("following"))
    ) {
      const content = await readFile(join(dirPath, entry.name), "utf-8");
      usernames.push(...parseInstagramJson(content));
    }
  }
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    let allUsernames: string[] = [];
    let foundFolder = "";

    for (const folderName of INSTAGRAM_FOLDERS) {
      const folderPath = join(projectRoot, folderName);
      if (!existsSync(folderPath)) continue;

      // Buscar en connections/ y en la raíz del export (Instagram pone JSON en ambos)
      const pathsToSearch = [
        join(folderPath, "connections"),
        folderPath,
      ];

      for (const searchPath of pathsToSearch) {
        if (existsSync(searchPath)) {
          await readJsonFilesInDir(searchPath, allUsernames);
          if (allUsernames.length > 0) {
            foundFolder = folderName;
            break;
          }
        }
      }
      if (allUsernames.length > 0) break;
    }

    if (allUsernames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró carpeta de Instagram con datos. Coloca la carpeta 'instagram-airepilatesfit-2026-02-11-ZJafTQUp' dentro del proyecto, en la raíz.",
          path: join(projectRoot, "instagram-airepilatesfit-2026-02-11-ZJafTQUp", "connections"),
        },
        { status: 404 }
      );
    }

    const uniqueUsernames = Array.from(new Set(allUsernames));
    const boardState = usernamesToBoardState(uniqueUsernames, null);

    return NextResponse.json({
      success: true,
      count: uniqueUsernames.length,
      folder: foundFolder,
      boardState,
    });
  } catch (err) {
    console.error("Instagram import error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Error al importar",
      },
      { status: 500 }
    );
  }
}
