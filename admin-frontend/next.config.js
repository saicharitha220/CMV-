const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.ADMIN_API_URL || 'https://backend-omega-one-26.vercel.app/api/v1',
  },
};

export default nextConfig;
