import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kqewaxywqvldaudcqwhn.supabase.co",
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      }
    ]
  }
};

export default nextConfig;