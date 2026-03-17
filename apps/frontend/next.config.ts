import type { NextConfig } from "next";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
