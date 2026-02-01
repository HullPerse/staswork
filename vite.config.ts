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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@base-ui/react", "lucide-react"],
          image: ["react-dropzone", "react-zoom-pan-pinch"],
          utils: ["jszip", "clsx"],
        },
      },
    },
    minify: "terser",
    target: "es2020",
    sourcemap: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
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
