const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  },
};

export default nextConfig;
