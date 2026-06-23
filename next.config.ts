import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Portal pages are synced from the standalone HTML prototype (implicit-any props).
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
