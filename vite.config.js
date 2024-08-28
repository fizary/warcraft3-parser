import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                mdx: resolve(import.meta.dirname, "src/mdx/index.ts"),
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: ["hexcod"],
        },
        outDir: "./lib",
        sourcemap: true,
    },
});
