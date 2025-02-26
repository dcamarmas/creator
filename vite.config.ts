import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"
import Components from "unplugin-vue-components/vite"
import { BootstrapVueNextResolver } from "bootstrap-vue-next"
import wasm from "vite-plugin-wasm"

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
          "b-card": ["img-src"],
          CardAuthor: ["author_img"],
        },
      },
    }),
    vueDevTools(),
    Components({
      resolvers: [BootstrapVueNextResolver()],
    }),
    wasm(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist/web",
    emptyOutDir: true,
  },
})
