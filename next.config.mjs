import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable optimization for better lazy loading
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kimberrubblstg.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["kimberrubblstg.blob.core.windows.net"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  // Enable experimental features for better caching
  // Temporarily disabled to improve dev server startup time
  // experimental: {
  //   staleTimes: {
  //     dynamic: 30,
  //     static: 180,
  //   },
  // },
  // Cache configuration
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    // In development, disable all caching
    if (isDev) {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-cache, no-store, must-revalidate",
            },
            {
              key: "Pragma",
              value: "no-cache",
            },
            {
              key: "Expires",
              value: "0",
            },
          ],
        },
      ];
    }

    // Production caching
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/category%20images/:path*",
        destination: "/category%20images/:path*",
      },
    ];
  },
  async redirects() {
    return [
      // Redirect old URL patterns to new ones
      {
        source: '/en/equipment-rental/type/:type/baton-rouge-la',
        destination: '/en/equipment-rental/type/:type/lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/type/:type/baton-rouge-la',
        destination: '/es/equipment-rental/type/:type/lafayette-la',
        permanent: true,
      },
      {
        source: '/en/equipment-rental/type/:type/new-orleans-la',
        destination: '/en/equipment-rental/type/:type/lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/type/:type/new-orleans-la',
        destination: '/es/equipment-rental/type/:type/lafayette-la',
        permanent: true,
      },
      {
        source: '/en/equipment-rental/type/:type/lake-charles-la',
        destination: '/en/equipment-rental/type/:type/lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/type/:type/lake-charles-la',
        destination: '/es/equipment-rental/type/:type/lafayette-la',
        permanent: true,
      },
      // Redirect equipment pattern variations to canonical URLs
      {
        source: '/en/equipment-rental/make/:make',
        destination: '/en/equipment-rental/brand/:make-equipment-rental-lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/make/:make',
        destination: '/es/equipment-rental/brand/:make-equipment-rental-lafayette-la',
        permanent: true,
      },
      // Redirect trailing slash variations
      {
        source: '/en/equipment-rental/machines/:machineId/',
        destination: '/en/equipment-rental/machines/:machineId',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/machines/:machineId/',
        destination: '/es/equipment-rental/machines/:machineId',
        permanent: true,
      },
      // Redirect variations of Lafayette SEO URLs to canonical versions
      {
        source: '/en/equipment-rental/pricing/:type',
        destination: '/en/equipment-rental/pricing/:type-lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/pricing/:type',
        destination: '/es/equipment-rental/pricing/:type-lafayette-la',
        permanent: true,
      },
      {
        source: '/en/equipment-rental/guide/:type',
        destination: '/en/equipment-rental/guide/:type-lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/guide/:type',
        destination: '/es/equipment-rental/guide/:type-lafayette-la',
        permanent: true,
      },
      {
        source: '/en/equipment-rental/attachment/:type',
        destination: '/en/equipment-rental/attachment/:type-lafayette-la',
        permanent: true,
      },
      {
        source: '/es/equipment-rental/attachment/:type',
        destination: '/es/equipment-rental/attachment/:type-lafayette-la',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
