/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },

  /**
   * Headers de sécurité HTTP
   * Appliqués à toutes les réponses HTTP
   */
  async headers() {
    return [
      {
        source: "/(.*)", // S'applique à toutes les routes
        headers: [
          // ========================
          // SÉCURITÉ DES FRAMES
          // ========================
          {
            key: "X-Frame-Options",
            value: "DENY", // Ne pas permettre au site d'être dans une iframe
          },

          // ========================
          // SÉCURITÉ DES TYPES
          // ========================
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Forcer le navigateur à respecter le Content-Type
          },

          // ========================
          // SÉCURITÉ XSS
          // ========================
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // Activer la protection XSS du navigateur
          },

          // ========================
          // POLITIQUE DE RÉFÉRENCE
          // ========================
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Contrôler les infos de referrer
          },

          // ========================
          // PERMISSIONS & FEATURES
          // ========================
          {
            key: "Permissions-Policy",
            value: [
              "geolocation=()",
              "microphone=()",
              "camera=()",
            ].join(", "),
          },

          // ========================
          // HSTS (HTTPS obligatoire)
          // ========================
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains", // 1 an
          },
        ],
      },
    ];
  },

  /**
   * Content Security Policy (CSP)
   * Contrôle les ressources autorisées
   */
  async rewrites() {
    return {
      beforeFiles: [
        // Ajouter des CSP headers si nécessaire
      ],
    };
  },
};

export default nextConfig;