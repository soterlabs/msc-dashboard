import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * "Supply Side Revenues" was renamed to "Settlement Revenues" — it named a
   * third of what the tab shows. The slug moved with the label, so anything
   * already shared under the old path keeps working rather than 404ing on
   * someone who was sent a link.
   *
   * Permanent, because the new path is the canonical one now.
   */
  async redirects() {
    return [
      {
        source: "/supply-side-revenues",
        destination: "/settlement-revenues",
        permanent: true,
      },
      {
        source: "/supply-side-revenues/:path*",
        destination: "/settlement-revenues/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
