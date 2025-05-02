/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Resolve peer dependency issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force specific versions for problematic packages
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'date-fns': require.resolve('date-fns'),
    };
    return config;
  },
};

export default nextConfig;
