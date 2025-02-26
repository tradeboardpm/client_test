// src/utils/getVersion.js
import { execSync } from "child_process";

export function getGitVersion() {
  // First check if version is provided via env variable
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return process.env.NEXT_PUBLIC_APP_VERSION;
  }

  try {
    // Try to get git version locally
    const tag = execSync("git describe --tags", { stdio: "pipe" })
      .toString()
      .trim();
    return tag.startsWith("v") ? tag.slice(1) : tag;
  } catch (error) {
    console.error("Error getting git version:", error);
    return "0.0.1";
  }
}
