import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@provato/ui", "@provato/api", "@provato/db"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
