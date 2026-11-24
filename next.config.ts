import type { NextConfig } from "next";

const mediaUrl = process.env.MEDIA_PUBLIC_URL
const mediaPattern = mediaUrl
  ? (() => {
      const url = new URL(mediaUrl)
      return {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        pathname: "/**",
      }
    })()
  : undefined

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(mediaPattern ? [mediaPattern] : []),
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
