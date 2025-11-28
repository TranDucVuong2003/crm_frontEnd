import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api/sepay": {
        target: "https://my.sepay.vn",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/sepay/, "/userapi"),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader(
              "Authorization",
              "Bearer H21QI9SUFKJFCOBUYEDUVD2HIJFQA68OVCS5CLPA5RTP0PGXMWWVBKOHVWRINNRN"
            );
            proxyReq.setHeader("Content-Type", "application/json");
          });
        },
      },
    },
  },
});
