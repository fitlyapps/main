import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const nextConfig = compat.extends("next/core-web-vitals", "next/typescript");

export default [
  {
    ignores: ["next-env.d.ts", "postcss.config.mjs", "eslint.config.mjs", ".next/**", "node_modules/**"]
  },
  ...nextConfig
];
