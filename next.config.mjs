/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/internal/notifications": ["./src/lib/notifications/templates/**/*.hbs"],
  },
};

export default nextConfig;
