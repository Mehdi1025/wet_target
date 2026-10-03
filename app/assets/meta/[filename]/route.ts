import { readFile } from "fs/promises";
import path from "path";
import { applyAgencyContent } from "@/lib/agency-content";
import { stripFramerBranding } from "@/lib/strip-framer-branding";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!/^meta-[a-f0-9]+\.json$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "data/meta", filename);
  const raw = await readFile(filePath, "utf-8");
  const body = applyAgencyContent(stripFramerBranding(raw));

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
