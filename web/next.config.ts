import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001/api';

const backendOrigin = rawBackendUrl.replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Prevent indexing of admin and internal error pages.
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        // Next's internal not-found route appears as `/_not-found` in observability.
        source: '/_not-found',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.shutterstock.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eldisenoclothing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.purecountry.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hbsocialclub.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/api/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'nila-ecommerce.onrender.com',
        pathname: '/api/upload/**',
      },
    ],
  },
  // Use transpilePackages alone to avoid conflict with serverExternalPackages
  transpilePackages: ['@react-pdf/renderer', '@react-pdf/layout', '@react-pdf/pdfkit', '@react-pdf/primitives', '@react-pdf/render', '@react-pdf/stylesheet', '@react-pdf/types', '@react-pdf/font', '@react-pdf/image', '@react-pdf/unicode-properties', '@react-pdf/png-js'],
};

export default nextConfig;
