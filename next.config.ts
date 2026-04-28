import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright"],
  // Use the Vercel adapter when building on Vercel so Next.js 16 produces
  // the .vercel/output format that Vercel's routing system can serve.
  ...(process.env.VERCEL && {
    adapterPath: "@vercel/next/dist/adapter",
  }),
};

export default nextConfig;
