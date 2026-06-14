import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@school-erp/shared", "@school-erp/ui"]
};

export default nextConfig;

