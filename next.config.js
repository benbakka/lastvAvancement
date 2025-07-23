/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' as it conflicts with rewrites
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Add rewrites to proxy API requests to backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // Updated to include /api prefix
      },
    ];
  },
};

module.exports = nextConfig;
