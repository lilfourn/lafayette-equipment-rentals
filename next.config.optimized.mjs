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
  
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"], // Use modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kimberrubblstg.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS
    scrollRestoration: true, // Better scroll restoration
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  
  // Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: true, // Generate ETags for caching
  
  // Configure module optimization
  webpack: (config, { isServer }) => {
    // Optimize chunks
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common components chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate large libraries
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            radix: {
              name: 'radix',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: 'all',
              priority: 25,
            },
          },
        },
        runtimeChunk: {
          name: 'runtime',
        },
      };
    }
    
    // Add performance hints
    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 512000, // 500KB
      maxAssetSize: 512000, // 500KB
    };
    
    return config;
  },
  
  // Optimized cache headers
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-cache, no-store, must-revalidate",
            },
          ],
        },
      ];
    }

    // Production caching with optimized values
    return [
      // Static assets - 1 year cache
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Images - 1 year cache
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Fonts - 1 year cache
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes - shorter cache
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      // HTML pages - short cache with revalidation
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=31536000, must-revalidate",
          },
        ],
      },
      // Security headers
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  
  // Optimize redirects and rewrites
  async rewrites() {
    return [
      {
        source: "/category%20images/:path*",
        destination: "/category%20images/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);