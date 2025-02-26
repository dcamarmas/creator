App.vue

```vue
<script>
import UserName from "./UserName.vue"

export default {
    components: { UserName },
    data() {
        return {
            first: "John",
            last: "Doe",
        }
    },
}
</script>

<template>
    <h1>{{ first }} {{ last }}</h1>
    <UserName v-model:first="first" v-model:last="last" />
</template>
```

UserName.vue

```vue
<script>
import Comp from "./Comp.vue"
export default {
    props: {
        first: String,
        last: String,
    },
    emits: ["update:first", "update:last"],
    components: { Comp },
}
</script>

<template>
    <Comp :first="first" :last="last" />
</template>
```

Comp.vue

```vue
<script>
export default {
    props: {
        first: String,
        last: String,
    },
    emits: ["update:first", "update:last"],
}
</script>

<template>
    <input
        type="text"
        :value="first"
        @input="$parent.$emit('update:first', $event.target.value)"
    />
    <input
        type="text"
        :value="last"
        @input="$parent.$emit('update:last', $event.target.value)"
    />
</template>
```

```vue
<script>
import CustomInput from "./CustomInput.vue"

export default {
    components: { CustomInput },
    data() {
        return {
            message: "hello",
        }
    },
}
</script>

<template><CustomInput v-model="message" /> {{ message }}</template>

<script>
export default {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit("update:modelValue", value)
            },
        },
    },
    methods: {
        tmp() {
            this.$emit("update:modelValue", "caca")
        },
    },
}
</script>

<template>
    <button v-on:click="tmp">{{ value }}</button>
    <input v-model="value" />
</template>
```
