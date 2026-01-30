import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }
    
    config.externals.push({
      bufferutil: 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
      encoding: 'encoding',
    });
    
    return config;
  },
  
  env: {
    NEXT_PUBLIC_IAPP_ADDRESS: process.env.NEXT_PUBLIC_IAPP_ADDRESS,
  },
};

export default nextConfig;