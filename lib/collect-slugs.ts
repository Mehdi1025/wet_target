import { readdir } from "fs/promises";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function collectSlugs(
  dir: string,
  segments: string[] = []
): Promise<string[][]> {
  const slugs: string[][] = [];
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return slugs;
  }

  const hasIndex = entries.some(
    (entry) => entry.isFile() && entry.name === "index.html"
  );

  if (hasIndex && segments.length > 0) {
    slugs.push(segments);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    slugs.push(
      ...(await collectSlugs(path.join(dir, entry.name), [
        ...segments,
        entry.name,
      ]))
    );
  }

  return slugs;
}

export async function getAllPageSlugs(): Promise<string[][]> {
  return collectSlugs(CONTENT_DIR);
}
