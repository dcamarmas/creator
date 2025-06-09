import pluginVue from "eslint-plugin-vue";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from "@vue/eslint-config-typescript"
// configureVueProject({ scriptLangs: ["ts", "js"] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
  },

  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  skipFormatting,

  {
    rules: {
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts",
            allowNoLang: true,
          },
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "max-lines-per-function": [
        "error",
        {
          max: 60,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "vue/valid-v-for": "off",
      "vue/no-unused-vars": [
        "warn",
        {
          ignorePattern: "^_",
        },
      ],
      "vue/no-unused-components": "warn",
      eqeqeq: ["error", "always"],
      "max-depth": ["error", 5],
      "vue/multi-word-component-names": "off",
      "prefer-const": "warn",
      "no-loss-of-precision": "error",
      "no-unreachable-loop": "error",
      "no-var": "error",
      "no-useless-return": "error",
      "no-warning-comments": "warn",
      "operator-assignment": ["error", "always"],
      "prefer-regex-literals": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      radix: "error",
      "require-await": "error",
      yoda: "error",
      "no-constructor-return": "error",
      "no-duplicate-imports": "warn",
      "no-inner-declarations": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-unmodified-loop-condition": "error",
      "no-use-before-define": "error",
      "no-useless-assignment": "error",
      "require-atomic-updates": "warn",
      "class-methods-use-this": "error",
      "consistent-return": "error",
      "default-case": "error",
      "default-case-last": "warn",
      "dot-notation": "error",
      "max-params": ["warn", 5],
      "no-div-regex": "error",
      "no-empty-function": "warn",
      "no-implicit-coercion": "error",
      "no-invalid-this": "error",
      "no-iterator": "error",
      "no-lone-blocks": "error",
      "no-multi-assign": "error",
      "no-nested-ternary": "error",
      "no-new": "error",
      "no-new-func": "error",
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      "no-invalid-this": "off", // in Vue, inside arrow functions, `this` refers to the current component
    },
  },
)
