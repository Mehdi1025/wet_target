import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone breaks Vercel deploys on Next.js 16.3+ (next-server.js.nft.json)
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/[[...slug]]": ["./content/**/*"],
  },
};

export default nextConfig;
