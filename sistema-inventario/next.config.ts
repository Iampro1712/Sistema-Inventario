import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  }
};

export default nextConfig;
