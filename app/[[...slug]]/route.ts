import { readFile } from "fs/promises";
import { NextRequest } from "next/server";
import { getAllPageSlugs } from "@/lib/collect-slugs";
import { resolveHtmlPath } from "@/lib/resolve-html-path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return [{ slug: undefined }, ...slugs.map((slug) => ({ slug }))];
}

async function serveHtml(slug: string[] | undefined) {
  const { filePath, is404 } = await resolveHtmlPath(slug);
  const html = await readFile(filePath, "utf-8");

  return new Response(html, {
    status: is404 ? 404 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": is404
        ? "no-cache"
        : "public, max-age=0, must-revalidate",
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  return serveHtml(slug);
}
