/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * In development, we need to proxy API requests from the Next.js frontend (port 3000)
   * to the Express backend server (port 3001) to avoid CORS issues.
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.filebase.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '*.myfilebase.com', // Allow all subdomains of myfilebase.com
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
};

export default nextConfig;
