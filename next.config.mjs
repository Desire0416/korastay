/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Formats modernes (AVIF/WebP) : payloads bien plus legers sur data mobile.
    formats: ["image/avif", "image/webp"],
    // Cache CDN des variantes optimisees (7 jours).
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Tailles adaptees a une audience mobile (petits ecrans en premier).
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 200, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
};

export default nextConfig;
