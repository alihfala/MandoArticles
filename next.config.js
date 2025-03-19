/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: 'https',
        hostname: 'picsum.photos' 
      },
      { 
        protocol: 'https',
        hostname: 'randomuser.me' 
      },
      { 
        protocol: 'https',
        hostname: 'ik.imagekit.io' 
      },
      { 
        protocol: 'http',
        hostname: 'localhost' 
      },
      { 
        protocol: 'https',
        hostname: 'placehold.co' 
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  experimental: {
    transpilePackages: ["@next-auth/prisma-adapter", "next-auth"]
  }
};

module.exports = nextConfig; 