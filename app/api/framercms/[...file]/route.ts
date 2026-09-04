import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function parseRangeParam(rangeParam: string): Array<{ from: number; to: number }> {
  return rangeParam.split(",").map((part) => {
    const [fromStr, toInclusiveStr] = part.split("-");
    const from = Number(fromStr);
    const toInclusive = Number(toInclusiveStr);

    if (
      !Number.isFinite(from) ||
      !Number.isFinite(toInclusive) ||
      from < 0 ||
      toInclusive < from
    ) {
      throw new Error(`Invalid range segment: ${part}`);
    }

    return { from, to: toInclusive + 1 };
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;
  const filename = file.join("/");

  if (!filename.endsWith(".framercms") || filename.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "animate",
    filename
  );

  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const rangeParam = request.nextUrl.searchParams.get("range");
  if (!rangeParam) {
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  try {
    const ranges = parseRangeParam(rangeParam);
    const chunks = ranges.map(({ from, to }) => {
      if (from >= buffer.length) {
        return Buffer.alloc(0);
      }
      return buffer.subarray(from, Math.min(to, buffer.length));
    });
    const body = Buffer.concat(chunks);

    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Invalid range", { status: 400 });
  }
}
