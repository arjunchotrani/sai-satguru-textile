import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sai-satguru-backend.arjunchotrani0.workers.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
      },
    ],
  },
};

export default nextConfig;
