/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker production builds
  async rewrites() {
    // Use API_URL from env or default to localhost for local dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
    ];
  },
};

module.exports = nextConfig;
