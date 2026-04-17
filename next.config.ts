import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ignora erros de TypeScript no build
  },
  eslint: {
    ignoreDuringBuilds: true, // ignora erros de ESLint no build
  },
};

export default nextConfig;
