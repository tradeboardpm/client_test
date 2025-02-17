// next.config.mjs
import { execSync } from "child_process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["tradeboardjournals.s3.ap-south-1.amazonaws.com"],
  },
  env: {
    // Set this at build time
    NEXT_PUBLIC_APP_VERSION: (() => {
      try {
        const tag = execSync("git describe --tags", { stdio: "pipe" })
          .toString()
          .trim();
        return tag.startsWith("v") ? tag.slice(1) : tag;
      } catch (error) {
        // Check if version is provided via environment
        return process.env.NEXT_PUBLIC_APP_VERSION || "0.0.7";
      }
    })(),
  },
};

export default nextConfig;
