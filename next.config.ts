import type { NextConfig } from "next";

const isExport = process.env.OUTPUT_MODE === 'export';

const nextConfig: NextConfig = {
  ...(isExport && { output: 'export' }),
  images: {
    unoptimized: true, // Requires unoptimized for static export unless using custom loader
  }
};

export default nextConfig;
