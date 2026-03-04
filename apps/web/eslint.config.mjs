import { createRequire } from "module";

const require = createRequire(import.meta.url);

// eslint-config-next v16 exports a native ESLint v9 flat config array directly
const nextConfig = require("eslint-config-next");

export default nextConfig;
