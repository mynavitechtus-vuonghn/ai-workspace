import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nodeModules = (...segments: string[]) =>
  path.join(projectRoot, "node_modules", ...segments);

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: nodeModules("tailwindcss"),
      "tw-animate-css": nodeModules("tw-animate-css"),
      "shadcn/tailwind.css": nodeModules("shadcn", "dist", "tailwind.css"),
    },
  },
};

export default nextConfig;
