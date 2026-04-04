import type { NextConfig } from "next";

const apiProxyTargetFromEnv = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_PROXY_TARGET;

let normalizedApiProxyTarget = "";

if (apiProxyTargetFromEnv) {
  normalizedApiProxyTarget = apiProxyTargetFromEnv.replace(/\/$/, "");
} else if (process.env.NODE_ENV === "development") {
  normalizedApiProxyTarget = "http://localhost:5000";
}

let apiProxyDestination = "";

if (normalizedApiProxyTarget) {
  if (normalizedApiProxyTarget.endsWith("/api")) {
    apiProxyDestination = `${normalizedApiProxyTarget}/:path*`;
  } else {
    apiProxyDestination = `${normalizedApiProxyTarget}/api/:path*`;
  }
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyDestination) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: apiProxyDestination,
      },
    ];
  },
};

export default nextConfig;
