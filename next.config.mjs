import path from 'path';
import { fileURLToPath } from 'url';

// __dirname is not defined in ES modules; reconstruct it for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  },
  // Silence workspace root inference warning by pinning the tracing root
  // to this app's directory. If you intentionally use a monorepo root
  // for shared deps, change this to `path.resolve(__dirname, '..')`.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
