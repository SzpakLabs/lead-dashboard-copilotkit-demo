import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["app/layout.tsx"],
    rules: {
      "@next/next/no-css-tags": "off"
    }
  },
  {
    ignores: [".next/**", "node_modules/**", "drizzle/meta/**"]
  }
];

export default eslintConfig;
