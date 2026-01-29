import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  turbopack: {
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    config.externals = [...config.externals, { bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" }];
    
    return config;
  },
  env: {
    NEXT_PUBLIC_IAPP_ADDRESS: process.env.NEXT_PUBLIC_IAPP_ADDRESS,
  },
};

export default nextConfig;