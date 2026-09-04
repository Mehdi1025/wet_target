import { access } from "fs/promises";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveHtmlPath(
  slug: string[] | undefined
): Promise<{ filePath: string; is404: boolean }> {
  const segments = slug ?? [];

  if (segments.some((segment) => segment === ".." || segment.includes("\\"))) {
    return {
      filePath: path.join(CONTENT_DIR, "404.html"),
      is404: true,
    };
  }

  if (segments.length === 0) {
    return {
      filePath: path.join(CONTENT_DIR, "index.html"),
      is404: false,
    };
  }

  const indexPath = path.join(CONTENT_DIR, ...segments, "index.html");
  if (await fileExists(indexPath)) {
    return { filePath: indexPath, is404: false };
  }

  const htmlPath = path.join(CONTENT_DIR, ...segments) + ".html";
  if (await fileExists(htmlPath)) {
    return { filePath: htmlPath, is404: false };
  }

  return {
    filePath: path.join(CONTENT_DIR, "404.html"),
    is404: true,
  };
}
