import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // sharp (used by app/api/content/image to compress/crop uploads) ships a
  // native binary. Left to Next's default bundling it can get packaged
  // incorrectly for serverless hosts (Netlify included) — this tells Next to
  // require() it normally from node_modules at runtime instead, which is the
  // documented fix for uploads silently failing in production while working
  // fine in local dev.
  serverExternalPackages: ["sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Uploaded photos live in Supabase Storage (public bucket). Local dev
    // fallback uploads live under /public/images/uploads (no config needed).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
