/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'ik.imagekit.io',
      'picsum.photos',
      'images.unsplash.com',
      'placehold.co'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Tell Next.js to generate specific pages only on-demand (not prerendered)
  unstable_staticGeneration: {
    // Don't prerender any pages that need session/auth
    noStaticImports: true,
    disableStaticGeneration: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/_not-found',
          destination: '/404',
        }
      ],
    };
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 