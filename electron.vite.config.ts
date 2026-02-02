import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vCache from "@raegen/vite-plugin-vitest-cache";

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
    plugins: [react(), tailwindcss(), vCache()],
    clearScreen: false,
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("pdfjs-dist")) return "pdfjs";
              if (id.includes("@react-pdf/renderer")) return "pdf-renderer";
              if (id.includes("lucide-react")) return "icons";
              if (
                id.includes("react-dropzone") ||
                id.includes("react-zoom-pan-pinch")
              )
                return "media";
              if (id.includes("react-lasso-select")) return "selection";

              if (
                id.includes("react") ||
                id.includes("@base-ui/react") ||
                id.includes("scheduler")
              ) {
                return "react-core";
              }

              if (
                id.includes("jszip") ||
                id.includes("clsx") ||
                id.includes("class-variance-authority") ||
                id.includes("tailwind-merge")
              ) {
                return "react-core";
              }

              return "vendor";
            }
            return undefined;
          },
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
        external: [],
      },
      minify: "terser",
      target: "es2020",
      sourcemap: false,
      outDir: "dist/renderer",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log"],
          dead_code: true,
          unused: true,
        },
        mangle: {
          safari10: true,
        },
      },
    },
    worker: {
      format: "es",
    },
    server: {
      port: 1420,
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "pdfjs-dist",
        "jszip",
        "lucide-react",
        "@base-ui/react",
      ],
      exclude: ["electron"],
    },
  },
});
