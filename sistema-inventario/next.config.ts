import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  serverExternalPackages: ['mysql2'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración específica para Netlify
  trailingSlash: false,
  distDir: '.next'
};

export default nextConfig;
