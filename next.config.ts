import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.yad2.co.il" },
      { protocol: "https", hostname: "*.madlan.co.il" },
    ],
  },
  // Allow server-side fetch to external scrapers
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
