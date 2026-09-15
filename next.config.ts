import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return ["supply-side-revenues", "settlement-revenues"].flatMap((slug) => [
      { source: `/${slug}`, destination: "/prime-agent-revenues", permanent: true },
      { source: `/${slug}/:path*`, destination: "/prime-agent-revenues/:path*", permanent: true },
    ]);
  },
};

export default nextConfig;
