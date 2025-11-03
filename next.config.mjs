import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================
  // IMAGES & ASSETS
  // ========================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
    // Optimisation des images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ========================
  // COMPRESSION & PERFORMANCE
  // ========================
  compress: true,
  
  // Optimiser les imports des packages lourds
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-*',
      'lucide-react',
      '@hookform/resolvers',
      'zod',
    ],
  },

  // ========================
  // SÉCURITÉ - HEADERS HTTP
  // ========================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ========================
          // SÉCURITÉ DES FRAMES
          // ========================
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // ========================
          // SÉCURITÉ DES TYPES
          // ========================
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // ========================
          // SÉCURITÉ XSS
          // ========================
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },

          // ========================
          // POLITIQUE DE RÉFÉRENCE
          // ========================
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // ========================
          // PERMISSIONS & FEATURES
          // ========================
          {
            key: 'Permissions-Policy',
            value: [
              'geolocation=()',
              'microphone=()',
              'camera=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
            ].join(', '),
          },

          // ========================
          // HSTS (HTTPS obligatoire)
          // ========================
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },

          // ========================
          // CONTENT SECURITY POLICY (CSP)
          // ========================
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https: ws: wss:",
              "frame-src 'self' https://challenges.cloudflare.com",
              "form-action 'self'",
              "base-uri 'self'",
            ].join('; '),
          },

          // ========================
          // CACHING
          // ========================
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      // ========================
      // CACHING SPÉCIFIQUE POUR ASSETS
      // ========================
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ========================
      // CACHING SPÉCIFIQUE POUR IMAGES
      // ========================
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate',
          },
        ],
      },
    ];
  },

  // ========================
  // REDIRECTS & REWRITES
  // ========================
  async redirects() {
    return [
      // Redirect des URLs anciennes
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Rewrites pour API proxies si nécessaire
      ],
    };
  },

  // ========================
  // WEBPACK OPTIMIZATION
  // ========================
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Isoler les vendors lourds
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix',
          priority: 10,
          enforce: true,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide',
          priority: 10,
          enforce: true,
        },
        clerk: {
          test: /[\\/]node_modules[\\/]@clerk[\\/]/,
          name: 'clerk',
          priority: 10,
          enforce: true,
        },
        prisma: {
          test: /[\\/]node_modules[\\/]@prisma[\\/]/,
          name: 'prisma',
          priority: 10,
          enforce: true,
        },
      };
    }

    return config;
  },

  // ========================
  // LOGGING & DEBUGGING
  // ========================
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ========================
  // TYPESCRIPT
  // ========================
  typescript: {
    // ⚠️ À désactiver en production si tu as des erreurs TS non-bloquantes
    tsconfigPath: './tsconfig.json',
  },

  // ========================
  // SWCMINIFY OPTIMIZATION
  // ========================
  swcMinify: true,

  // ========================
  // TRAILINGSLASH
  // ========================
  trailingSlash: false,

  // ========================
  // STRICTHOSTCHECK
  // ========================
  strictHostCheck: false,
};

export default withAnalyzer(nextConfig);