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
  // serverExternalPackages stops Next from mangling sharp's JS, but Next's
  // build-time file tracer (which decides which files get physically copied
  // into each serverless function's deploy bundle) doesn't follow sharp's
  // dynamically-loaded native binary (libvips-cpp.so) via normal require()
  // analysis — so it was loading the JS wrapper but missing its actual native
  // library on Netlify (ERR_DLOPEN_FAILED: libvips-cpp.so ... no such file).
  // This explicitly tells the tracer to include sharp's whole package
  // directory (binaries included) for the one route that uses it.
  outputFileTracingIncludes: {
    "/api/content/image": ["./node_modules/sharp/**/*"],
  },
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
