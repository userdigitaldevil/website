import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  images: {
    localPatterns: [{ pathname: '/uploads/**' }],
  },
};

export default nextConfig;
