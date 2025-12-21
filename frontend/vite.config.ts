/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://atomgrad.site/api",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(
              "→ Proxying:",
              req.method,
              req.url,
              "→",
              proxyReq.path
            );
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("← Response:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
