/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
  
  experimental: {
    optimizeCss: true,
    turbo: {
      resolveAlias: {
        '@': './src',
      },
    },
  },

  // Image optimization through Vercel
  images: {
    domains: [], // Add your image domains
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Headers for Vercel + Cloudflare
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production' 
              ? 'public, max-age=31536000, stale-while-revalidate'
              : 'no-cache, no-store, must-revalidate'
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },

  // Disable powered by header
  poweredByHeader: false,

  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    if (dev) {
      config.cache = false;
    }
    
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
              localIdentName: dev ? '[name]__[local]' : '[hash:base64:5]',
            },
          }
        },
        'postcss-loader'
      ],
      include: [
        /[\\/]node_modules[\\/]@uiw[\\/]react-md-editor[\\/]/,
        /[\\/]node_modules[\\/]@uiw[\\/]react-markdown-preview[\\/]/,
        /[\\/]src[\\/]styles[\\/]/
      ],
    });
    
    return config;
  },
}

module.exports = nextConfig
