import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vCache from "@raegen/vite-plugin-vitest-cache";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
      },
    },
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
            vendor: ["react", "react-dom", "@base-ui/react", "lucide-react"],
            image: ["react-dropzone", "react-zoom-pan-pinch", "react-pdf"],
            utils: ["jszip", "clsx"],
            pdf: ["pdfjs-dist"],
          },
        },
      },
      minify: "terser",
      target: "es2020",
      sourcemap: false,
      outDir: "dist/renderer",
    },
    optimizeDeps: {
      include: ["react", "react-dom", "pdfjs-dist", "jszip"],
    },
    worker: {
      format: "es",
    },
    server: {
      port: 1420,
    },
  },
});
