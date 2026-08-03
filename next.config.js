const { getSecurityHeaders } = require('./lib/security-config.js')

const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  experimental: {
    // Remove if not using Server Components
    serverComponentsExternalPackages: ['mongodb'],
  },
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async redirects() {
    return [
      { source: '/app', destination: '/dashboard', permanent: false },
      { source: '/app/crm', destination: '/leadedge360', permanent: false },
      { source: '/app/sales', destination: '/leadedge360', permanent: false },
      { source: '/app/revenue', destination: '/retailedge360', permanent: false },
      { source: '/app/partners', destination: '/dashboard', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;
