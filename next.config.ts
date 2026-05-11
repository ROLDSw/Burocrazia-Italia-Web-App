import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impedisce il caricamento dell'app in un iframe (anti-clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Impedisce al browser di indovinare il MIME type (anti MIME-sniffing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limita le informazioni inviate nel Referer header
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disabilita funzionalità browser non necessarie
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.anthropic.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
