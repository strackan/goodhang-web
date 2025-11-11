import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Completely skip ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checking enabled
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
