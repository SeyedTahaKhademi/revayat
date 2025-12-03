import type { NextConfig } from "next";

type ExtendedNextConfig = NextConfig & { turbopack?: { root: string } };

const nextConfig: ExtendedNextConfig = {
  // Ensure Next uses this folder as the workspace root (fixes multi-lockfile inference)
  // and trace assets (like JSON in /data) from this directory.
  outputFileTracingRoot: __dirname,
  // Turbopack root for Next 16 warning
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.grok.com" },
      { protocol: "https", hostname: "s20.namasha.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "cdn.donya-e-eqtesad.com" },
      { protocol: "https", hostname: "fa.wikishia.net" },
    ],
  },
};

export default nextConfig;
