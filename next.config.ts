import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.105", "192.168.56.1"],
  serverExternalPackages: ["sequelize", "sqlite3"],
};

export default nextConfig;
