import { access, readFile } from "fs/promises";
import path from "path";
import { applyAgencyContent } from "@/lib/agency-content";
import { stripFooterCreditFromMjs } from "@/lib/strip-framer-branding";

export const runtime = "nodejs";

const CONTACT_BUNDLES = new Set([
  "e1SQvM6md5pvgciAwTrMSOrK102xc2e4cr4RzukO0Wg.CA9OQlOu.mjs",
  "tHTqvIm0CUVWPej-LVGtCxcPYOyJ5NwSF4ML4up5ZDk.CkmsZsTp.mjs",
  "XU_2woMd3.C3IRnL38.mjs",
]);

const FOOTER_BUNDLES = new Set([
  "u14O65Rfz.CBQk6Vb9.mjs",
  "script_main.BfEWJT6M.mjs",
]);

async function resolveAnimateFile(relativePath: string): Promise<string | null> {
  const candidates = [
    path.join(process.cwd(), "data/animate", relativePath),
    path.join(process.cwd(), "public/assets/animate", relativePath),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next location
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relativePath = segments.join("/");

  if (
    !relativePath.endsWith(".mjs") ||
    relativePath.includes("..") ||
    relativePath.includes("\\")
  ) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = await resolveAnimateFile(relativePath);
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  let content = await readFile(filePath, "utf-8");

  const basename = path.basename(relativePath);

  if (CONTACT_BUNDLES.has(basename)) {
    content = applyAgencyContent(content);
  } else if (FOOTER_BUNDLES.has(basename)) {
    content = stripFooterCreditFromMjs(content);
  }

  return new Response(content, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
