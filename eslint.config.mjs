import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/", "node_modules/", ".vercel/", "out/", "build/", "next-env.d.ts"] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/triple-slash-reference": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn"
    }
  }
];

export default eslintConfig;
