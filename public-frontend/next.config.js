const normalizeEnvUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, '').replace(/\/+$|\s+$/g, '');
};

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: normalizeEnvUrl(process.env.NEXT_PUBLIC_API_URL)
      || normalizeEnvUrl(process.env.PUBLIC_API_URL)
      || 'https://backend-omega-one-26.vercel.app/api/v1',
  },
};

export default nextConfig;
