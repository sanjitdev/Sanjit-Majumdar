/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
};

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://plausible.io",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' https://plausible.io https://api.resend.com",
  "frame-src 'self' https://*.sanjit.dev",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig['headers']} */
const headers = async () => {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: ContentSecurityPolicy,
        },
      ],
    },
  ];
};

export default { ...nextConfig, headers };
