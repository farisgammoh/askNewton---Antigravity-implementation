import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/explain-policy',
        destination: '/explain',
        permanent: true,
      },
      {
        source: '/how-it-works',
        destination: '/how',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
