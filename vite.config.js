import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [dts({ rollupTypes: true })],
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
    },
});
