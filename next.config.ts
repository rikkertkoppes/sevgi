import type { NextConfig } from "next";
import pkg from "./package.json" assert { type: "json" };

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
    },
};

export default nextConfig;
