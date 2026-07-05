import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
const config = [...nextVitals, prettier];

export default config;
