import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Portal pages are synced from the standalone HTML prototype (implicit-any props).
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
