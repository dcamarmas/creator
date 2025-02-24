<script>
import { foo, baz } from "./stuff/mystuff.mjs";
import { bar } from "./stuff/mycoolstuff.mts";

export default {
  name: "app",
  data() {
    return { baz: baz };
  },
  methods: {
    call() {
      return foo() + bar();
    },
  },
};
</script>

<template>
  <p>{{ call() + baz }}</p>
  <div></div>
</template>
