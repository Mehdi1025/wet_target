import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone breaks Vercel deploys on Next.js 16.3+ (next-server.js.nft.json)
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/assets/animate/:file*",
          has: [{ type: "query", key: "range" }],
          destination: "/api/framercms/:file*",
        },
      ],
    };
  },
  outputFileTracingIncludes: {
    "/[[...slug]]": ["./content/**/*"],
    "/api/framercms/[...file]": ["./public/assets/animate/**/*.framercms"],
  },
};

export default nextConfig;
