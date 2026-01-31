import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import vCache from "@raegen/vite-plugin-vitest-cache";
import viteCompression from "vite-plugin-compression";

const host = process.env.TAURI_DEV_HOST;


// @ts-expect-error lint is acting weird
export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),
    vCache(),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],


  clearScreen: false,
  build: {
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {

      ignored: ["**/src-tauri/**"],
    },
  },
}));
