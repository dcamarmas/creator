import { fileURLToPath, URL } from "node:url";

import { defineConfig, PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import wasm from "vite-plugin-wasm";
import { DynamicPublicDirectory } from "vite-multiple-assets";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // convert paths such as '@'
      // see https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#asset-url-handling
      // https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/reference/images.html
      template: {
        transformAssetUrls: {
          img: ["src"],
          "b-img": ["src"],
          "b-card-img": ["src"],
          "b-card": ["img-src", "author_img"],
        },
      },
    }),

    vueDevTools(),

    Components({
      resolvers: [BootstrapVueNextResolver()],
    }),

    wasm(),

    ViteImageOptimizer(),

    // bundle assets with the build, that is, if we have /public/foo.png, it is
    // served in /foo.png
    DynamicPublicDirectory([
      "public/**", // bundle all files inside this folder
      // bundle these folders
      {
        input: "architecture/**",
        output: "architecture",
      },
      {
        input: "examples/**",
        output: "examples",
      },
      {
        input: "gateway/**",
        output: "/gateway",
      },
      {
        input: "docs/schema/**",
        output: "/schema",
      },
    ]) as PluginOption,
  ],

  publicDir: false, // we use a DynamicPublicDirectory

  resolve: {
    // aliases for common folders
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "#": fileURLToPath(new URL(".", import.meta.url)),
    },
  },

  base: "/" + (process.env.REPO ?? ""), // repository name (for github pages deployment)

  build: {
    outDir: "dist/web/creator",
    emptyOutDir: true,
    target: "esnext", // browsers can handle the latest ES features

    rollupOptions: {
      output: {
        // group libraries in chunks to reduce its size
        manualChunks: {
          fontawesome: [
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-brands-svg-icons",
            "@fortawesome/free-regular-svg-icons",
            "@fortawesome/free-solid-svg-icons",
            "@fortawesome/vue-fontawesome",
          ],
          bootstrap: ["bootstrap", "bootstrap-vue-next"],
          monaco: ["monaco-editor", "monaco-vim", "monaco-yaml"],
        },
      },
    },
  },

  // Silence Sass deprecation warnings (due to bootstrap-vue-next)
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["import", "color-functions", "global-builtin"],
      },
    },
  },
});
