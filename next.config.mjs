/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  /** Allow phone on LAN to load Next dev assets (HMR, chunks) from this host. */
  allowedDevOrigins: [
    '192.168.2.103',
    '192.168.1.132',
    'localhost',
    '127.0.0.1',
  ],
  async headers() {
    return [
      {
        // Public scan pages should never be indexed by search engines.
        source: '/t/:uid*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
