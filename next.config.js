/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
  experimental: {
    turbo: {
      rules: {
        '*.md': ['markdownLoader'],
      },
      resolveAlias: {
        '@': './src',
      },
    },
  },
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
  images: {
    disableStaticImages: true
  }
}

module.exports = nextConfig
