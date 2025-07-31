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
      "max-lines-per-function": [
        "warn",
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      eqeqeq: ["error", "always"],
      "max-depth": ["warn", 5],
      "prefer-const": "warn",
      "no-loss-of-precision": "error",
      "no-unreachable-loop": "error",
      "no-var": "error",
      "no-useless-return": "error",
      "no-warning-comments": "off",
      "operator-assignment": ["warn", "always"],
      "prefer-regex-literals": "warn",
      "prefer-rest-params": "error",
      "prefer-spread": "warn",
      radix: "warn",
      "require-await": "error",
      yoda: "warn",
      "no-constructor-return": "error",
      "no-duplicate-imports": "warn",
      "no-inner-declarations": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-unmodified-loop-condition": "error",
      "no-use-before-define": ["error", { functions: false }],
      "no-useless-assignment": "error",
      "require-atomic-updates": "warn",
      "class-methods-use-this": "warn",
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
      "no-lone-blocks": "warn",
      "no-multi-assign": "error",
      "no-nested-ternary": "warn",
      "no-new": "error",
      "no-new-func": "error",
      "default-param-last": "warn",
      "func-names": ["warn", "never", { generators: "as-needed" }],
      "func-style": ["warn", "declaration", { allowArrowFunctions: true }],
      "guard-for-in": "error",
      "prefer-object-has-own": "error",
      "no-alert": "error",
      "no-array-constructor": "error",
      "no-lonely-if": "warn",
      "no-useless-concat": "warn",
      "no-void": "error",
      "object-shorthand": ["warn", "always", { avoidQuotes: true }],
      "prefer-exponentiation-operator": "warn",
      "prefer-numeric-literals": "warn",
      "prefer-object-spread": "warn",
      strict: "warn",

      /* TypeScript */

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

      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-ignore": "allow-with-description",
        },
      ],

      /* Vue */

      "vue/no-unused-components": "warn",
      "vue/multi-word-component-names": "off",
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts",
            allowNoLang: true,
          },
        },
      ],
      "vue/valid-v-for": "off",
      "vue/no-unused-vars": [
        "warn",
        {
          ignorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      "no-invalid-this": "off", // in Vue, inside arrow functions, `this` refers to the current component
    },
  },
);
