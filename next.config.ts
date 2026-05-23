import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  reactStrictMode: true,
  serverExternalPackages: ["pdf-lib"],
};

export default nextConfig;
