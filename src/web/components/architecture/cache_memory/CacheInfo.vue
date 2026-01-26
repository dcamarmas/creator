<script lang="ts">

import { defineComponent, type PropType } from "vue";

export default defineComponent({
    props: {
        target: {type: String, required: true},
        instruction: {type:Object, required: true},
        cache_type: {type: String, required: true},

    },
    // data() {
    //     return {

    //     }
    // },
    // methods: {
    //     pptarget(){

    //     }
    // },
    // computed: {

    // },
    // watch:{

    // }
});

</script>

<template>


    <div>
        <b-popover :target="target" triggers="hover focus" placement="bottom" html>
            <div>
                <span v-if="cache_type=='L1' && (instruction.L1_I == 3)"><font-awesome-icon icon="fa-regular fa-circle-check"></font-awesome-icon> There are hits on cache instruction access </span>
                <span v-if="cache_type=='L1' && (instruction.L1_I == 4)"><font-awesome-icon icon="fa-regular fa-circle-xmark"></font-awesome-icon> There are misses on cache instruction access </span>
                <span v-if="cache_type=='L1' && (instruction.L1_I == 1)"><font-awesome-icon icon="fa-solid fa-circle-exclamation"></font-awesome-icon> There are hits and misses on cache instruction access </span>
                <span v-if="cache_type=='L2' && (instruction.L2_I == 3)"><font-awesome-icon icon="fa-regular fa-circle-check"></font-awesome-icon> There are hits on cache instruction access </span>
                <span v-if="cache_type=='L2' && (instruction.L2_I == 4)"><font-awesome-icon icon="fa-regular fa-circle-xmark"></font-awesome-icon> There are misses on cache instruction access </span>
                <span v-if="cache_type=='L2' && (instruction.L2_I == 1)"><font-awesome-icon icon="fa-solid fa-circle-exclamation"></font-awesome-icon> There are hits and misses on cache instruction access </span>
            </div>
            <div>
                <span v-if="cache_type=='L1' && (instruction.L1_D == 3)"><font-awesome-icon icon="fa-regular fa-circle-check"></font-awesome-icon>There are Hits on cache data access </span>
                <span v-if="cache_type=='L1' && (instruction.L1_D == 4)"><font-awesome-icon icon="fa-regular fa-circle-xmark"></font-awesome-icon>There are Misses on cache data access </span>
                <span v-if="cache_type=='L1' && (instruction.L1_D == 1)"><font-awesome-icon icon="fa-solid fa-circle-exclamation"></font-awesome-icon>There are Hits and misses on cache data access </span>
                <span v-if="cache_type=='L2' && (instruction.L2_D == 3)"><font-awesome-icon icon="fa-regular fa-circle-check"></font-awesome-icon>There are Hits on cache data access </span>
                <span v-if="cache_type=='L2' && (instruction.L2_D == 4)"><font-awesome-icon icon="fa-regular fa-circle-xmark"></font-awesome-icon>There are Misses on cache data access </span>
                <span v-if="cache_type=='L2' && (instruction.L2_D == 1)"><font-awesome-icon icon="fa-solid fa-circle-exclamation"></font-awesome-icon>There are Hits and misses on cache data access </span>
            </div>
        </b-popover>


    </div>

</template>