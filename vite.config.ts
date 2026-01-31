import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import vCache from "@raegen/vite-plugin-vitest-cache";
import viteCompression from "vite-plugin-compression";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
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

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  build: {
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 2. tauri expects a fixed port, fail if that port is not available
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
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
