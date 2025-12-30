import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    // 👇 Thêm dòng này để cho phép truy cập từ domain Cloudflare Tunnel
    allowedHosts: ["erpsystem.click", "api.erpsystem.click"],

    proxy: {
      "/api/sepay": {
        target: "https://my.sepay.vn",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/sepay/, "/userapi"),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader(
              "Authorization",
              "Bearer SKKOVQSAT7KI5YVOM0TFPM2U3Z4A1IDWIUHQPZ9BHETNGXDXS643NOWYCPM1BD8C"
            );
            proxyReq.setHeader("Content-Type", "application/json");
          });
        },
      },
    },
  },
});
